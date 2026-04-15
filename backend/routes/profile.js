import { Router } from 'express';
import { getDB } from '../config/db.js';
import { analyzeProfile, profileQuestions } from '../services/aiService.js';
import { ObjectId } from 'mongodb';

const router = Router();

// Get profile form questions (for voice filling)
router.get('/questions', (req, res) => {
  res.json({ questions: profileQuestions });
});

// Create or update farmer profile with AI analysis
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const rawProfile = req.body;
    
    // AI analysis of profile
    const analyzed = await analyzeProfile(rawProfile);
    
    // Merge raw + AI-analyzed data
    const farmerDoc = {
      raw: rawProfile,
      analyzed: analyzed.profile,
      insights: analyzed.insights,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Upsert based on phone number or name
    const filter = rawProfile.phone 
      ? { 'raw.phone': rawProfile.phone }
      : { 'raw.name': rawProfile.name, 'raw.village': rawProfile.village };
    
    const result = await db.collection('farmers').updateOne(
      filter,
      { $set: farmerDoc },
      { upsert: true }
    );

    const farmerId = result.upsertedId || (await db.collection('farmers').findOne(filter))?._id;

    res.json({ 
      success: true, 
      farmerId,
      profile: analyzed.profile,
      insights: analyzed.insights,
      message: 'Profile analyzed and saved successfully'
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ error: 'Failed to create profile', details: error.message });
  }
});

// Get farmer profile by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const farmer = await db.collection('farmers').findOne({ _id: new ObjectId(req.params.id) });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

// Get all farmers (admin)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const farmers = await db.collection('farmers').find({}).sort({ createdAt: -1 }).limit(50).toArray();
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farmers', details: error.message });
  }
});

export default router;
