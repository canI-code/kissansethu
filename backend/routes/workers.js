import { Router } from 'express';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const router = Router();

// Get all workers with filters
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { skill, minRate, maxRate, location, available, search } = req.query;

    let filter = {};
    if (skill) filter.skills = { $regex: skill, $options: 'i' };
    if (location) filter['location.district'] = { $regex: location, $options: 'i' };
    if (available === 'true') filter.available = true;
    if (minRate || maxRate) {
      filter.dailyRate = {};
      if (minRate) filter.dailyRate.$gte = Number(minRate);
      if (maxRate) filter.dailyRate.$lte = Number(maxRate);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } }
      ];
    }

    const workers = await db.collection('workers')
      .find(filter)
      .sort({ rating: -1, createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workers', details: error.message });
  }
});

// Get single worker
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const worker = await db.collection('workers').findOne({ _id: new ObjectId(req.params.id) });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch worker', details: error.message });
  }
});

// Register new worker
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const worker = { ...req.body, available: true, rating: 0, totalJobs: 0, createdAt: new Date() };
    const result = await db.collection('workers').insertOne(worker);
    res.json({ success: true, id: result.insertedId, message: 'Worker registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register worker', details: error.message });
  }
});

// Update worker
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const updates = req.body;
    await db.collection('workers').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );
    res.json({ success: true, message: 'Worker updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update worker', details: error.message });
  }
});

// Hire worker
router.post('/:id/hire', async (req, res) => {
  try {
    const db = getDB();
    const { farmerId, startDate, endDate, workerCount, notes } = req.body;

    const hiring = {
      workerId: new ObjectId(req.params.id),
      farmerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workerCount: workerCount || 1,
      notes,
      status: 'pending',
      type: 'worker_hire',
      createdAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(hiring);
    
    res.json({ success: true, bookingId: result.insertedId, message: 'Worker hired successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to hire worker', details: error.message });
  }
});

export default router;
