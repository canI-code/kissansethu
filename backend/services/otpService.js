import { getDB } from '../config/db.js';
import { createUserDocument } from '../config/userSchema.js';

// Demo mode: any 6-digit OTP is accepted (no real SMS sent)
const DEMO_MODE = true;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// In-memory OTP store (keyed by cleaned phone number)
// Structure: { otp, expiresAt, attempts, sentCount, windowStart }
const otpStore = new Map();

// OTP expiry: 10 minutes (per requirement 2, AC 8)
const OTP_EXPIRY = 10 * 60 * 1000;

// Rate limit: max 3 OTPs per phone per hour (per requirement 2, AC 9)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 3;

/**
 * Normalise phone number to a consistent format.
 * Accepts 10-digit Indian numbers or numbers with country code.
 * Returns the number in E.164 format (+91XXXXXXXXXX).
 */
const normalisePhone = (phoneNumber) => {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  // Already has + prefix handled above; return as-is for other formats
  return `+${digits}`;
};

export const sendOTP = async (phoneNumber) => {
  const e164Phone = normalisePhone(phoneNumber);
  const cleanedPhone = e164Phone.replace(/\D/g, ''); // digits only for store key

  // --- Rate limiting ---
  const existing = otpStore.get(cleanedPhone);
  const now = Date.now();

  if (existing) {
    const windowAge = now - (existing.windowStart || 0);
    if (windowAge < RATE_LIMIT_WINDOW) {
      if ((existing.sentCount || 0) >= RATE_LIMIT_MAX) {
        const err = new Error('Too many OTP requests. Try again in an hour.');
        err.statusCode = 429;
        throw err;
      }
    }
  }

  const otp = generateOTP();
  const sentCount = existing && (now - (existing.windowStart || 0)) < RATE_LIMIT_WINDOW
    ? (existing.sentCount || 0) + 1
    : 1;
  const windowStart = sentCount === 1 ? now : (existing?.windowStart || now);

  otpStore.set(cleanedPhone, {
    otp,
    expiresAt: now + OTP_EXPIRY,
    attempts: 0,
    sentCount,
    windowStart,
  });

  // --- Demo mode: log OTP to console, no real SMS ---
  console.log(`🔑 [DEMO] OTP for ${e164Phone}: ${otp} (any 6-digit code also works)`);

  return {
    success: true,
    message: 'OTP sent (demo mode — check server console or use any 6-digit code)',
    ...(process.env.NODE_ENV !== 'production' ? { demoOtp: otp } : {}),
  };
};

export const verifyOTP = async (phoneNumber, otp) => {
  const e164Phone = normalisePhone(phoneNumber);
  const cleanedPhone = e164Phone.replace(/\D/g, '');
  const storedData = otpStore.get(cleanedPhone);

  if (!storedData) {
    return { success: false, message: 'OTP not found or expired. Please request a new OTP.' };
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(cleanedPhone);
    return { success: false, message: 'OTP has expired. Please request a new OTP.' };
  }

  if (storedData.attempts >= 3) {
    otpStore.delete(cleanedPhone);
    return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (storedData.otp !== otp) {
    // Demo mode: also accept any valid 6-digit code
    const isValidSixDigit = /^\d{6}$/.test(otp);
    if (!isValidSixDigit) {
      storedData.attempts += 1;
      otpStore.set(cleanedPhone, storedData);
      return {
        success: false,
        message: 'Invalid OTP',
        attemptsLeft: 3 - storedData.attempts,
      };
    }
    // Any 6-digit code is accepted in demo mode — fall through
  }

  // OTP is correct — clear it
  otpStore.delete(cleanedPhone);

  // Upsert user in MongoDB
  const db = getDB();
  let user = await db.collection('users').findOne({ phone: cleanedPhone });

  if (!user) {
    // New user — create with the canonical schema shape
    const newUser = {
      ...createUserDocument(cleanedPhone),
      isVerified: true,
      lastLogin: new Date(),
    };
    const result = await db.collection('users').insertOne(newUser);
    user = { ...newUser, _id: result.insertedId };
  } else {
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { isVerified: true, updatedAt: new Date(), lastLogin: new Date() } }
    );
    user.isVerified = true;
  }

  const isNewUser = !user.roles || user.roles.length === 0;

  return {
    success: true,
    message: 'OTP verified successfully',
    isNewUser,
    user: {
      _id: user._id,
      phone: user.phone,
      roles: user.roles || [],
      activeRole: user.activeRole || null,
      isVerified: user.isVerified,
      farmerProfile: user.farmerProfile || null,
      workerProfile: user.workerProfile || null,
      equipmentProfile: user.equipmentProfile || null,
    },
  };
};

// Cleanup expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 60_000);
