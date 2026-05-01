import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        return this.authMethod === 'local';
      },
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authMethod: {
      type: String,
      enum: ['local', 'google', 'b2b'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'coachingAdmin'],
      default: 'student',
    },
    /**
     * B2B-only: login username (e.g., rahulgupta_RST_001).
     * Null for B2C users who log in via email.
     */
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    /**
     * B2B: set to false on bulk creation, forces password change on first login.
     * B2C: always true (no enforcement).
     */
    hasChangedPassword: {
      type: Boolean,
      default: true,
    },
    isVerifiedStudent: {
      type: Boolean,
      default: false,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
    },
    targetExam: {
      type: [String],
      default: [],
    },
    targetYear: {
      type: Number,
      default: null,
    },
    vaultId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: '',
    },
    targetScore: {
      type: String,
      default: '',
    },
    totalActiveSeconds: {
      type: Number,
      default: 0,
    },
    dailyGoalMinutes: {
      type: Number,
      default: 0,  // 0 = no goal set
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: String,
      default: null,
    },
    level: {
      type: Number,
      default: 1,
    },
    profile: {
      dreamColleges: { type: [String], default: [] },
      currentCoaching: { type: String, default: '' },
      academicLevel: { 
        type: String, 
        enum: ['', '11th', '12th', 'Dropper'], 
        default: '' 
      },
    },
    /**
     * analytics — Derived State Cache
     *
     * NOTE: These values are intentionally kept here for fast UI rendering
     * (e.g. Dashboard stat cards). They are DERIVED STATE — incrementally
     * maintained by controllers and do NOT replace the raw event log.
     *
     * The ground truth for all analytics is the ActivityLog collection.
     * These fields should be treated as a read-optimised cache (CQRS-style),
     * never as the primary source of truth for ML pipelines.
     */
    analytics: {
      subjectDistribution: {
        type: Map,
        of: Number,
        default: {},
      },
      searchHistory: [
        {
          term: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
      studyConfidence: { type: Number, default: 0 },
      studyConfidenceCount: { type: Number, default: 0 },
      resourceCount: { type: Number, default: 0 },
    },
    preferences: {
      preferredResourceType: {
        type: String,
        enum: ['video', 'pdf', 'mixed', ''],
        default: '',
      },
    },
    // Google Classroom Integration
    googleAccessToken: {
      type: String,
      default: null,
    },
    googleRefreshToken: {
      type: String,
      default: null,
    },
    googleTokenExpiresAt: {
      type: Date,
      default: null,
    },
    googleClassroomLinked: {
      type: Boolean,
      default: false,
    },
    googleCalendarLinked: {
      type: Boolean,
      default: false,
    },
    /**
     * lastActiveAt — Activity Timestamp
     *
     * Updated on every authenticated API call via the auth middleware.
     * Used for:
     * - Daily streak calculations
     * - Churn prediction (ML signal: days since last active)
     * - Session continuity detection
     *
     * More granular than `lastLoginDate` (which only tracks logins).
     * Indexed for efficient range queries in analytics dashboards.
     */
    lastActiveAt: {
      type: Date,
      default: null,
      index: true,
    },
    /**
     * battleLastSeen — Battle Lobby Heartbeat
     *
     * Updated every time a user polls /battle/online-count from the lobby.
     * Used to count "online" players on the battle platform.
     * A user is considered online if seen within the last 45 seconds.
     */
    battleLastSeen: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  // Safety checking: If the password already looks like a bcrypt hash ($2b$ or $2a$), 
  // skip hashing to avoid re-hashing the hash (which breaks original password).
  if (this.password && (this.password.startsWith('$2b$') || this.password.startsWith('$2a$'))) {
    return;
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // If user authenticated via Google and has no password set, reject immediately.
  if (!this.password) return false;
  
  // Explicitly trim candidate password to match backend diagnosis
  const candidate = enteredPassword?.trim();
  if (!candidate) return false;
  
  return await bcrypt.compare(candidate, this.password);
};

userSchema.virtual('levelData').get(function() {
  const hours = (this.totalActiveSeconds || 0) / 3600;
  const streak = this.currentStreak || 0;
  const resources = this.analytics?.resourceCount || 0;
  const totalXP = (hours * 50) + (streak * 3) + (resources * 10);
  
  if (totalXP === 0) {
    return {
      currentLevel: 1,
      totalXP: 0,
      progressToNext: 0,
      xpRemaining: 50
    };
  }

  const currentLevel = Math.max(1, Math.floor(Math.pow(totalXP / 50, 0.7)));
  
  const nextLevelXP = Math.pow(currentLevel + 1, 1 / 0.7) * 50;
  const currentLevelXP = Math.pow(currentLevel, 1 / 0.7) * 50;
  
  const progressToNext = (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;
  
  return {
    currentLevel,
    totalXP: Math.round(totalXP),
    progressToNext: Math.max(0, Math.min(100, progressToNext)),
    xpRemaining: Math.max(0, Math.round(nextLevelXP - totalXP))
  };
});

const User = mongoose.model('User', userSchema);
export default User;
