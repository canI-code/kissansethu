import { Router } from 'express';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import { getDB } from '../config/db.js';

const router = Router();

// Send OTP to phone number
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    const result = await sendOTP(phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send OTP' 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP are required' 
      });
    }

    const result = await verifyOTP(phoneNumber, otp);
    res.json(result);
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to verify OTP' 
    });
  }
});

// Check if phone number exists
router.post('/check-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const db = getDB();
    
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    const user = await db.collection('users').findOne({ phone: cleanedPhone });
    
    res.json({ 
      exists: !!user,
      isVerified: user?.isVerified || false
    });
  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check phone number' 
    });
  }
});

export default router;