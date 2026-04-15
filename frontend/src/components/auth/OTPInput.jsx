import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const OTPInput = ({ phone, onVerificationSuccess, onResendOtp, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const { verifyOtp } = useAuth();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    if (digits.length === 6) {
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        newOtp[index] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (otpValue = null) => {
    const finalOtp = otpValue || otp.join('');
    
    if (finalOtp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp(finalOtp);
      
      if (result.success) {
        onVerificationSuccess(result.user);
      } else {
        setError(result.message || 'Invalid OTP');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');
    setCanResend(false);
    setResendTimer(60);

    try {
      await onResendOtp(phone);
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Enter Verification Code
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sent to +91 {phone}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: 'center' }}>
        {otp.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            slotProps={{
              input: {
                style: { textAlign: 'center', fontSize: '20px' },
                inputMode: 'numeric',
                maxLength: 1,
                pattern: '[0-9]*'
              }
            }}
            sx={{
              width: 50,
              height: 60,
              '& .MuiInputBase-input': { textAlign: 'center' }
            }}
          />
        ))}
      </Stack>

      <Button
        fullWidth
        variant="contained"
        onClick={() => handleVerify()}
        disabled={loading || otp.join('').length !== 6}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Verify & Continue'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Didn't receive the code?
        </Typography>
        
        <Button
          variant="text"
          onClick={handleResend}
          disabled={!canResend || loading}
          sx={{ mr: 2 }}
        >
          {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
        </Button>
        
        <Button variant="text" onClick={onBack}>
          Change Number
        </Button>
      </Box>
    </Box>
  );
};

export default OTPInput;