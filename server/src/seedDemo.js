import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Tenant from './models/Tenant.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // 1. Create a Tenant
    let tenant = await Tenant.findOne({ code: 'RSN' });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'Resonance JEE',
        code: 'RSN',
        subdomain: 'resonance',
        contactEmail: 'contact@resonance.com',
        maxStudents: 500,
        isActive: true
      });
      console.log('Tenant Created: Resonance JEE (RSN)');
    }

    // 2. Create a Coaching Admin
    const adminEmail = 'admin@resonance.com';
    let coachingAdmin = await User.findOne({ email: adminEmail });
    if (!coachingAdmin) {
      coachingAdmin = await User.create({
        name: 'Resonance Admin',
        email: adminEmail,
        password: 'Admin@123',
        role: 'coachingAdmin',
        authMethod: 'local',
        tenantId: tenant._id,
        isVerifiedStudent: true,
        isOnboarded: true
      });
      console.log('Coaching Admin Created: admin@resonance.com / Admin@123');
    }

    // 3. Create a B2B Student (Unchanged Password)
    const studentUser = 'rahul_rsn_001';
    let student = await User.findOne({ username: studentUser });
    if (!student) {
      student = await User.create({
        name: 'Rahul Gupta',
        email: 'rahul_rsn_001@b2b.internal',
        username: studentUser,
        password: 'Exam@2025',
        role: 'student',
        authMethod: 'b2b',
        tenantId: tenant._id,
        hasChangedPassword: false, // This will trigger the ForcePasswordChange screen
        isVerifiedStudent: true,
        isOnboarded: true
      });
      console.log('B2B Student Created: rahul_rsn_001 / Exam@2025');
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log('Student Login: Use Coaching Tab -> rahul_rsn_001 / Exam@2025');
    console.log('Coaching Admin: admin@resonance.com / Admin@123');
    console.log('------------------------');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
