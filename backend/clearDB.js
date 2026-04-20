import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'kissansetu';

async function clearAndSeed() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log(`Connected successfully to database: ${dbName}`);
    const db = client.db(dbName);
    
    console.log('Clearing old data...');
    // Drop collections if they exist or just delete everything
    await db.collection('equipment').deleteMany({});
    await db.collection('workers').deleteMany({});
    await db.collection('users').deleteMany({});
    
    console.log('Old data removed successfully!');
  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

clearAndSeed();
