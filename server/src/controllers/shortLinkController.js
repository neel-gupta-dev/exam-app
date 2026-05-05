import ShortLink from '../models/ShortLink.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

export const createShortLink = asyncHandler(async (req, res) => {
  const { originalUrl, slug } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ message: 'Original URL is required' });
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

  // Update click count asynchronously
  link.clicks += 1;
  link.lastClickedAt = new Date();
  await link.save();

  res.redirect(301, link.originalUrl);
});
