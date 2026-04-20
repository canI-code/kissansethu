import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/auth/PhoneInput';
import OTPInput from '../components/auth/OTPInput';
import RoleSelector from '../components/auth/RoleSelector';

const steps = ['Enter Phone', 'Verify OTP', 'Choose Role'];

const Login = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [pendingUser, setPendingUser] = useState(null); // user returned from verify-otp
  const [error, setError] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);

  const { sendOtp, setRole, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already fully logged in with a role
  React.useEffect(() => {
    if (isLoggedIn) navigate('/home');
  }, [isLoggedIn, navigate]);

  // Step 0 → 1: OTP sent
  const handleOtpSent = (phoneNumber) => {
    setPhone(phoneNumber);
    setActiveStep(1);
    setError('');
  };

  // Step 1 → 2 (new user) or done (existing user with roles)
  const handleVerificationSuccess = (user) => {
    const isNewUser = !user.roles || user.roles.length === 0;
    if (isNewUser) {
      setPendingUser(user);
      setActiveStep(2);
    } else {
      // Existing user — already saved in AuthContext, go home
      navigate('/home');
    }
  };

  // Step 2: role selected
  const handleRoleSelected = async (roles) => {
    if (!pendingUser) return;
    setRoleLoading(true);
    setError('');
    try {
      const result = await setRole(pendingUser._id, roles);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.message || 'Failed to set role. Please try again.');
      }
    } catch {
      setError('Failed to set role. Please try again.');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleResendOtp = async (phoneNumber) => {
    const result = await sendOtp(phoneNumber);
    if (!result.success) setError(result.message || 'Failed to resend OTP');
  };

  const handleBackToPhone = () => {
    setActiveStep(0);
    setError('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <PhoneInput onOtpSent={handleOtpSent} />;
      case 1:
        return (
          <OTPInput
            phone={phone}
            onVerificationSuccess={handleVerificationSuccess}
            onResendOtp={handleResendOtp}
            onBack={handleBackToPhone}
          />
        );
      case 2:
        return (
          <RoleSelector
            onRoleSelected={handleRoleSelected}
            loading={roleLoading}
          />
        );
      default:
        return null;
    }
  };

  // Only show the role step in the stepper for new users (step 2)
  const visibleSteps = activeStep < 2 ? steps.slice(0, 2) : steps;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{ p: 4, width: '100%', maxWidth: 440, borderRadius: 2 }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            🌾 KissanSetu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Voice-First Farmer Platform
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {visibleSteps.map((label) => (
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

        {getStepContent(activeStep)}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Secure OTP verification • Your data is protected
          </Typography>
          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
            <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600 }}>
              🧪 Demo Mode — Enter any 6-digit code as OTP
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
