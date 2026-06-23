import { Router } from 'express';
import { protectSuperAdmin } from '../middlewares/adminMiddleware.js';
import {
  createTenant,
  getAllTenants,
  bulkCreateStudents,
  createCoachingAdmin,
  getGroups,
  toggleTenant,
} from '../controllers/b2bController.js';

const router = Router();

// All B2B routes require superadmin
router.use(protectSuperAdmin);

// ─── TENANTS ──────────────────────────────────────────────────────────────────
router.post('/tenants', createTenant);
router.get('/tenants', getAllTenants);
router.patch('/tenants/:tenantId/toggle', toggleTenant);

// ─── TENANT STUDENTS ──────────────────────────────────────────────────────────
router.post('/tenants/:tenantId/students/bulk', bulkCreateStudents);
router.post('/tenants/:tenantId/admin', createCoachingAdmin);

// ─── GROUPS ───────────────────────────────────────────────────────────────────
router.get('/groups', getGroups);

export default router;
