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
    process.exit(1);
  }
}

export function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}
