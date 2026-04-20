import { Router } from 'express';
import { getDB } from '../config/db.js';
import { analyzeProfile, profileQuestions } from '../services/aiService.js';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get profile form questions (for voice filling)
router.get('/questions', (req, res) => {
  res.json({ questions: profileQuestions });
});

// Create or update farmer profile with AI analysis
router.post('/', requireAuth, async (req, res) => {
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

// ---------------------------------------------------------------------------
// Worker profile routes (for dual-role system)
// ---------------------------------------------------------------------------

// GET /api/profile/worker/:userId — get worker profile from users collection
router.get('/worker/:userId', async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.userId) });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, workerProfile: user.workerProfile || null, userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch worker profile' });
  }
});

// PUT /api/profile/worker/:userId — update worker profile
router.put('/worker/:userId', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const updates = req.body;
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.userId) },
      { $set: { workerProfile: { ...updates, updatedAt: new Date() }, updatedAt: new Date() } }
    );
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.userId) });
    res.json({ success: true, workerProfile: user.workerProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update worker profile' });
  }
});

// PUT /api/profile/worker/:userId/availability — toggle availability
router.put('/worker/:userId/availability', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { available } = req.body;
    if (typeof available !== 'boolean') {
      return res.status(400).json({ success: false, message: '`available` boolean is required' });
    }
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.userId) },
      { $set: { 'workerProfile.available': available, updatedAt: new Date() } }
    );
    res.json({ success: true, available, message: available ? 'You are now available' : 'You are now unavailable' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
});

// GET /api/profile/equipment-owner/:userId — get equipment owner profile
router.get('/equipment-owner/:userId', async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.userId) });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, equipmentProfile: user.equipmentProfile || null, userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch equipment owner profile' });
  }
});

// PUT /api/profile/equipment-owner/:userId — update equipment owner profile
router.put('/equipment-owner/:userId', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const updates = req.body;
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.userId) },
      { $set: { equipmentProfile: { ...updates, updatedAt: new Date() }, updatedAt: new Date() } }
    );
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.userId) });
    res.json({ success: true, equipmentProfile: user.equipmentProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update equipment owner profile' });
  }
});

// Generic role profile update — PUT /api/profile/:role/:userId
// Supports: farmer, worker, equipment_owner
router.put('/:role/:userId', requireAuth, async (req, res) => {
  const { role, userId } = req.params;
  const validRoles = ['farmer', 'worker', 'equipment_owner'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: `Invalid role: ${role}` });
  }
  const profileKey = role === 'equipment_owner' ? 'equipmentProfile' : `${role}Profile`;
  try {
    const db = getDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { [profileKey]: { ...req.body, updatedAt: new Date() }, updatedAt: new Date() } }
    );
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    res.json({ success: true, profile: user[profileKey] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;
