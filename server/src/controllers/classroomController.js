import { google } from 'googleapis';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from '../config/index.js';

/**
 * Configure Google OAuth2 client for a specific user
 * Automatically refreshes the token if needed.
 */
const getOAuth2Client = async (user) => {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiresAt ? user.googleTokenExpiresAt.getTime() : null,
  });

  // Listen for tokens being refreshed
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      user.googleAccessToken = tokens.access_token;
      if (tokens.expiry_date) {
        user.googleTokenExpiresAt = new Date(tokens.expiry_date);
      }
      await user.save();
    }
  });

  return oauth2Client;
};

/**
 * GET List of Courses
 */
export const getCourses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
  if (!user.googleAccessToken) {
    return res.status(401).json({ message: 'Google Classroom is not connected. Please connect your account first.' });
  }

  const auth = await getOAuth2Client(user);
  const classroom = google.classroom({ version: 'v1', auth });

  try {
    const { data } = await classroom.courses.list({
      courseStates: ['ACTIVE'],
      pageSize: 20
    });

    res.json({
      courses: data.courses || [],
      total: data.courses?.length || 0
    });
  } catch (error) {
    console.error('[Classroom] Failed to fetch courses:', error);
    res.status(500).json({ message: 'Failed to fetch Classroom courses', error: error.message });
  }
});

/**
 * GET Assignments for a specific course
 */
export const getCoursework = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const user = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
  
  const auth = await getOAuth2Client(user);
  const classroom = google.classroom({ version: 'v1', auth });

  try {
    const { data } = await classroom.courses.courseWork.list({
      courseId,
      pageSize: 50,
      orderBy: 'dueDate desc'
    });

    res.json({
      courseWork: data.courseWork || [],
      total: data.courseWork?.length || 0
    });
  } catch (error) {
    console.error('[Classroom] Failed to fetch coursework:', error);
    res.status(500).json({ message: 'Failed to fetch Classroom assignments', error: error.message });
  }
});

/**
 * GET All Assignments across all courses (Synced Overview)
 */
export const getAllAssignments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
  const auth = await getOAuth2Client(user);
  const classroom = google.classroom({ version: 'v1', auth });

  try {
    const { data: courseData } = await classroom.courses.list({
      courseStates: ['ACTIVE']
    });

    if (!courseData.courses || courseData.courses.length === 0) {
      return res.json({ assignments: [] });
    }

    // Fetch coursework for all courses in parallel
    const assignmentPromises = courseData.courses.map(course => 
      classroom.courses.courseWork.list({ courseId: course.id, pageSize: 10 })
        .then(res => (res.data.courseWork || []).map(cw => ({ ...cw, courseName: course.name })))
    );

    const results = await Promise.all(assignmentPromises);
    const flatAssignments = results.flat().sort((a, b) => {
      // Sort by due date if available
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const dateA = new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day);
      const dateB = new Date(b.dueDate.year, b.dueDate.month - 1, b.dueDate.day);
      return dateA.getTime() - dateB.getTime();
    });

    res.json({ assignments: flatAssignments });
  } catch (error) {
    console.error('[Classroom] Error aggregating assignments:', error);
    res.status(500).json({ message: 'Failed to aggregate Classroom assignments', error: error.message });
  }
});

/**
 * GET List all stream items (Announcements + Coursework + Materials)
 * Fetches the unified classroom "Stream".
 */
export const getAnnouncements = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const user = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken');

  if (!user || !user.googleAccessToken) {
    return res.status(401).json({ message: 'Google account not linked' });
  }

  const oauth2Client = await getOAuth2Client(user);
  const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

  try {
    // Fetch in parallel with individual error handling (Fail-Soft)
    const [announRes, courseworkRes, materialsRes] = await Promise.allSettled([
      classroom.courses.announcements.list({ courseId, pageSize: 20 }),
      classroom.courses.courseWork.list({ courseId, pageSize: 20 }),
      classroom.courses.courseWorkMaterials.list({ courseId, pageSize: 20 })
    ]);

    // Deep Logging for debugging "No announcements" issue
    if (announRes.status === 'rejected') console.warn(`[Classroom] Announcements fetch failed for ${courseId}:`, announRes.reason?.message);
    if (courseworkRes.status === 'rejected') console.warn(`[Classroom] Coursework fetch failed for ${courseId}:`, courseworkRes.reason?.message);
    if (materialsRes.status === 'rejected') console.warn(`[Classroom] Materials fetch failed for ${courseId}:`, materialsRes.reason?.message);

    // Tag and merge only successful responses
    const announcements = announRes.status === 'fulfilled' 
      ? (announRes.value.data.announcements || []).map(a => ({ ...a, vaylType: 'announcement' }))
      : [];
      
    const coursework = courseworkRes.status === 'fulfilled'
      ? (courseworkRes.value.data.courseWork || []).map(c => ({ ...c, vaylType: 'assignment', text: c.description || c.title }))
      : [];
      
    const materials = materialsRes.status === 'fulfilled'
      ? (materialsRes.value.data.courseWorkMaterials || []).map(m => ({ ...m, vaylType: 'material', text: m.description || m.title }))
      : [];

    const unifiedStream = [...announcements, ...coursework, ...materials]
      .sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));

    res.json({ announcements: unifiedStream });
  } catch (error) {
    console.error(`[Classroom] Unified Stream CRITICAL failure for ${courseId}:`, error);
    res.status(500).json({ message: 'Failed to access Classroom stream', error: error.message });
  }
});
