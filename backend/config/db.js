import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'kissansetu';

let db = null;
let client = null;

export async function connectDB() {
  if (db) return db;
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log(`✅ Connected to MongoDB Atlas — Database: ${dbName}`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('⚠️  Server will start without database. Set MONGODB_URI in .env to enable data features.');
    // Don't exit — let the server run so other routes (health, calling status) still work
    return null;
  }
}

export function getDB() {
  if (!db) throw new Error('Database not connected. Set MONGODB_URI in .env and restart the server.');
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}
