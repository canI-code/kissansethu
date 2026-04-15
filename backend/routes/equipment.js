import { Router } from 'express';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const router = Router();

// Get all equipment with filters
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { type, action, minPrice, maxPrice, location, search } = req.query;
    
    let filter = {};
    if (type) filter.type = { $regex: type, $options: 'i' };
    if (action) filter.action = action; // 'rent' or 'buy'
    if (location) filter['location.district'] = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameHi: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const equipment = await db.collection('equipment')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch equipment', details: error.message });
  }
});

// Get single equipment
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const item = await db.collection('equipment').findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch equipment', details: error.message });
  }
});

// Add new equipment listing
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const equipment = { ...req.body, createdAt: new Date(), status: 'available' };
    const result = await db.collection('equipment').insertOne(equipment);
    res.json({ success: true, id: result.insertedId, message: 'Equipment listed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add equipment', details: error.message });
  }
});

// Book equipment (rent or buy)
router.post('/:id/book', async (req, res) => {
  try {
    const db = getDB();
    const { farmerId, startDate, endDate, notes, action } = req.body;
    const equipmentId = new ObjectId(req.params.id);

    // Check if equipment exists and is available
    const equipment = await db.collection('equipment').findOne({ _id: equipmentId });
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    if (equipment.status === 'sold') return res.status(400).json({ error: 'Equipment is already sold' });

    if (action === 'rent') {
      // Check for date conflicts with existing bookings
      const conflicting = await db.collection('bookings').findOne({
        equipmentId,
        status: { $in: ['pending', 'confirmed'] },
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      });

      if (conflicting) {
        return res.status(400).json({ 
          error: 'Date conflict',
          message: `Equipment is already booked from ${conflicting.startDate.toLocaleDateString()} to ${conflicting.endDate.toLocaleDateString()}`
        });
      }
    }

    const booking = {
      equipmentId,
      farmerId: farmerId || 'anonymous',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes,
      action: action || 'rent',
      status: 'pending',
      createdAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(booking);
    
    // Update equipment status
    const newStatus = action === 'buy' ? 'sold' : 'booked';
    await db.collection('equipment').updateOne(
      { _id: equipmentId },
      { $set: { status: newStatus } }
    );

    res.json({ success: true, bookingId: result.insertedId, message: `${action === 'buy' ? 'Purchase' : 'Rental'} booking created successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book equipment', details: error.message });
  }
});

export default router;
