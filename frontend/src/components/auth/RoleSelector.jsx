import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

/**
 * RoleSelector — Step 3 of the login/signup flow.
 *
 * Props:
 *  - onRoleSelected(roles: string[]) — called after the user confirms their choice
 *  - loading — external loading state
 */
const ROLE_OPTIONS = [
  {
    id: 'farmer',
    emoji: '🌾',
    title: 'I want to use services',
    titleHi: 'मुझे सेवाएं चाहिए',
    subtitle: 'Farmer',
    subtitleHi: 'किसान',
    description: 'Rent equipment, hire workers, check government schemes',
    descriptionHi: 'उपकरण किराये पर लें, मजदूर खोजें, सरकारी योजनाएं देखें',
    color: '#2e7d32',
    bg: '#f1f8e9',
    border: '#a5d6a7',
    roles: ['farmer'],
  },
  {
    id: 'provider',
    emoji: '🔧',
    title: 'I want to provide services',
    titleHi: 'मैं सेवाएं देना चाहता हूं',
    subtitle: 'Worker / Equipment Owner',
    subtitleHi: 'मजदूर / उपकरण मालिक',
    description: 'Offer your labour or rent out your equipment to farmers',
    descriptionHi: 'किसानों को मजदूरी दें या अपना उपकरण किराये पर दें',
    color: '#e65100',
    bg: '#fff3e0',
    border: '#ffcc80',
    roles: null, // requires sub-selection
  },
];

const PROVIDER_SUB_OPTIONS = [
  {
    id: 'worker',
    emoji: '👷',
    label: 'Farm Worker',
    labelHi: 'खेत मजदूर',
    icon: <EngineeringIcon />,
  },
  {
    id: 'equipment_owner',
    emoji: '🚜',
    label: 'Equipment Owner',
    labelHi: 'उपकरण मालिक',
    icon: <PrecisionManufacturingIcon />,
  },
];

const RoleSelector = ({ onRoleSelected, loading = false }) => {
  const [selected, setSelected] = useState(null);       // 'farmer' | 'provider'
  const [providerRoles, setProviderRoles] = useState([]); // ['worker', 'equipment_owner']
  const [error, setError] = useState('');

  const toggleProviderRole = (roleId) => {
    setProviderRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleConfirm = () => {
    setError('');
    if (!selected) {
      setError('Please select a role to continue');
      return;
    }
    if (selected === 'provider' && providerRoles.length === 0) {
      setError('Please select at least one provider type');
      return;
    }

    const roles = selected === 'farmer' ? ['farmer'] : providerRoles;
    onRoleSelected(roles);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        How will you use KhetSetu?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        आप KhetSetu का उपयोग कैसे करेंगे?
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mb: 3 }}>
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <Box key={option.id}>
              <Box
                onClick={() => {
                  setSelected(option.id);
                  setError('');
                  if (option.id === 'farmer') setProviderRoles([]);
                }}
                sx={{
                  border: `2px solid ${isSelected ? option.color : option.border}`,
                  borderRadius: 2,
                  p: 2,
                  cursor: 'pointer',
                  background: isSelected ? option.bg : '#fff',
                  transition: 'all 0.2s',
                  '&:hover': { background: option.bg, borderColor: option.color },
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box sx={{ fontSize: '2.2rem', lineHeight: 1, mt: 0.5 }}>{option.emoji}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} color={isSelected ? option.color : 'text.primary'}>
                    {option.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {option.titleHi}
                  </Typography>
                  <Chip
                    label={option.subtitle}
                    size="small"
                    sx={{
                      mt: 0.5,
                      mb: 0.5,
                      bgcolor: isSelected ? option.color : 'grey.200',
                      color: isSelected ? '#fff' : 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                    {option.description}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? option.color : '#ccc'}`,
                    bgcolor: isSelected ? option.color : 'transparent',
                    flexShrink: 0,
                    mt: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '0.75rem',
                  }}
                >
                  {isSelected && '✓'}
                </Box>
              </Box>

              {/* Sub-options for provider */}
              {option.id === 'provider' && isSelected && (
                <Box sx={{ mt: 1, pl: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Select your provider type(s):
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {PROVIDER_SUB_OPTIONS.map((sub) => {
                      const isSubSelected = providerRoles.includes(sub.id);
                      return (
                        <Box
                          key={sub.id}
                          onClick={() => toggleProviderRole(sub.id)}
                          sx={{
                            border: `2px solid ${isSubSelected ? '#e65100' : '#ddd'}`,
                            borderRadius: 2,
                            p: 1.5,
                            cursor: 'pointer',
                            flex: 1,
                            textAlign: 'center',
                            background: isSubSelected ? '#fff3e0' : '#fafafa',
                            transition: 'all 0.15s',
                          }}
                        >
                          <Box sx={{ fontSize: '1.5rem' }}>{sub.emoji}</Box>
                          <Typography variant="caption" fontWeight={isSubSelected ? 700 : 400} display="block">
                            {sub.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                            {sub.labelHi}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleConfirm}
        disabled={loading || !selected}
        sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue →'}
      </Button>
    </Box>
  );
};

export default RoleSelector;
