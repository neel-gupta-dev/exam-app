import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
    },
    subdomain: {
      type: String,
      required: [true, 'Subdomain is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    /**
     * Short coaching code used in username generation.
     * e.g., "RST" for Resonance, "ALN" for Allen.
     * Must be unique and uppercase.
     */
    code: {
      type: String,
      required: [true, 'Coaching code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    contactEmail: {
      type: String,
      trim: true,
      default: '',
    },
    maxStudents: {
      type: Number,
      default: 500, // License seat limit
    },
    expiresAt: {
      type: Date,
      default: null, // null = no expiry
    },
    isActive: {
      type: Boolean,
      default: true, // false = instantly disable all coaching students
    },
  },
  { timestamps: true }
);

const Tenant = coreConnection.model('Tenant', tenantSchema);
export default Tenant;
