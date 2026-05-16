import ShortLink from '../models/ShortLink.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

/**
 * Validates that a URL is a safe, external http/https URL.
 * Rejects javascript:, data:, ftp:, file:, and private/internal addresses.
 */
const isSafeRedirectUrl = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and loopback
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) return false;
    if (hostname === '[::1]' || hostname === '0.0.0.0') return false;
    if (/^127\./.test(hostname)) return false;

    // Block private IP ranges
    if (/^10\./.test(hostname)) return false;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) return false;
    if (/^192\.168\./.test(hostname)) return false;

    // Block cloud metadata endpoints
    if (hostname === '169.254.169.254') return false;

    return true;
  } catch {
    return false;
  }
};

export const createShortLink = asyncHandler(async (req, res) => {
  const { originalUrl, slug } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ message: 'Original URL is required' });
  }

  // SECURITY: Validate the URL to prevent open redirect attacks
  if (!isSafeRedirectUrl(originalUrl)) {
    return res.status(400).json({
      message: 'Invalid URL. Only public http/https URLs are allowed.',
    });
  }

  let finalSlug = slug;
  if (!finalSlug) {
    // Generate random slug if not provided
    finalSlug = crypto.randomBytes(3).toString('hex'); // 6 characters
  } else {
    // Check if slug already exists
    const existing = await ShortLink.findOne({ slug: finalSlug.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Slug already in use' });
    }
  }

  const shortLink = new ShortLink({
    originalUrl,
    slug: finalSlug.toLowerCase(),
    createdBy: req.user?._id
  });

  await shortLink.save();
  res.status(201).json(shortLink);
});

export const getAllShortLinks = asyncHandler(async (req, res) => {
  const links = await ShortLink.find().sort({ createdAt: -1 });
  res.json(links);
});

export const deleteShortLink = asyncHandler(async (req, res) => {
  const link = await ShortLink.findByIdAndDelete(req.params.id);
  if (!link) return res.status(404).json({ message: 'Link not found' });
  res.json({ message: 'Link deleted successfully' });
});

// The actual Redirect logic
export const handleRedirect = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const link = await ShortLink.findOne({ slug: slug.toLowerCase() });

  if (!link) {
    return res.status(404).send('Link not found');
  }

  // Fire-and-forget click counter — don't block the redirect
  ShortLink.updateOne(
    { _id: link._id },
    { $inc: { clicks: 1 }, $set: { lastClickedAt: new Date() } }
  ).catch((err) => console.error('[ShortLink] Click update failed:', err.message));

  res.redirect(301, link.originalUrl);
});
