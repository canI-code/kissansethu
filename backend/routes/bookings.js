import { Router } from 'express';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get bookings for a farmer
router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { farmerId, status } = req.query;
    
    let filter = {};
    if (farmerId) filter.farmerId = farmerId;
    if (status) filter.status = status;

    const bookings = await db.collection('bookings')
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $limit: 30 },
        {
          $lookup: {
            from: 'equipment',
            localField: 'equipmentId',
            foreignField: '_id',
            as: 'equipment'
          }
        },
        {
          $lookup: {
            from: 'workers',
            localField: 'workerId',
            foreignField: '_id',
            as: 'worker'
          }
        },
        {
          $addFields: {
            equipment: { $arrayElemAt: ['$equipment', 0] },
            worker: { $arrayElemAt: ['$worker', 0] }
          }
        }
      ]).toArray();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
});

// Update booking status  
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'Booking updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking', details: error.message });
  }
});

export default router;
