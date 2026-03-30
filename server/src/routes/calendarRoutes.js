import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middlewares/authMiddleware.js';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../services/calendarService.js';

const router = Router();

/**
 * @desc    Fetch Google Calendar events for the week
 * @route   GET /api/calendar/events
 * @access  Private
 */
router.get('/events', protect, asyncHandler(async (req, res) => {
  const { timeMin, timeMax } = req.query;
  const events = await listEvents(req.user._id, timeMin, timeMax);
  res.json({ success: true, events });
}));

/**
 * @desc    Create a new study session event on Google Calendar
 * @route   POST /api/calendar/events
 * @access  Private
 */
router.post('/events', protect, asyncHandler(async (req, res) => {
  const event = await createEvent(req.user._id, req.body);
  res.status(201).json({ success: true, event });
}));

/**
 * @desc    Update an existing calendar event
 * @route   PATCH /api/calendar/events/:id
 * @access  Private
 */
router.patch('/events/:id', protect, asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const event = await updateEvent(req.user._id, eventId, req.body);
  res.json({ success: true, event });
}));

/**
 * @desc    Delete a calendar event
 * @route   DELETE /api/calendar/events/:id
 * @access  Private
 */
router.delete('/events/:id', protect, asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  await deleteEvent(req.user._id, eventId);
  res.json({ success: true, message: 'Event deleted successfully' });
}));

export default router;
