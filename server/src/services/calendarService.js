import { google } from 'googleapis';
import User from '../models/User.js';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from '../config/index.js';

/**
 * Creates an authorized Google OAuth2 client for a specific user.
 * Automatically handles token refreshing if a refresh token is present.
 */
const getAuthClient = async (user) => {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiresAt ? new Date(user.googleTokenExpiresAt).getTime() : null,
  });

  // Check if token is expired and refresh if necessary
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
 * Lists events from the user's primary calendar within a given time range.
 */
export const listEvents = async (userId, timeMin, timeMax) => {
  const user = await User.findById(userId);
  if (!user || !user.googleCalendarLinked) {
    throw new Error('User not connected to Google Calendar');
  }

  const auth = await getAuthClient(user);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax || undefined,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items;
};

/**
 * Creates a new event in the user's primary calendar.
 */
export const createEvent = async (userId, eventData) => {
  const user = await User.findById(userId);
  if (!user || !user.googleCalendarLinked) {
    throw new Error('User not connected to Google Calendar');
  }

  const auth = await getAuthClient(user);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: eventData.summary || 'Vayl Study Session',
      location: eventData.location || 'Vayl Focus Room',
      description: eventData.description || 'Automated study session synced from Vayl.',
      start: {
        dateTime: eventData.start,
        timeZone: eventData.timeZone || 'UTC',
      },
      end: {
        dateTime: eventData.end,
        timeZone: eventData.timeZone || 'UTC',
      },
      colorId: eventData.colorId || '1', // Default blue-ish
      reminders: {
        useDefault: true,
      },
    },
  });

  return response.data;
};

/**
 * Updates an existing event in the user's primary calendar.
 */
export const updateEvent = async (userId, eventId, eventData) => {
  const user = await User.findById(userId);
  if (!user || !user.googleCalendarLinked) {
    throw new Error('User not connected to Google Calendar');
  }

  const auth = await getAuthClient(user);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: {
      summary: eventData.summary,
      description: eventData.description,
      start: eventData.start ? { dateTime: eventData.start } : undefined,
      end: eventData.end ? { dateTime: eventData.end } : undefined,
    },
  });

  return response.data;
};

/**
 * Deletes an event from the user's primary calendar.
 */
export const deleteEvent = async (userId, eventId) => {
  const user = await User.findById(userId);
  if (!user || !user.googleCalendarLinked) {
    throw new Error('User not connected to Google Calendar');
  }

  const auth = await getAuthClient(user);
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });

  return { success: true };
};
