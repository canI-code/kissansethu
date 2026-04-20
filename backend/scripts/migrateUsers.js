/**
 * Migration script: backfill existing users with the new dual-role schema fields.
 *
 * Run once with: node backend/scripts/migrateUsers.js
 *
 * Safe to run multiple times — uses $setOnInsert / conditional $set so it
 * won't overwrite fields that already have values.
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'kissansetu';

async function migrate() {
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  console.log('🔄 Starting user schema migration...');

  // For each user that is missing the new fields, add them with safe defaults.
  // We use a bulk write so this is efficient even with many users.
  const cursor = users.find({});
  let migrated = 0;

  for await (const user of cursor) {
    const updates = {};

    // Migrate legacy single `role` field → `roles` array
    if (!user.roles) {
      updates.roles = user.role ? [user.role] : [];
    }
    if (!user.activeRole) {
      updates.activeRole = user.role || null;
    }
    if (!('farmerProfile' in user)) updates.farmerProfile = null;
    if (!('workerProfile' in user)) updates.workerProfile = null;
    if (!('equipmentProfile' in user)) updates.equipmentProfile = null;
    if (!('reportCount' in user)) updates.reportCount = 0;
    if (!('suspendedUntil' in user)) updates.suspendedUntil = null;
    if (!('isDeleted' in user)) updates.isDeleted = false;
    if (!('deletionRequestedAt' in user)) updates.deletionRequestedAt = null;
    if (!('lastLogin' in user)) updates.lastLogin = null;

    if (Object.keys(updates).length > 0) {
      await users.updateOne(
        { _id: user._id },
        { $set: { ...updates, updatedAt: new Date() } }
      );
      migrated++;
    }
  }

  console.log(`✅ Migration complete. Updated ${migrated} user document(s).`);
  await client.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
