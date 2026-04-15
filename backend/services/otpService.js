import { getDB } from '../config/db.js';

// Simple OTP generator for development
// In production, use a proper SMS service like Twilio, Msg91, etc.
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in memory (in production, use Redis or database)
const otpStore = new Map();

// OTP expiration time (5 minutes)
const OTP_EXPIRY = 5 * 60 * 1000;

export const sendOTP = async (phoneNumber) => {
  try {
    // Validate phone number format (Indian numbers)
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length !== 10 && !cleanedPhone.startsWith('91')) {
      throw new Error('Invalid phone number format. Please provide a valid Indian phone number.');
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration
    otpStore.set(cleanedPhone, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY,
      attempts: 0
    });

    // In development, log the OTP instead of sending SMS
    console.log(`OTP for ${cleanedPhone}: ${otp}`);
    
    // In production, integrate with SMS service here:
    // await sendSMS(cleanedPhone, `Your AgriConnect verification code is: ${otp}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      // Don't send OTP to client in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  } catch (error) {
    console.error('OTP sending error:', error);
    throw new Error('Failed to send OTP');
  }
};

export const verifyOTP = async (phoneNumber, otp) => {
  try {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    const storedData = otpStore.get(cleanedPhone);

    if (!storedData) {
      return { success: false, message: 'OTP not found or expired' };
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(cleanedPhone);
      return { success: false, message: 'OTP expired' };
    }

    // Check attempt limit
    if (storedData.attempts >= 3) {
      otpStore.delete(cleanedPhone);
      return { success: false, message: 'Too many attempts. Please request a new OTP.' };
    }

    // Verify OTP
    if (storedData.otp === otp) {
      // OTP verified successfully
      otpStore.delete(cleanedPhone);
      
      // Check if user exists or create new profile
      const db = getDB();
      let user = await db.collection('users').findOne({ phone: cleanedPhone });
      
      if (!user) {
        // Create new user with phone verification
        const newUser = {
          phone: cleanedPhone,
          isVerified: true,
          role: 'farmer', // Default role
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await db.collection('users').insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      } else {
        // Update existing user verification status
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { isVerified: true, updatedAt: new Date() } }
        );
        user.isVerified = true;
      }

      return {
        success: true,
        message: 'OTP verified successfully',
        user: {
          _id: user._id,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        }
      };
    } else {
      // Increment attempt counter
      storedData.attempts += 1;
      otpStore.set(cleanedPhone, storedData);
      
      return { 
        success: false, 
        message: 'Invalid OTP',
        attemptsLeft: 3 - storedData.attempts
      };
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    throw new Error('Failed to verify OTP');
  }
};

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 60000); // Run every minute