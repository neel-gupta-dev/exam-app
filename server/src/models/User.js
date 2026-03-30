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
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authMethod: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
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
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
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
