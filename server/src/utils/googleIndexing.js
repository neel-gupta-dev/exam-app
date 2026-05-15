import { google } from 'googleapis';

/**
 * Connects to Google's Web Search Indexing API to request real-time crawling.
 * Highly effective for getting new URLs indexed by Google bots within minutes.
 * 
 * @param {string} targetUrl - The full absolute URL to notify Google about (e.g. 'https://vayl.in/notes/doc/slug')
 * @param {string} type - Operation type: 'URL_UPDATED' or 'URL_DELETED'
 */
export const notifyGoogleOfUrl = async (targetUrl, type = 'URL_UPDATED') => {
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;

  // Fail silently/gracefully if keys aren't provisioned yet
  if (!clientEmail || !privateKey) {
    console.info(`[Google Indexing] Skipped: Credential env vars not configured.`);
    return null;
  }

  try {
    // Format the private key properly to fix newline formatting issues from env files
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    // 1. Initialize the Google JWT authentication client
    const jwtClient = new google.auth.JWT(
      clientEmail,
      null,
      formattedKey,
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    // 2. Authorize the request
    await jwtClient.authorize();

    // 3. Construct request payloads according to Indexing API v3
    const indexer = google.indexing('v3');
    const response = await indexer.urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: targetUrl,
        type: type // 'URL_UPDATED' requests indexing, 'URL_DELETED' requests removal
      }
    });

    console.log(`[Google Indexing] Successfully notified API for: ${targetUrl}. Type: ${type}`);
    return response.data;
  } catch (error) {
    // Log error but do NOT crash the main request chain
    console.error(`[Google Indexing] API Request Failed:`, error.response?.data || error.message);
    return null;
  }
};
