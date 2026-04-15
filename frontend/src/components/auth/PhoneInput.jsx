import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const PhoneInput = ({ onOtpSent, onPhoneChecked }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendOtp, checkPhoneExists } = useAuth();

  const validatePhone = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setLoading(true);
    
    try {
      // First check if phone exists
      const checkResult = await checkPhoneExists(phone);
      
      if (onPhoneChecked) {
        onPhoneChecked({ phone, exists: checkResult.exists, isVerified: checkResult.isVerified });
      }

      // Send OTP
      const result = await sendOtp(phone);
      
      if (result.success) {
        onOtpSent(phone);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Enter Your Phone Number
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        We'll send you a verification code via SMS
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Phone Number"
        placeholder="Enter 10-digit mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        type="tel"
        inputProps={{ 
          maxLength: 10,
          pattern: '[0-9]{10}',
          inputMode: 'numeric'
        }}
        required
        sx={{ mb: 2 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading || !phone}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
      </Button>

      <Typography variant="caption" color="text.secondary">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Typography>
    </Box>
  );
};

export default PhoneInput;