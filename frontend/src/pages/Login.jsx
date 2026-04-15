import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/auth/PhoneInput';
import OTPInput from '../components/auth/OTPInput';

const steps = ['Enter Phone Number', 'Verify OTP'];

const Login = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [phoneInfo, setPhoneInfo] = useState(null);
  const [error, setError] = useState('');
  const { sendOtp, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleOtpSent = (phoneNumber) => {
    setPhone(phoneNumber);
    setActiveStep(1);
    setError('');
  };

  const handlePhoneChecked = (info) => {
    setPhoneInfo(info);
  };

  const handleResendOtp = async (phoneNumber) => {
    try {
      const result = await sendOtp(phoneNumber);
      if (!result.success) {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const handleVerificationSuccess = (user) => {
    // Redirect based on user role or to home
    navigate('/');
  };

  const handleBackToPhone = () => {
    setActiveStep(0);
    setError('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <PhoneInput
            onOtpSent={handleOtpSent}
            onPhoneChecked={handlePhoneChecked}
          />
        );
      case 1:
        return (
          <OTPInput
            phone={phone}
            onVerificationSuccess={handleVerificationSuccess}
            onResendOtp={handleResendOtp}
            onBack={handleBackToPhone}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            🌾 AgriConnect
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Voice-First Farmer Platform
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {phoneInfo?.exists && !phoneInfo?.isVerified && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Phone number exists but not verified. Sending verification OTP...
          </Alert>
        )}

        {getStepContent(activeStep)}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Secure OTP verification • Your data is protected
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;