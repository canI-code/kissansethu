import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Button,
  TextField,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PhoneInput from '../components/auth/PhoneInput';
import OTPInput from '../components/auth/OTPInput';
import RoleSelector from '../components/auth/RoleSelector';

const steps = ['Phone Number', 'Verify OTP', 'Choose Role', 'Basic Profile'];

const Signup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [error, setError] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Basic profile fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const { sendOtp, setRole, updateProfile, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoggedIn) navigate('/home');
  }, [isLoggedIn, navigate]);

  const handleOtpSent = (phoneNumber) => {
    setPhone(phoneNumber);
    setActiveStep(1);
    setError('');
  };

  const handleVerificationSuccess = (user) => {
    const isNewUser = !user.roles || user.roles.length === 0;
    if (isNewUser) {
      setPendingUser(user);
      setActiveStep(2);
    } else {
      // Existing user — go home
      navigate('/home');
    }
  };

  const handleRoleSelected = async (roles) => {
    if (!pendingUser) return;
    setRoleLoading(true);
    setError('');
    try {
      const result = await setRole(pendingUser._id, roles);
      if (result.success) {
        setSelectedRoles(roles);
        setActiveStep(3);
      } else {
        setError(result.message || 'Failed to set role');
      }
    } catch {
      setError('Failed to set role. Please try again.');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError('');
    try {
      // Build profile update based on active role
      const profileData = { name: name.trim(), location: location.trim() };
      if (pendingUser) {
        await updateProfile(pendingUser._id, selectedRoles[0], profileData);
      }
      navigate('/home');
    } catch {
      setError('Failed to save profile. You can update it later from your profile page.');
      // Still navigate — profile can be filled later
      setTimeout(() => navigate('/home'), 1500);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleResendOtp = async (phoneNumber) => {
    const result = await sendOtp(phoneNumber);
    if (!result.success) setError(result.message || 'Failed to resend OTP');
  };

  const getRoleLabel = () => {
    if (selectedRoles.includes('farmer')) return 'Farmer';
    if (selectedRoles.includes('worker') && selectedRoles.includes('equipment_owner')) return 'Worker & Equipment Owner';
    if (selectedRoles.includes('worker')) return 'Farm Worker';
    if (selectedRoles.includes('equipment_owner')) return 'Equipment Owner';
    return 'User';
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
            onBack={() => { setActiveStep(0); setError(''); }}
          />
        );
      case 2:
        return (
          <RoleSelector onRoleSelected={handleRoleSelected} loading={roleLoading} />
        );
      case 3:
        return (
          <Box component="form" onSubmit={handleProfileSubmit}>
            <Typography variant="h6" gutterBottom>
              Basic Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Setting up as: <strong>{getRoleLabel()}</strong> — you can fill more details later.
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Your Name / आपका नाम"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
              />
              <TextField
                fullWidth
                label="Village / District / गांव / जिला"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rampur, Lucknow, UP"
              />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={profileLoading || !name.trim()}
              sx={{ mb: 1, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              {profileLoading ? <CircularProgress size={24} color="inherit" /> : 'Complete Signup →'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/home')}
              sx={{ color: 'text.secondary' }}
            >
              Skip for now
            </Button>
          </Box>
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
        background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{ p: 4, width: '100%', maxWidth: 460, borderRadius: 2 }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            🌾 KissanSetu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your account — किसान सेतु से जुड़ें
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
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

        {getStepContent(activeStep)}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2e7d32', fontWeight: 600 }}>
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;
