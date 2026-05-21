import asyncHandler from 'express-async-handler';
import StudyMaterial from '../models/StudyMaterial.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import { notifyGoogleOfUrl } from '../utils/googleIndexing.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://vayl.in';
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Upload new study material PDF (Admin Only)
 * @route   POST /api/study-materials
 * @access  Private/Admin
 */
export const createStudyMaterial = asyncHandler(async (req, res) => {
  const { title, subject, isPublished } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please provide a title for the study material.');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please select a PDF file to upload.');
  }

  // Prevent basic slug collisions early (pre-hook will generate from title)
  const temporarySlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const existingMaterial = await StudyMaterial.findOne({ slug: temporarySlug });
  if (existingMaterial) {
    res.status(409);
    throw new Error(`Study material with slug "${temporarySlug}" already exists. Please use a unique title.`);
  }

  try {
    // 1. Upload file stream to Cloudinary
    // Limit files to a specific Cloudinary subfolder for study material organization
    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      'vayl/study-materials',
      temporarySlug // Set the Cloudinary public_id to match our SEO slug
    );

    // 2. Record metadata in MongoDB
    const studyMaterial = await StudyMaterial.create({
      title,
      subject: subject || 'General',
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      fileSize: req.file.size,
      isPublished: isPublished !== undefined ? isPublished === 'true' : true,
    });

    // 3. Notify Google API of new URL for instant indexing in the background
    if (studyMaterial.isPublished) {
      const docUrl = `${FRONTEND_URL}/notes/doc/${studyMaterial.slug}`;
      notifyGoogleOfUrl(docUrl).catch((err) => 
        console.error('[Google Indexing] Silent background error:', err.message)
      );
    }

    res.status(201).json(studyMaterial);
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500);
    throw new Error(`Failed to upload study material: ${error.message}`);
  }
});

/**
 * @desc    Fetch all published study materials
 * @route   GET /api/study-materials
 * @access  Public
 */
export const getStudyMaterials = asyncHandler(async (req, res) => {
  const { subject, search } = req.query;
  const query = { isPublished: true };

  if (subject && subject !== 'All') {
    // Case-insensitive matching for subjects
    query.subject = { $regex: new RegExp(`^${escapeRegex(subject)}$`, 'i') };
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { subject: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const materials = await StudyMaterial.find(query)
    .sort({ createdAt: -1 })
    .lean();

  res.json(materials);
});

/**
 * @desc    Fetch all study materials including drafts (Admin Only)
 * @route   GET /api/study-materials/admin
 * @access  Private/Admin
 */
export const getAdminStudyMaterials = asyncHandler(async (req, res) => {
  const { subject, search } = req.query;
  const query = {}; // No restriction on isPublished for admins

  if (subject && subject !== 'All') {
    query.subject = { $regex: new RegExp(`^${escapeRegex(subject)}$`, 'i') };
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { subject: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const materials = await StudyMaterial.find(query)
    .sort({ createdAt: -1 })
    .lean();

  res.json(materials);
});

/**
 * @desc    Fetch single study material by slug
 * @route   GET /api/study-materials/slug/:slug
 * @access  Public
 */
export const getStudyMaterialBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const material = await StudyMaterial.findOne({ slug, isPublished: true }).lean();

  if (!material) {
    res.status(404);
    throw new Error('Study material not found');
  }

  res.json(material);
});

/**
 * @desc    Delete study material from server and Cloudinary (Admin Only)
 * @route   DELETE /api/study-materials/:id
 * @access  Private/Admin
 */
export const deleteStudyMaterial = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findById(req.params.id);

  if (!material) {
    res.status(404);
    throw new Error('Study material not found');
  }

  try {
    // 1. Remove asset from CloudinaryCDN
    if (material.cloudinaryPublicId) {
      await deleteFromCloudinary(material.cloudinaryPublicId);
    }

    // 2. Remove model instance from MongoDB
    await StudyMaterial.findByIdAndDelete(req.params.id);

    // 3. Notify Google API that URL was removed from index
    const docUrl = `${FRONTEND_URL}/notes/doc/${material.slug}`;
    notifyGoogleOfUrl(docUrl, 'URL_DELETED').catch((err) => 
      console.error('[Google Indexing] Silent delete background error:', err.message)
    );

    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to delete study material: ${error.message}`);
  }
});
