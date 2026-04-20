/**
 * Seed script: create demo user accounts for hackathon presentation.
 *
 * Creates one farmer and one worker with complete profiles.
 * Safe to run multiple times — skips users that already exist.
 *
 * Run with: node backend/scripts/seedDemoUsers.js
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'kissansetu';

const DEMO_FARMER = {
  phone: '919876500001',
  isVerified: true,
  roles: ['farmer'],
  activeRole: 'farmer',
  farmerProfile: {
    name: 'Ramesh Kumar',
    age: 42,
    gender: 'male',
    location: {
      village: 'Rampur',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
    },
    landAcres: 5,
    crops: ['wheat', 'rice', 'sugarcane'],
    annualIncome: 120000,
    hasAadhaar: true,
    hasBankAccount: true,
    profilePicUrl: '',
    bio: 'Small farmer from Lucknow with 5 acres of land. Grows wheat and rice.',
  },
  workerProfile: null,
  equipmentProfile: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: null,
  reportCount: 0,
  suspendedUntil: null,
  isDeleted: false,
  deletionRequestedAt: null,
};

const DEMO_WORKER = {
  phone: '919876500002',
  isVerified: true,
  roles: ['worker'],
  activeRole: 'worker',
  farmerProfile: null,
  workerProfile: {
    name: 'Suresh Yadav',
    skills: ['ploughing', 'sowing', 'tractor_operation', 'harvesting'],
    dailyRate: 500,
    experience: 8,
    available: true,
    location: {
      village: 'Sultanpur',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
    },
    profilePicUrl: '',
    bio: 'Experienced farm worker with 8 years of experience. Expert tractor operator.',
    rating: 4.7,
    totalJobs: 95,
  },
  equipmentProfile: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: null,
  reportCount: 0,
  suspendedUntil: null,
  isDeleted: false,
  deletionRequestedAt: null,
};

async function seedDemoUsers() {
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  console.log('🌱 Seeding demo users...\n');

  for (const demoUser of [DEMO_FARMER, DEMO_WORKER]) {
    const existing = await users.findOne({ phone: demoUser.phone });
    if (existing) {
      console.log(`⏭️  Skipped — user with phone ${demoUser.phone} (${demoUser.activeRole}: ${demoUser[demoUser.activeRole + 'Profile']?.name}) already exists.`);
    } else {
      await users.insertOne(demoUser);
      console.log(`✅ Created ${demoUser.activeRole} demo user: ${demoUser[demoUser.activeRole + 'Profile']?.name} (phone: ${demoUser.phone})`);
    }
  }

  console.log('\n🎉 Demo user seeding complete.');
  await client.close();
}

seedDemoUsers().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
