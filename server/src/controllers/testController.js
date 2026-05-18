import asyncHandler from 'express-async-handler';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Group from '../models/Group.js';
import TestAttempt from '../models/TestAttempt.js';
import crypto from 'crypto';
import { getRedis } from '../config/redis.js';
import { parsePdfBuffer } from '../services/pdfParserService.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import MediaAsset from '../models/MediaAsset.js';

const normalizeQuestionPayload = (source, test, order) => {
  const content = source.content ?? source.text ?? source.questionText ?? '';
  const options = Array.isArray(source.options)
    ? source.options.map((option, index) => {
        const label = option.label || option.key || String.fromCharCode(65 + index);
        const optionContent = option.content ?? option.text ?? '';
        return {
          ...option,
          label,
          key: option.key || label,
          content: optionContent,
          text: option.text ?? optionContent,
        };
      })
    : [];

  return {
    tenantId: test.tenantId || undefined,
    testId: test._id,
    section: source.section || 'General',
    subject: source.subject || source.section || 'General',
    order,
    type: source.type || 'single',
    text: source.text ?? content,
    content,
    imageUrl: source.imageUrl || null,
    options,
    correctAnswer: source.correctAnswer,
    positiveMarks: source.positiveMarks ?? null,
    negativeMarks: source.negativeMarks ?? null,
    solution: source.solution || '',
    solutionImageUrl: source.solutionImageUrl || null,
    tags: source.tags || [],
    difficulty: source.difficulty || 'medium',
  };
};

/**
 * @desc    Create a new test (Admin only)
 * @route   POST /api/tests
 * @access  Admin
 */
export const createTest = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    durationMinutes,
    totalMarks,
    sections,
    visibility,
    targetGroups,
    targetTenants,
    defaultPositiveMarks,
    defaultNegativeMarks,
    scheduledStartAt,
    scheduledEndAt,
    syllabus,
    instructions,
  } = req.body;

  const test = await Test.create({
    title,
    description,
    category,
    durationMinutes,
    totalMarks,
    sections: sections || [],
    visibility: visibility || 'b2c_public',
    targetGroups: targetGroups || [],
    targetTenants: targetTenants || [],
    defaultPositiveMarks: defaultPositiveMarks || 4,
    defaultNegativeMarks: defaultNegativeMarks || 1,
    syllabus: syllabus || [],
    instructions: instructions || undefined,
    scheduledStartAt: scheduledStartAt || null,
    scheduledEndAt: scheduledEndAt || null,
    createdBy: req.user._id,
    isPublished: false,
  });

  res.status(201).json(test);
});

/**
 * @desc    Get all tests (Admin view — unfiltered)
 * @route   GET /api/tests/admin
 * @access  Admin
 */
export const getAllTestsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.visibility) filter.visibility = req.query.visibility;
  if (req.query.published === 'true') filter.isPublished = true;
  if (req.query.published === 'false') filter.isPublished = false;

  const [tests, total] = await Promise.all([
    Test.find(filter)
      .populate('targetTenants', 'name code')
      .populate('targetGroups', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Test.countDocuments(filter),
  ]);

  res.json({ tests, total, page, pages: Math.ceil(total / limit) });
});

/**
 * @desc    Get tests visible to the current student
 * @route   GET /api/tests
 * @access  Protected (students)
 *
 * This is THE core query that correctly returns tests based on
 * B2C vs B2B identity and group membership.
 */
export const getStudentTests = asyncHandler(async (req, res) => {
  const { _id: userId, tenantId, authMethod } = req.user;

  // Find all groups this user belongs to
  const userGroups = await Group.find({ members: userId }).distinct('_id');

  let audienceFilter;

  if (authMethod === 'b2b') {
    // B2B students: ONLY see tests assigned to their coaching or their groups
    audienceFilter = {
      $or: [
        { visibility: 'b2b_coaching', targetTenants: tenantId },
        { visibility: 'b2b_group', targetGroups: { $in: userGroups } },
      ],
    };
  } else {
    // B2C students: see public tests + group-targeted tests
    audienceFilter = {
      $or: [
        { visibility: 'b2c_public' },
        { visibility: 'b2c_group', targetGroups: { $in: userGroups } },
      ],
    };
  }

  const now = new Date();
  const rawTests = await Test.find({
    isPublished: true,
    ...audienceFilter
  })
    .select('title description category durationMinutes totalMarks sections syllabus instructions questionCount visibility scheduledStartAt scheduledEndAt')
    .sort({ createdAt: -1 });

  const redis = getRedis();
  const testIds = rawTests.map(t => t._id);
  const attempts = await TestAttempt.find({ userId, testId: { $in: testIds } })
    .sort({ createdAt: -1 })
    .lean();
  const latestAttemptByTest = new Map();
  for (const attempt of attempts) {
    const key = attempt.testId.toString();
    if (!latestAttemptByTest.has(key)) latestAttemptByTest.set(key, attempt);
  }

  const enrichedTests = await Promise.all(rawTests.map(async (t) => {
    const testObj = t.toObject();
    const attempt = latestAttemptByTest.get(t._id.toString());
    
    let state = 'default';
    let status = 'Not Started';
    let hasRedisSession = false;
    
    if (redis) {
      const sessionKey = `cbt_session:${userId.toString()}:${t._id.toString()}`;
      hasRedisSession = Boolean(await redis.exists(sessionKey));
    }

    if (hasRedisSession) {
      state = 'in-progress';
      status = 'In Progress';
    } else if (attempt) {
      if (attempt.status === 'in-progress') {
        state = 'in-progress';
        status = 'In Progress';
      } else if (attempt.status === 'completed' || attempt.status === 'auto-submitted') {
        state = 'completed';
        status = attempt.status === 'auto-submitted' ? 'Auto-submitted' : 'Completed';
      } else if (attempt.status === 'evaluating') {
        state = 'evaluating';
        status = 'Evaluating';
      }
    } else {
      const currentTime = new Date();
      if (t.scheduledStartAt && new Date(t.scheduledStartAt) > currentTime) {
        state = 'upcoming';
        status = 'Upcoming';
      } else if (t.scheduledEndAt && new Date(t.scheduledEndAt) < currentTime) {
        state = 'missed';
        status = 'Missed';
      }
    }
    
    return {
      ...testObj,
      state,
      status,
      latestAttemptId: attempt ? attempt._id : null,
    };
  }));

  res.json(enrichedTests);
});

/**
 * @desc    Get a single test by ID (admin detail)
 * @route   GET /api/tests/:id
 * @access  Admin
 */
export const getTestById = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id)
    .populate('targetTenants', 'name code')
    .populate('targetGroups', 'name');

  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  res.json(test);
});

/**
 * @desc    Update a test
 * @route   PATCH /api/tests/:id
 * @access  Admin
 */
export const updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  const allowed = [
    'title', 'description', 'category', 'durationMinutes', 'totalMarks',
    'sections', 'visibility', 'targetGroups', 'targetTenants',
    'defaultPositiveMarks', 'defaultNegativeMarks',
    'scheduledStartAt', 'scheduledEndAt', 'instructions', 'syllabus',
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) test[key] = req.body[key];
  }

  await test.save();
  res.json(test);
});

/**
 * @desc    Publish or unpublish a test
 * @route   PATCH /api/tests/:id/publish
 * @access  Admin
 */
export const togglePublish = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  test.isPublished = !test.isPublished;
  await test.save();

  // --- Redis-ready: when you add Redis, uncomment this block ---
  // if (test.isPublished) {
  //   const questions = await Question.find({ testId: test._id }).sort({ order: 1 });
  //   const payload = {
  //     ...test.toRedisPayload(),
  //     questions: questions.map(q => q.toStudentPayload()),
  //   };
  //   await redisClient.setex(`test_payload:${test._id}`, 3600, JSON.stringify(payload));
  // } else {
  //   await redisClient.del(`test_payload:${test._id}`);
  // }

  res.json({ message: `Test ${test.isPublished ? 'published' : 'unpublished'}`, isPublished: test.isPublished });
});

/**
 * @desc    Delete a test and its questions
 * @route   DELETE /api/tests/:id
 * @access  Admin
 */
export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  await Promise.all([
    Question.deleteMany({ testId: test._id }),
    Test.deleteOne({ _id: test._id }),
  ]);

  res.json({ message: 'Test and all its questions deleted.' });
});

// ─── QUESTION MANAGEMENT ──────────────────────────────────────────────────────

/**
 * @desc    Add a single question to a test
 * @route   POST /api/tests/:testId/questions
 * @access  Admin
 */
export const addQuestion = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId);
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  // Auto-assign order as next in sequence
  const lastQuestion = await Question.findOne({ testId: test._id }).sort({ order: -1 });
  const order = lastQuestion ? lastQuestion.order + 1 : 1;

  const question = await Question.create(normalizeQuestionPayload(req.body, test, order));

  // Update denormalized count
  test.questionCount = await Question.countDocuments({ testId: test._id });
  await test.save();

  res.status(201).json(question);
});

/**
 * @desc    Bulk add questions to a test (from Excel/JSON upload)
 * @route   POST /api/tests/:testId/questions/bulk
 * @access  Admin
 */
export const bulkAddQuestions = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId);
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  const { questions } = req.body; // Array of question objects
  if (!Array.isArray(questions) || questions.length === 0) {
    res.status(400);
    throw new Error('Questions array is required and must not be empty');
  }

  // Get current max order
  const lastQuestion = await Question.findOne({ testId: test._id }).sort({ order: -1 });
  let currentOrder = lastQuestion ? lastQuestion.order : 0;

  const docs = questions.map((q) => normalizeQuestionPayload(q, test, ++currentOrder));

  const inserted = await Question.insertMany(docs);

  // Update denormalized count
  test.questionCount = await Question.countDocuments({ testId: test._id });
  await test.save();

  res.status(201).json({ message: `${inserted.length} questions added`, count: inserted.length });
});

/**
 * @desc    Get all questions for a test (Admin — includes answers)
 * @route   GET /api/tests/:testId/questions
 * @access  Admin
 */
export const getTestQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({ testId: req.params.testId }).sort({ order: 1 });
  res.json(questions);
});

/**
 * @desc    Update a question
 * @route   PATCH /api/tests/:testId/questions/:questionId
 * @access  Admin
 */
export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.questionId, testId: req.params.testId });
  if (!question) {
    res.status(404);
    throw new Error('Question not found');
  }

  const allowed = ['section', 'order', 'type', 'content', 'imageUrl', 'contentTable', 'options', 'correctAnswer', 'positiveMarks', 'negativeMarks', 'solution', 'solutionImageUrl', 'tags', 'difficulty', 'matrixRows', 'matrixColumns', 'markingSchemeOverride', 'parentQuestionId'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) question[key] = req.body[key];
  }

  await question.save();
  res.json(question);
});

/**
 * @desc    Delete a question
 * @route   DELETE /api/tests/:testId/questions/:questionId
 * @access  Admin
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOneAndDelete({ _id: req.params.questionId, testId: req.params.testId });
  if (!question) {
    res.status(404);
    throw new Error('Question not found');
  }

  // Update denormalized count
  const test = await Test.findById(req.params.testId);
  if (test) {
    test.questionCount = await Question.countDocuments({ testId: test._id });
    await test.save();
  }

  res.json({ message: 'Question deleted' });
});

/**
 * @desc    Import questions from a PDF file
 * @route   POST /api/tests/:testId/questions/import-pdf
 * @access  Admin
 */
export const importPdfQuestions = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId);
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No PDF file uploaded');
  }

  // Parse the PDF buffer
  const { questions, stats } = await parsePdfBuffer(req.file.buffer, {
    section: req.body.section || null,
    type: req.body.type || null,
    positiveMarks: req.body.positiveMarks ? Number(req.body.positiveMarks) : test.defaultPositiveMarks,
    negativeMarks: req.body.negativeMarks ? Number(req.body.negativeMarks) : test.defaultNegativeMarks,
  });

  if (questions.length === 0) {
    res.status(422);
    return res.json({
      message: stats.error || 'Could not parse any questions from this PDF',
      textSample: stats.textSample || null,
    });
  }

  // If mode=preview, just return parsed questions without saving
  if (req.body.mode === 'preview') {
    return res.json({ questions, stats });
  }

  // Otherwise, insert into DB
  const lastQuestion = await Question.findOne({ testId: test._id }).sort({ order: -1 });
  let currentOrder = lastQuestion ? lastQuestion.order : 0;

  const docs = questions.map(q => {
    const { _meta, ...rest } = q;
    return {
      ...normalizeQuestionPayload(rest, test, ++currentOrder),
    };
  });

  const inserted = await Question.insertMany(docs);

  // Update denormalized count
  test.questionCount = await Question.countDocuments({ testId: test._id });
  await test.save();

  res.status(201).json({
    message: `${inserted.length} questions imported from PDF`,
    count: inserted.length,
    stats,
  });
});

/**
 * @desc    Upload a question/option image for a test
 * @route   POST /api/tests/:testId/images
 * @access  Admin
 */
export const uploadTestImage = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId);
  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please select an image to upload.');
  }

  if (!req.file.mimetype?.startsWith('image/')) {
    res.status(400);
    throw new Error('Only image uploads are allowed for test questions.');
  }

  const safePurpose = String(req.body.purpose || 'question')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .slice(0, 40) || 'question';
  const publicId = `${safePurpose}-${Date.now()}`;

  try {
    const fileHash = crypto.createHash('md5').update(req.file.buffer).digest('hex');
    
    // Check for existing file
    const existingAsset = await MediaAsset.findOne({ hash: fileHash });
    if (existingAsset) {
      return res.status(200).json({
        url: existingAsset.url,
        publicId: existingAsset.publicId,
        format: existingAsset.format,
        bytes: existingAsset.bytes,
        fromCache: true
      });
    }

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      `vayl/tests/${test._id}`,
      publicId
    );

    // Save to MediaAsset collection
    await MediaAsset.create({
      hash: fileHash,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      uploadedBy: req.user?._id
    });

    res.status(201).json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      format: uploadResult.format,
    });
  } catch (error) {
    console.error('[Test Image Upload] Cloudinary upload failed:', error);
    res.status(500);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
});

/**
 * @desc    Get public test details for shareable links
 * @route   GET /api/tests/:testId/share-details
 * @access  Public
 */
export const getShareDetails = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId).select(
    'title description totalMarks durationMinutes category isPublished scheduledStartAt scheduledEndAt sections'
  );

  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  if (!test.isPublished) {
    res.status(403);
    throw new Error('This test is not yet public');
  }

  res.json(test);
});
