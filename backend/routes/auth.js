import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_ROLES = ['farmer', 'worker', 'equipment_owner'];

/** Sign a JWT for the given user _id */
const signToken = (userId) =>
  jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/** Normalise phone to digits-only key (same logic as otpService) */
const cleanPhone = (phoneNumber) => phoneNumber.replace(/\D/g, '');

/** Safe user projection — never expose internal fields to client */
const safeUser = (user) => ({
  _id: user._id,
  phone: user.phone,
  roles: user.roles || [],
  activeRole: user.activeRole || null,
  isVerified: user.isVerified,
  farmerProfile: user.farmerProfile || null,
  workerProfile: user.workerProfile || null,
  equipmentProfile: user.equipmentProfile || null,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

// ---------------------------------------------------------------------------
// POST /api/auth/check-phone
// Returns whether the phone exists and which roles it has
// ---------------------------------------------------------------------------
router.post('/check-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ phone: cleanPhone(phoneNumber) });

    res.json({
      success: true,
      exists: !!user,
      isVerified: user?.isVerified || false,
      roles: user?.roles || [],
      activeRole: user?.activeRole || null,
    });
  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({ success: false, message: 'Failed to check phone number' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/send-otp
// Sends a real OTP via Twilio SMS
// ---------------------------------------------------------------------------
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const result = await sendOTP(phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Send OTP error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/verify-otp
// Verifies OTP and returns user with roles, activeRole, and JWT token
// ---------------------------------------------------------------------------
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
    }

    const result = await verifyOTP(phoneNumber, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Issue JWT
    const token = signToken(result.user._id);

    res.json({
      ...result,
      token,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify OTP' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/set-role
// Sets the initial role(s) for a new user after OTP verification
// Body: { userId, roles: ['farmer'] | ['worker'] | ['equipment_owner'] | ['worker','equipment_owner'] }
// ---------------------------------------------------------------------------
router.post('/set-role', async (req, res) => {
  try {
    const { userId, roles } = req.body;

    if (!userId || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ success: false, message: 'userId and roles array are required' });
    }

    const invalidRoles = roles.filter((r) => !VALID_ROLES.includes(r));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles: ${VALID_ROLES.join(', ')}`,
      });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Merge with any existing roles (avoid duplicates)
    const mergedRoles = [...new Set([...(user.roles || []), ...roles])];
    const activeRole = roles[0]; // first selected role becomes active

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { roles: mergedRoles, activeRole, updatedAt: new Date() } }
    );

    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    res.json({
      success: true,
      message: `Role(s) set successfully`,
      user: safeUser(updatedUser),
    });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to set role' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/switch-role
// Updates the activeRole field for an existing user
// Body: { userId, role }
// ---------------------------------------------------------------------------
router.post('/switch-role', async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ success: false, message: 'userId and role are required' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles: ${VALID_ROLES.join(', ')}`,
      });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.roles || !user.roles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `User does not have the '${role}' role. Use /add-role first.`,
      });
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { activeRole: role, updatedAt: new Date() } }
    );

    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    res.json({
      success: true,
      message: `Switched to ${role} mode`,
      user: safeUser(updatedUser),
    });
  } catch (error) {
    console.error('Switch role error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to switch role' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/add-role
// Appends a new role to the user's roles array (without changing activeRole)
// Body: { userId, role }
// ---------------------------------------------------------------------------
router.post('/add-role', async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ success: false, message: 'userId and role are required' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles: ${VALID_ROLES.join(', ')}`,
      });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.roles && user.roles.includes(role)) {
      return res.json({
        success: true,
        message: `User already has the '${role}' role`,
        user: safeUser(user),
      });
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { roles: role }, $set: { updatedAt: new Date() } }
    );

    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    res.json({
      success: true,
      message: `Role '${role}' added successfully`,
      user: safeUser(updatedUser),
    });
  } catch (error) {
    console.error('Add role error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to add role' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// Returns the full user profile for the authenticated user
// Requires: Authorization: Bearer <token>
// ---------------------------------------------------------------------------
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: safeUser(user),
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get user profile' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// Client-side logout — just confirms; JWT invalidation is client responsibility
// ---------------------------------------------------------------------------
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
