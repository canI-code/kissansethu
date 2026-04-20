import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const API_BASE = 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Mock pending requests — in production these come from a bookings collection
// ---------------------------------------------------------------------------
const MOCK_REQUESTS = [
  {
    id: 'req1',
    farmerName: 'Suresh Yadav',
    task: 'Wheat harvesting',
    taskHi: 'गेहूं की कटाई',
    date: 'Tomorrow, 6 AM',
    location: 'Rampur, Lucknow',
    pay: 500,
    status: 'pending',
  },
  {
    id: 'req2',
    farmerName: 'Mohan Lal',
    task: 'Tractor ploughing',
    taskHi: 'ट्रैक्टर से जुताई',
    date: 'Day after tomorrow',
    location: 'Barabanki',
    pay: 600,
    status: 'pending',
  },
];

// ---------------------------------------------------------------------------
// WorkerDashboard
// ---------------------------------------------------------------------------

export default function WorkerDashboard() {
  const { user, activeRole, token } = useAuth();
  const { t } = useLang();

  const [available, setAvailable] = useState(
    user?.workerProfile?.available ?? true
  );
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState('');
  const [availSuccess, setAvailSuccess] = useState('');

  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [actionLoading, setActionLoading] = useState(null); // request id being acted on

  // Sync availability from user profile
  useEffect(() => {
    if (user?.workerProfile?.available !== undefined) {
      setAvailable(user.workerProfile.available);
    }
  }, [user]);

  // Auto-dismiss success message
  useEffect(() => {
    if (availSuccess) {
      const t = setTimeout(() => setAvailSuccess(''), 2500);
      return () => clearTimeout(t);
    }
  }, [availSuccess]);

  // ---------------------------------------------------------------------------
  // Toggle availability
  // ---------------------------------------------------------------------------
  const handleAvailabilityToggle = async (e) => {
    const newVal = e.target.checked;
    setAvailLoading(true);
    setAvailError('');
    try {
      const res = await fetch(`${API_BASE}/profile/worker/${user._id}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available: newVal }),
      });
      const result = await res.json();
      if (result.success) {
        setAvailable(newVal);
        setAvailSuccess(newVal ? '✅ You are now available for work' : '⏸ You are now unavailable');
      } else {
        setAvailError(result.message || 'Failed to update availability');
      }
    } catch {
      setAvailError('Network error. Please try again.');
    } finally {
      setAvailLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Accept / Reject request
  // ---------------------------------------------------------------------------
  const handleRequest = useCallback(async (requestId, action) => {
    setActionLoading(requestId);
    // Simulate API call — in production: PUT /api/bookings/:id/status
    await new Promise((r) => setTimeout(r, 600));
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: action } : r))
    );
    setActionLoading(null);
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const completedToday = requests.filter((r) => r.status === 'accepted').length;
  const todayEarnings = requests
    .filter((r) => r.status === 'accepted')
    .reduce((sum, r) => sum + r.pay, 0);

  const workerName = user?.workerProfile?.name || `Worker (+91 ${user?.phone})`;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
          {t(`नमस्ते ${workerName}! 👷`, `Hello ${workerName}! 👷`)}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('आपका वर्कर डैशबोर्ड', 'Your Worker Dashboard')}
        </p>
      </div>

      {/* Availability Toggle */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '16px',
          border: `2px solid ${available ? '#a5d6a7' : '#ffcc80'}`,
          background: available ? '#f1f8e9' : '#fff8e1',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('उपलब्धता', 'Availability')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {available
                ? t('आप काम के लिए उपलब्ध हैं', 'You are available for work')
                : t('आप अभी उपलब्ध नहीं हैं', 'You are currently unavailable')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {availLoading && <CircularProgress size={18} />}
            <Switch
              checked={available}
              onChange={handleAvailabilityToggle}
              disabled={availLoading}
              color="success"
              size="medium"
            />
          </Box>
        </Box>
        {availError && <Alert severity="error" sx={{ mt: 1 }}>{availError}</Alert>}
        {availSuccess && <Alert severity="success" sx={{ mt: 1 }}>{availSuccess}</Alert>}
      </div>

      {/* Stats Bar */}
      <div className="stats-bar" style={{ marginBottom: '24px' }}>
        <div className="stat-item">
          <div className="stat-number">{pendingRequests.length}</div>
          <div className="stat-label">{t('नए अनुरोध', 'Pending Requests')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{completedToday}</div>
          <div className="stat-label">{t('स्वीकृत', 'Accepted Today')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">₹{todayEarnings}</div>
          <div className="stat-label">{t('आज की कमाई', "Today's Earnings")}</div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="section-title">
        <span className="emoji">📋</span>
        {t('नए काम के अनुरोध', 'Pending Job Requests')}
        {pendingRequests.length > 0 && (
          <Chip
            label={pendingRequests.length}
            size="small"
            color="error"
            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
          />
        )}
      </div>

      {pendingRequests.length === 0 ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
          <Typography variant="body2">
            {t('कोई नया अनुरोध नहीं', 'No pending requests right now')}
          </Typography>
        </div>
      ) : (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="card"
              style={{ padding: '16px', border: '1px solid #e0e0e0' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {req.farmerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(req.taskHi, req.task)}
                  </Typography>
                </Box>
                <Chip
                  label={`₹${req.pay}`}
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary">
                  📅 {req.date}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  📍 {req.location}
                </Typography>
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={
                    actionLoading === req.id ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <CheckCircleIcon />
                    )
                  }
                  onClick={() => handleRequest(req.id, 'accepted')}
                  disabled={!!actionLoading}
                  sx={{ flex: 1 }}
                >
                  {t('स्वीकार करें', 'Accept')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleRequest(req.id, 'rejected')}
                  disabled={!!actionLoading}
                  sx={{ flex: 1 }}
                >
                  {t('अस्वीकार करें', 'Reject')}
                </Button>
              </Box>
            </div>
          ))}
        </Stack>
      )}

      {/* Accepted requests */}
      {requests.filter((r) => r.status === 'accepted').length > 0 && (
        <>
          <div className="section-title">
            <span className="emoji">✅</span>
            {t('स्वीकृत काम', 'Accepted Jobs')}
          </div>
          <Stack spacing={1.5}>
            {requests
              .filter((r) => r.status === 'accepted')
              .map((req) => (
                <div
                  key={req.id}
                  className="card"
                  style={{ padding: '12px 16px', background: '#f1f8e9', border: '1px solid #a5d6a7' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {req.farmerName} — {t(req.taskHi, req.task)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        📅 {req.date} · 📍 {req.location}
                      </Typography>
                    </Box>
                    <Chip
                      label={`₹${req.pay}`}
                      size="small"
                      sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 700 }}
                    />
                  </Box>
                </div>
              ))}
          </Stack>
        </>
      )}
    </div>
  );
}
