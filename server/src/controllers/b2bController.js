import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Group from '../models/Group.js';
import bcrypt from 'bcryptjs';

/**
 * Generate a collision-proof username from full name + coaching code + row index.
 * "Rahul Gupta" + "RST" + row 0 → "rahulgupta_rst_001"
 */
function generateUsername(fullName, coachingCode, rowIndex) {
  const base = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const seq = String(rowIndex + 1).padStart(3, '0');
  return `${base}_${coachingCode.toLowerCase()}_${seq}`;
}

function normalizeStudentRow(student, index) {
  const name = typeof student?.name === 'string' ? student.name.trim() : '';
  if (!name) {
    const error = new Error(`Student row ${index + 1} is missing a valid name.`);
    error.statusCode = 400;
    throw error;
  }
  if (name.length > 120) {
    const error = new Error(`Student row ${index + 1} name is too long.`);
    error.statusCode = 400;
    throw error;
  }
  if (!/[a-z0-9]/i.test(name)) {
    const error = new Error(`Student row ${index + 1} name must contain at least one letter or number.`);
    error.statusCode = 400;
    throw error;
  }
  return { name };
}

/**
 * @desc    Create a new Tenant (Coaching Institute)
 * @route   POST /api/b2b/tenants
 * @access  Admin
 */
export const createTenant = asyncHandler(async (req, res) => {
  const { name, subdomain, code, contactEmail, maxStudents, expiresAt } = req.body;

  // Check for duplicate code
  const existing = await Tenant.findOne({ code: code.toUpperCase() });
  if (existing) {
    res.status(400);
    throw new Error(`Coaching code "${code}" is already in use.`);
  }

  const tenant = await Tenant.create({
    name,
    subdomain,
    code: code.toUpperCase(),
    contactEmail: contactEmail || '',
    maxStudents: maxStudents || 500,
    expiresAt: expiresAt || null,
  });

  res.status(201).json(tenant);
});

/**
 * @desc    List all Tenants
 * @route   GET /api/b2b/tenants
 * @access  Admin
 */
export const getAllTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });

  // Attach student count per tenant
  const tenantsWithCounts = await Promise.all(
    tenants.map(async (t) => {
      const studentCount = await User.countDocuments({ tenantId: t._id, role: 'student' });
      return { ...t.toObject(), studentCount };
    })
  );

  res.json(tenantsWithCounts);
});

/**
 * @desc    Bulk upload students for a coaching via JSON (parsed from Excel on frontend)
 * @route   POST /api/b2b/tenants/:tenantId/students/bulk
 * @access  Admin
 *
 * Body: { students: [{ name, phone? }], defaultPassword: "Exam@2025" }
 */
export const bulkCreateStudents = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) {
    res.status(404);
    throw new Error('Tenant not found');
  }
  if (!tenant.isActive) {
    res.status(400);
    throw new Error('This coaching is currently deactivated.');
  }

  const { students, defaultPassword } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    res.status(400);
    throw new Error('Students array is required and must not be empty');
  }

  const normalizedStudents = students.map(normalizeStudentRow);
  const password = String(defaultPassword || 'Exam@2025');
  if (password.length < 6 || password.length > 128) {
    res.status(400);
    throw new Error('Default password must be between 6 and 128 characters');
  }

  // Check seat limit
  const currentCount = await User.countDocuments({ tenantId: tenant._id, role: 'student' });
  if (currentCount + normalizedStudents.length > tenant.maxStudents) {
    res.status(400);
    throw new Error(`Seat limit exceeded. Current: ${currentCount}, Trying to add: ${normalizedStudents.length}, Max: ${tenant.maxStudents}`);
  }

  // Hash password once (all students get the same default)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const createdUsers = [];
  const credentials = [];

  for (let i = 0; i < normalizedStudents.length; i++) {
    const { name } = normalizedStudents[i];
    const username = generateUsername(name, tenant.code, currentCount + i);

    try {
      const user = await User.create({
        name,
        email: `${username}@b2b.internal`, // Placeholder — never used for email
        username,
        password: hashedPassword,
        authMethod: 'b2b',
        role: 'student',
        tenantId: tenant._id,
        hasChangedPassword: false,
        isVerifiedStudent: true, // B2B students are pre-verified
        isOnboarded: true,       // Skip onboarding for B2B
      });

      createdUsers.push(user._id);
      credentials.push({ name, username }); // SECURITY: never return plaintext passwords
    } catch (err) {
      // If username collision, append random suffix
      if (err.code === 11000) {
        const fallbackUsername = `${username}_${Date.now().toString(36).slice(-3)}`;
        const user = await User.create({
          name,
          email: `${fallbackUsername}@b2b.internal`,
          username: fallbackUsername,
          password: hashedPassword,
          authMethod: 'b2b',
          role: 'student',
          tenantId: tenant._id,
          hasChangedPassword: false,
          isVerifiedStudent: true,
          isOnboarded: true,
        });
        createdUsers.push(user._id);
        credentials.push({ name, username: fallbackUsername });
      } else {
        throw err;
      }
    }
  }

  // Auto-create a Group for this batch
  const groupName = `${tenant.name} — Batch ${new Date().toISOString().slice(0, 10)}`;
  const group = await Group.create({
    name: groupName,
    coachingCode: tenant.code,
    tenantId: tenant._id,
    members: createdUsers,
    createdBy: req.user._id,
    isAutoGenerated: true,
  });

  res.status(201).json({
    message: `${createdUsers.length} students created successfully`,
    groupId: group._id,
    groupName: group.name,
    credentials, // Contains {name, username} only — frontend pairs with its own defaultPassword for CSV
  });
});

/**
 * @desc    Create a Coaching Admin account for a tenant
 * @route   POST /api/b2b/tenants/:tenantId/admin
 * @access  Admin
 */
export const createCoachingAdmin = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) {
    res.status(404);
    throw new Error('Tenant not found');
  }

  const { name, email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required for the coaching admin.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('A user with this email already exists.');
  }

  const user = await User.create({
    name: name || `${tenant.name} Admin`,
    email: email.toLowerCase(),
    password,
    authMethod: 'local',
    role: 'coachingAdmin',
    tenantId: tenant._id,
    isVerifiedStudent: true,
    isOnboarded: true,
  });

  res.status(201).json({
    message: 'Coaching admin created',
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

/**
 * @desc    List all groups (optionally filter by tenant)
 * @route   GET /api/b2b/groups
 * @access  Admin
 */
export const getGroups = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.tenantId) filter.tenantId = req.query.tenantId;

  const groups = await Group.find(filter)
    .populate('tenantId', 'name code')
    .sort({ createdAt: -1 });

  // Attach member count
  const result = groups.map((g) => ({
    ...g.toObject(),
    memberCount: g.members.length,
  }));

  res.json(result);
});

/**
 * @desc    Toggle tenant active/inactive
 * @route   PATCH /api/b2b/tenants/:tenantId/toggle
 * @access  Admin
 */
export const toggleTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) {
    res.status(404);
    throw new Error('Tenant not found');
  }

  tenant.isActive = !tenant.isActive;
  await tenant.save();

  res.json({ message: `Tenant ${tenant.isActive ? 'activated' : 'deactivated'}`, isActive: tenant.isActive });
});
