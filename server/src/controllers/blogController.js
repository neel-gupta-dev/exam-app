import asyncHandler from 'express-async-handler';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

/**
 * GET /api/blogs
 * Fetch all published blogs, sorted newest first.
 * Returns selected fields + a 200-char content snippet.
 */
export const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ isPublished: true })
    .select('title slug coverImageUrl author category readTime createdAt content')
    .sort({ createdAt: -1 })
    .lean();

  // Create a plain-text snippet from the markdown content
  const result = blogs.map((blog) => ({
    _id: blog._id,
    title: blog.title,
    slug: blog.slug,
    coverImageUrl: blog.coverImageUrl,
    author: blog.author,
    category: blog.category,
    readTime: blog.readTime,
    createdAt: blog.createdAt,
    snippet: blog.content
      .replace(/[#*_`~>\[\]!\-\(\)]/g, '') // strip markdown syntax
      .replace(/\n+/g, ' ')                // collapse newlines
      .trim()
      .substring(0, 200),
  }));

  res.json(result);
});

/**
 * GET /api/blogs/:slug
 * Fetch a single blog by slug, along with its comments.
 */
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug, isPublished: true }).lean();
  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  const comments = await Comment.find({ blogId: blog._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ ...blog, comments });
});

/**
 * POST /api/blogs
 * Create a new blog post. Protected by protectAdmin middleware.
 */
export const createBlog = asyncHandler(async (req, res) => {
  const { title, slug, content, coverImageUrl, author, category, readTime } = req.body;

  if (!title || !content || !author) {
    res.status(400);
    throw new Error('Title, content, and author are required.');
  }

  // Check for slug collision
  if (slug) {
    const existing = await Blog.findOne({ slug });
    if (existing) {
      res.status(409);
      throw new Error(`A blog post with slug "${slug}" already exists.`);
    }
  }

  const blog = await Blog.create({
    title,
    slug: slug || undefined, // let pre-validate hook generate if empty
    content,
    coverImageUrl: coverImageUrl || '',
    author,
    category: category || 'General',
    readTime: readTime || '5 min',
  });

  res.status(201).json(blog);
});

/**
 * POST /api/blogs/:slug/comments
 * Add a comment to a blog post. Requires authenticated user.
 */
export const addComment = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Comment text is required.');
  }

  const blog = await Blog.findOne({ slug, isPublished: true });
  if (!blog) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  const comment = await Comment.create({
    blogId: blog._id,
    userId: req.user._id,
    authorName: req.user.name,
    text: text.trim(),
  });

  res.status(201).json(comment);
});
