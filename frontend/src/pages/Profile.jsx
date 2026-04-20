import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// MUI Icons
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ReplayIcon from '@mui/icons-material/Replay';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import WorkIcon from '@mui/icons-material/Work';
import AgricultureIcon from '@mui/icons-material/Agriculture';

import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../hooks/useVoice';
import { useActivityVoice } from '../hooks/useActivityVoice';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { API } from '../config/constants';

const PII_FIELDS = [
  { field: 'hasAadhaar', labelHi: 'आधार कार्ड है?', labelEn: 'Have Aadhaar Card?' },
  { field: 'hasBankAccount', labelHi: 'बैंक खाता है?', labelEn: 'Have Bank Account?' },
  { field: 'hasLivestock', labelHi: 'पशु हैं?', labelEn: 'Have Livestock?' },
];

const ALL_FIELDS = [
  { field: 'name', labelHi: 'नाम', labelEn: 'Name', type: 'text', icon: '👤' },
  { field: 'age', labelHi: 'उम्र', labelEn: 'Age', type: 'number', icon: '🎂' },
  { field: 'gender', labelHi: 'लिंग', labelEn: 'Gender', type: 'select', options: ['male', 'female', 'other'], icon: '⚧️' },
  { field: 'village', labelHi: 'गाँव', labelEn: 'Village', type: 'text', icon: '🏡' },
  { field: 'district', labelHi: 'जिला', labelEn: 'District', type: 'text', icon: '📍' },
  { field: 'state', labelHi: 'राज्य', labelEn: 'State', type: 'text', icon: '🗺️' },
  { field: 'pincode', labelHi: 'पिन कोड', labelEn: 'Pin Code', type: 'text', icon: '📮' },
  { field: 'landAcres', labelHi: 'जमीन (एकड़)', labelEn: 'Land (Acres)', type: 'number', icon: '🌾' },
  { field: 'irrigationType', labelHi: 'सिंचाई', labelEn: 'Irrigation', type: 'text', icon: '💧' },
  { field: 'crops', labelHi: 'फसलें', labelEn: 'Crops', type: 'text', isArray: true, icon: '🌱' },
  { field: 'annualIncome', labelHi: 'सालाना आय', labelEn: 'Annual Income', type: 'number', icon: '💰' },
  { field: 'familyMembers', labelHi: 'परिवार', labelEn: 'Family', type: 'number', icon: '👨‍👩‍👧‍👦' },
];

const WORKER_FIELDS = [
  { field: 'name', labelHi: 'नाम', labelEn: 'Name', type: 'text', icon: '👤' },
  { field: 'skills', labelHi: 'कौशल', labelEn: 'Skills', type: 'text', isArray: true, icon: '🛠️' },
  { field: 'dailyRate', labelHi: 'दैनिक दर (₹)', labelEn: 'Daily Rate (₹)', type: 'number', icon: '💰' },
  { field: 'experience', labelHi: 'अनुभव (साल)', labelEn: 'Experience (yrs)', type: 'number', icon: '📅' },
  { field: 'village', labelHi: 'गाँव', labelEn: 'Village', type: 'text', icon: '🏡' },
  { field: 'district', labelHi: 'जिला', labelEn: 'District', type: 'text', icon: '📍' },
  { field: 'state', labelHi: 'राज्य', labelEn: 'State', type: 'text', icon: '🗺️' },
  { field: 'bio', labelHi: 'परिचय', labelEn: 'Bio', type: 'text', icon: '📝' },
];

const EQUIPMENT_LISTING_FIELDS = [
  { field: 'type', labelHi: 'उपकरण प्रकार', labelEn: 'Equipment Type', type: 'select', options: ['tractor', 'harvester', 'rotavator', 'sprayer', 'seeder', 'pump', 'thresher'], icon: '🚜' },
  { field: 'name', labelHi: 'नाम / मॉडल', labelEn: 'Name / Model', type: 'text', icon: '🏷️' },
  { field: 'condition', labelHi: 'हालत', labelEn: 'Condition', type: 'select', options: ['new', 'good', 'fair', 'poor'], icon: '⭐' },
  { field: 'pricePerHour', labelHi: 'किराया (₹/घंटा)', labelEn: 'Price (₹/hr)', type: 'number', icon: '⏱️' },
  { field: 'pricePerDay', labelHi: 'किराया (₹/दिन)', labelEn: 'Price (₹/day)', type: 'number', icon: '📆' },
  { field: 'description', labelHi: 'विवरण', labelEn: 'Description', type: 'text', icon: '📝' },
  { field: 'village', labelHi: 'गाँव', labelEn: 'Village', type: 'text', icon: '🏡' },
  { field: 'district', labelHi: 'जिला', labelEn: 'District', type: 'text', icon: '📍' },
  { field: 'state', labelHi: 'राज्य', labelEn: 'State', type: 'text', icon: '🗺️' },
];

export default function Profile() {
  const { lang, t } = useLang();
  const { user, activeRole, updateProfile, token } = useAuth();
  const voice = useVoice(lang);
  const activityVoice = useActivityVoice(lang);

  // Core app state
  const [activeTab, setActiveTab] = useState(user ? 'dashboard' : 'profile'); // 'dashboard', 'profile'
  
  // Profile Modes: 'choose', 'voice-recording', 'analyzing', 'view', 'type'
  const [mode, setMode] = useState(user ? 'view' : 'choose');

  // Load farmer profile from user object (persisted in localStorage via AuthContext)
  const loadFarmerProfile = () => {
    const fp = user?.farmerProfile;
    if (!fp) return null;
    // Flatten nested location if present
    return {
      ...fp,
      village: fp.village || fp.location?.village,
      district: fp.district || fp.location?.district,
      state: fp.state || fp.location?.state,
      pincode: fp.pincode || fp.location?.pincode,
    };
  };

  const [extractedData, setExtractedData] = useState(() => loadFarmerProfile());
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Background processing
  const [parseError, setParseError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Dashboard state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState(null);

  // Worker profile state
  const [workerData, setWorkerData] = useState(() => {
    const wp = user?.workerProfile;
    if (!wp) return null;
    return {
      ...wp,
      village: wp.village || wp.location?.village,
      district: wp.district || wp.location?.district,
      state: wp.state || wp.location?.state,
    };
  });
  const [workerMode, setWorkerMode] = useState('view'); // 'view', 'voice-recording', 'analyzing'
  const [workerSaving, setWorkerSaving] = useState(false);
  const [workerEditingField, setWorkerEditingField] = useState(null);
  const [workerEditValue, setWorkerEditValue] = useState('');

  // Equipment listing state (for equipment_owner role)
  const [equipmentData, setEquipmentData] = useState(() => user?.equipmentProfile?.listing || null);
  const [equipmentMode, setEquipmentMode] = useState('view'); // 'view', 'voice-recording', 'analyzing'
  const [equipmentSaving, setEquipmentSaving] = useState(false);
  const [equipmentEditingField, setEquipmentEditingField] = useState(null);
  const [equipmentEditValue, setEquipmentEditValue] = useState('');

  // Sync profile data when user object changes (e.g. after save/refresh)
  useEffect(() => {
    if (user?.farmerProfile) {
      const fp = user.farmerProfile;
      setExtractedData({
        ...fp,
        village: fp.village || fp.location?.village,
        district: fp.district || fp.location?.district,
        state: fp.state || fp.location?.state,
        pincode: fp.pincode || fp.location?.pincode,
      });
    }
    if (user?.workerProfile) {
      const wp = user.workerProfile;
      setWorkerData({
        ...wp,
        village: wp.village || wp.location?.village,
        district: wp.district || wp.location?.district,
        state: wp.state || wp.location?.state,
      });
    }
  }, [user]);

  // Fetch bookings when dashboard loads
  useEffect(() => {
    if (activeTab === 'dashboard' && user) {
      fetchBookings();
    }
  }, [activeTab, user]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      // currently hardcoded to user 'user' or use user._id if available
      const userIdToUse = user._id || 'user';
      const res = await fetch(`${API.bookings}?farmerId=${userIdToUse}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.error('Failed to fetch bookings', e);
    }
    setLoadingBookings(false);
  };

  // Profile creation now starts directly since user is already authenticated via phone OTP

  // --- RECORDING & AI ---
  const startRecording = async (updateMode = false) => {
    setIsUpdateMode(updateMode); // if true, it's filling missing details
    setMode('voice-recording');
    setParseError(null);
    voice.startListening();

    const instruction = updateMode 
      ? t('जो जानकारी रह गई है, वह बोलें।', 'Please speak the missing details.')
      : t('अपना नाम, उम्र, गाँव, जमीन, फसलें सब बताइये।', 'Tell your name, age, village, land, crops.');
    await voice.speak(instruction, lang);
  };

  const stopRecordingAndParse = async () => {
    const finalText = voice.stopListening();

    if (!finalText || finalText.trim().length < 3) {
      setParseError(t('कुछ सुनाई नहीं दिया।', 'Could not hear anything.'));
      setMode('view');
      return;
    }

    setMode('analyzing');
    try {
      // If update mode, pass existing profile to not overwrite data
      const endpoint = isUpdateMode ? '/parse-profile-update' : '/parse-profile-dump';
      const bodyPayload = { transcript: finalText, language: lang };
      
      if (isUpdateMode) {
        bodyPayload.existingProfile = extractedData; 
      }

      const res = await fetch(`${API.ai}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const parsed = await res.json();

      if (parsed.error) {
        setParseError(parsed.error);
        setMode('view');
        return;
      }

      const flat = {
        ...parsed,
        village: parsed.location?.village || parsed.village,
        district: parsed.location?.district || parsed.district,
        state: parsed.location?.state || parsed.state,
        pincode: parsed.location?.pincode || parsed.pincode,
      };

      setExtractedData(flat);
      setMode('view');

      await voice.speak(t('मैंने जानकारी अपडेट कर दी है।', 'I have updated the details.'), lang);

    } catch (error) {
      console.error('Profile parse error:', error);
      setParseError(t('AI से जवाब नहीं आया।', 'No response from AI.'));
      setMode('view');
    }
  };

  // --- MANUAL FIELD EDIT ---
  const startEditField = (fieldKey) => {
    const fieldDef = ALL_FIELDS.find(f => f.field === fieldKey);
    const currentValue = extractedData?.[fieldKey];
    setEditingField(fieldKey);
    setEditValue(fieldDef?.isArray && Array.isArray(currentValue) ? currentValue.join(', ') : (currentValue ?? ''));
  };

  const saveFieldEdit = () => {
    if (!editingField) return;
    const fieldDef = ALL_FIELDS.find(f => f.field === editingField);
    let value = editValue;
    if (fieldDef?.type === 'number') value = Number(value) || null;
    if (fieldDef?.isArray) value = editValue.split(',').map(s => s.trim()).filter(Boolean);

    setExtractedData(prev => ({ ...prev, [editingField]: value }));
    setEditingField(null);
  };

  const handleManualSave = async () => {
    if (!user?._id || !extractedData) return;
    setSaving(true);
    setMode('analyzing');
    try {
      // Build a clean farmer profile object
      const profileData = {
        name: extractedData.name,
        age: extractedData.age,
        gender: extractedData.gender,
        location: {
          village: extractedData.village,
          district: extractedData.district,
          state: extractedData.state,
          pincode: extractedData.pincode,
        },
        village: extractedData.village,
        district: extractedData.district,
        state: extractedData.state,
        pincode: extractedData.pincode,
        landAcres: extractedData.landAcres,
        irrigationType: extractedData.irrigationType,
        crops: extractedData.crops,
        annualIncome: extractedData.annualIncome,
        familyMembers: extractedData.familyMembers,
        hasAadhaar: extractedData.hasAadhaar,
        hasBankAccount: extractedData.hasBankAccount,
        hasLivestock: extractedData.hasLivestock,
      };

      const result = await updateProfile(user._id, 'farmer', profileData);
      if (result.success) {
        setMode('view');
        setActiveTab('dashboard');
        await voice.speak(t('प्रोफ़ाइल सेव हो गई!', 'Profile saved!'), lang);
      } else {
        setMode('view');
      }
    } catch(e) {
      console.error('Save error:', e);
      setMode('view');
    }
    setSaving(false);
  };

  // --- WORKER PROFILE VOICE FILL ---
  const startWorkerVoiceRecording = async () => {
    setWorkerMode('voice-recording');
    voice.startListening();
    await voice.speak(
      t(
        'अपना नाम, कौशल, दैनिक दर, स्थान और अपने बारे में बताइये।',
        'Tell your name, skills, daily rate, location, and a bit about yourself.'
      ),
      lang
    );
  };

  const stopWorkerRecordingAndParse = async () => {
    const finalText = voice.stopListening();
    if (!finalText || finalText.trim().length < 3) {
      setWorkerMode('view');
      return;
    }
    setWorkerMode('analyzing');
    try {
      const res = await fetch(`${API.ai}/parse-worker-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalText, language: lang, existingProfile: workerData })
      });
      const parsed = await res.json();
      if (parsed.error) { setWorkerMode('view'); return; }

      // Flatten location fields for display
      const flat = {
        ...parsed,
        village: parsed.location?.village || parsed.village,
        district: parsed.location?.district || parsed.district,
        state: parsed.location?.state || parsed.state,
      };
      setWorkerData(flat);
      setWorkerMode('view');
      await voice.speak(t('मैंने जानकारी अपडेट कर दी है।', 'I have updated the details.'), lang);
    } catch (err) {
      console.error('Worker profile parse error:', err);
      setWorkerMode('view');
    }
  };

  const saveWorkerProfile = async () => {
    if (!user?._id || !workerData) return;
    setWorkerSaving(true);
    try {
      const result = await updateProfile(user._id, 'worker', workerData);
      if (result.success) {
        await voice.speak(t('वर्कर प्रोफ़ाइल सेव हो गई!', 'Worker profile saved!'), lang);
      }
    } catch (err) {
      console.error('Worker save error:', err);
    }
    setWorkerSaving(false);
  };

  const startWorkerFieldEdit = (fieldKey) => {
    const fieldDef = WORKER_FIELDS.find(f => f.field === fieldKey);
    const currentValue = workerData?.[fieldKey];
    setWorkerEditingField(fieldKey);
    setWorkerEditValue(fieldDef?.isArray && Array.isArray(currentValue) ? currentValue.join(', ') : (currentValue ?? ''));
  };

  const saveWorkerFieldEdit = () => {
    if (!workerEditingField) return;
    const fieldDef = WORKER_FIELDS.find(f => f.field === workerEditingField);
    let value = workerEditValue;
    if (fieldDef?.type === 'number') value = Number(value) || null;
    if (fieldDef?.isArray) value = workerEditValue.split(',').map(s => s.trim()).filter(Boolean);
    setWorkerData(prev => ({ ...(prev || {}), [workerEditingField]: value }));
    setWorkerEditingField(null);
  };

  // --- EQUIPMENT LISTING VOICE FILL ---
  const startEquipmentVoiceRecording = async () => {
    setEquipmentMode('voice-recording');
    voice.startListening();
    await voice.speak(
      t(
        'उपकरण का प्रकार, हालत, किराया प्रति घंटा, और स्थान बताइये।',
        'Tell the equipment type, condition, price per hour, and location.'
      ),
      lang
    );
  };

  const stopEquipmentRecordingAndParse = async () => {
    const finalText = voice.stopListening();
    if (!finalText || finalText.trim().length < 3) {
      setEquipmentMode('view');
      return;
    }
    setEquipmentMode('analyzing');
    try {
      const res = await fetch(`${API.ai}/parse-equipment-listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalText, language: lang, existingListing: equipmentData })
      });
      const parsed = await res.json();
      if (parsed.error) { setEquipmentMode('view'); return; }

      const flat = {
        ...parsed,
        village: parsed.location?.village || parsed.village,
        district: parsed.location?.district || parsed.district,
        state: parsed.location?.state || parsed.state,
      };
      setEquipmentData(flat);
      setEquipmentMode('view');
      await voice.speak(t('उपकरण की जानकारी अपडेट हो गई।', 'Equipment details updated.'), lang);
    } catch (err) {
      console.error('Equipment listing parse error:', err);
      setEquipmentMode('view');
    }
  };

  const saveEquipmentListing = async () => {
    if (!user?._id || !equipmentData) return;
    setEquipmentSaving(true);
    try {
      const result = await updateProfile(user._id, 'equipment_owner', { listing: equipmentData });
      if (result.success) {
        await voice.speak(t('उपकरण लिस्टिंग सेव हो गई!', 'Equipment listing saved!'), lang);
      }
    } catch (err) {
      console.error('Equipment save error:', err);
    }
    setEquipmentSaving(false);
  };

  const startEquipmentFieldEdit = (fieldKey) => {
    const fieldDef = EQUIPMENT_LISTING_FIELDS.find(f => f.field === fieldKey);
    const currentValue = equipmentData?.[fieldKey];
    setEquipmentEditingField(fieldKey);
    setEquipmentEditValue(currentValue ?? '');
  };

  const saveEquipmentFieldEdit = () => {
    if (!equipmentEditingField) return;
    const fieldDef = EQUIPMENT_LISTING_FIELDS.find(f => f.field === equipmentEditingField);
    let value = equipmentEditValue;
    if (fieldDef?.type === 'number') value = Number(value) || null;
    setEquipmentData(prev => ({ ...(prev || {}), [equipmentEditingField]: value }));
    setEquipmentEditingField(null);
  };


  // ===================== RENDERERS =====================

  // Shared field grid renderer for worker/equipment profiles
  const renderFieldGrid = (fields, data, editingField, editValue, onStartEdit, onSaveEdit, onChangeEdit) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', width: '100%' }}>
      {fields.map(f => {
        const val = data?.[f.field];
        const isMissing = val === undefined || val === null || val === '';
        const displayVal = f.isArray && Array.isArray(val) ? val.join(', ') : val;
        const isEditing = editingField === f.field;

        return (
          <div key={f.field} style={{
            background: 'white',
            border: `1px solid ${isMissing ? 'var(--amber-200)' : 'var(--slate-200)'}`,
            borderRadius: '14px',
            padding: '14px',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ fontSize: '1.1rem' }}>{f.icon}</div>
              {!isEditing && (
                <button onClick={() => onStartEdit(f.field)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
                  <EditIcon style={{ fontSize: '1rem' }} />
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {lang === 'hi' ? f.labelHi : f.labelEn}
            </div>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                {f.type === 'select' ? (
                  <select className="form-input" value={editValue} onChange={e => onChangeEdit(e.target.value)} style={{ padding: '4px', fontSize: '0.9rem' }}>
                    <option value="">--</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type === 'number' ? 'number' : 'text'} autoFocus className="form-input"
                    style={{ padding: '4px 8px', fontSize: '0.9rem' }} value={editValue}
                    onChange={e => onChangeEdit(e.target.value)} />
                )}
                <button className="btn btn-primary" style={{ padding: '4px' }} onClick={onSaveEdit}>
                  <CheckIcon fontSize="small" /> {t('सेव', 'Save')}
                </button>
              </div>
            ) : (
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: isMissing ? 'var(--amber-600)' : 'var(--slate-800)',
                wordBreak: 'break-word'
              }}>
                {isMissing ? t('खाली है', 'Empty') : String(displayVal)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Worker profile section
  const renderWorkerSection = () => {
    if (workerMode === 'analyzing') {
      return (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{t('🤖 AI समझ रहा है...', '🤖 AI is analyzing...')}</p>
        </div>
      );
    }

    if (workerMode === 'voice-recording') {
      return (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <MicIcon style={{ fontSize: '3rem', color: 'var(--green-600)', animation: 'float 2s ease-in-out infinite' }} />
          <h3 style={{ margin: '12px 0 8px', fontSize: '1.1rem' }}>
            {t('बोलिए — नाम, कौशल, दर, स्थान...', 'Speak — name, skills, rate, location...')}
          </h3>
          {voice.isListening && (
            <div className="waveform" style={{ justifyContent: 'center', margin: '12px 0' }}>
              {[...Array(7)].map((_, i) => <div key={i} className="bar" />)}
            </div>
          )}
          <div style={{ minHeight: '60px', margin: '12px 0', padding: '12px', background: 'var(--green-50)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {voice.transcript || '...'}
          </div>
          <button className="btn btn-danger btn-full" onClick={stopWorkerRecordingAndParse}>
            <MicOffIcon /> {t('हो गया — अब जांचें', 'Done — Analyze')}
          </button>
        </div>
      );
    }

    return (
      <div>
        {/* Action bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className="btn btn-primary" style={{ flex: 1, padding: '10px' }} onClick={startWorkerVoiceRecording}>
            <MicIcon fontSize="small" /> {t('आवाज से भरें', 'Fill with Voice')}
          </button>
          <button className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={saveWorkerProfile} disabled={workerSaving || !workerData}>
            <CheckIcon fontSize="small" /> {workerSaving ? '...' : t('सेव करें', 'Save')}
          </button>
        </div>

        {/* Availability toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid var(--slate-200)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t('उपलब्धता', 'Availability')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {workerData?.available ? t('✅ उपलब्ध हूँ', '✅ Available') : t('🔴 अभी व्यस्त हूँ', '🔴 Currently Busy')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${workerData?.available === true ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px' }}
              onClick={() => setWorkerData(prev => ({ ...(prev || {}), available: true }))}
            >
              {t('उपलब्ध', 'Available')}
            </button>
            <button
              className={`btn ${workerData?.available === false ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '6px 14px' }}
              onClick={() => setWorkerData(prev => ({ ...(prev || {}), available: false }))}
            >
              {t('व्यस्त', 'Busy')}
            </button>
          </div>
        </div>

        {renderFieldGrid(
          WORKER_FIELDS, workerData,
          workerEditingField, workerEditValue,
          startWorkerFieldEdit, saveWorkerFieldEdit,
          (v) => setWorkerEditValue(v)
        )}
      </div>
    );
  };

  // Equipment listing section
  const renderEquipmentSection = () => {
    if (equipmentMode === 'analyzing') {
      return (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{t('🤖 AI समझ रहा है...', '🤖 AI is analyzing...')}</p>
        </div>
      );
    }

    if (equipmentMode === 'voice-recording') {
      return (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <MicIcon style={{ fontSize: '3rem', color: 'var(--green-600)', animation: 'float 2s ease-in-out infinite' }} />
          <h3 style={{ margin: '12px 0 8px', fontSize: '1.1rem' }}>
            {t('बोलिए — उपकरण, हालत, किराया, स्थान...', 'Speak — equipment, condition, price, location...')}
          </h3>
          {voice.isListening && (
            <div className="waveform" style={{ justifyContent: 'center', margin: '12px 0' }}>
              {[...Array(7)].map((_, i) => <div key={i} className="bar" />)}
            </div>
          )}
          <div style={{ minHeight: '60px', margin: '12px 0', padding: '12px', background: 'var(--green-50)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {voice.transcript || '...'}
          </div>
          <button className="btn btn-danger btn-full" onClick={stopEquipmentRecordingAndParse}>
            <MicOffIcon /> {t('हो गया — अब जांचें', 'Done — Analyze')}
          </button>
        </div>
      );
    }

    return (
      <div>
        {/* Action bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className="btn btn-primary" style={{ flex: 1, padding: '10px' }} onClick={startEquipmentVoiceRecording}>
            <MicIcon fontSize="small" /> {t('आवाज से भरें', 'Fill with Voice')}
          </button>
          <button className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={saveEquipmentListing} disabled={equipmentSaving || !equipmentData}>
            <CheckIcon fontSize="small" /> {equipmentSaving ? '...' : t('सेव करें', 'Save')}
          </button>
        </div>

        {/* Rent / Sale toggles */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, background: 'white', border: '1px solid var(--slate-200)', borderRadius: '14px', padding: '12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('किराये पर देना है?', 'Available for Rent?')}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className={`btn ${equipmentData?.availableForRent === true ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '5px' }}
                onClick={() => setEquipmentData(prev => ({ ...(prev || {}), availableForRent: true }))}>
                {t('हाँ', 'Yes')}
              </button>
              <button className={`btn ${equipmentData?.availableForRent === false ? 'btn-danger' : 'btn-secondary'}`} style={{ flex: 1, padding: '5px' }}
                onClick={() => setEquipmentData(prev => ({ ...(prev || {}), availableForRent: false }))}>
                {t('नहीं', 'No')}
              </button>
            </div>
          </div>
          <div style={{ flex: 1, background: 'white', border: '1px solid var(--slate-200)', borderRadius: '14px', padding: '12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('बेचना है?', 'Available for Sale?')}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className={`btn ${equipmentData?.availableForSale === true ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '5px' }}
                onClick={() => setEquipmentData(prev => ({ ...(prev || {}), availableForSale: true }))}>
                {t('हाँ', 'Yes')}
              </button>
              <button className={`btn ${equipmentData?.availableForSale === false ? 'btn-danger' : 'btn-secondary'}`} style={{ flex: 1, padding: '5px' }}
                onClick={() => setEquipmentData(prev => ({ ...(prev || {}), availableForSale: false }))}>
                {t('नहीं', 'No')}
              </button>
            </div>
          </div>
        </div>

        {renderFieldGrid(
          EQUIPMENT_LISTING_FIELDS, equipmentData,
          equipmentEditingField, equipmentEditValue,
          startEquipmentFieldEdit, saveEquipmentFieldEdit,
          (v) => setEquipmentEditValue(v)
        )}
      </div>
    );
  };

  const renderTabs = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--slate-100)', padding: '6px', borderRadius: '16px' }}>
      <button 
        onClick={() => setActiveTab('dashboard')}
        style={{ flex: 1, padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                 background: activeTab === 'dashboard' ? 'white' : 'transparent', 
                 color: activeTab === 'dashboard' ? 'var(--green-700)' : 'var(--text-secondary)',
                 fontWeight: activeTab === 'dashboard' ? 700 : 500,
                 boxShadow: activeTab === 'dashboard' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                 transition: 'all 0.2s ease', border: 'none', cursor: 'pointer' }}
      >
        <DashboardIcon fontSize="small" /> {t('डैशबोर्ड', 'Dashboard')}
      </button>
      <button 
        onClick={() => setActiveTab('profile')}
        style={{ flex: 1, padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                 background: activeTab === 'profile' ? 'white' : 'transparent', 
                 color: activeTab === 'profile' ? 'var(--green-700)' : 'var(--text-secondary)',
                 fontWeight: activeTab === 'profile' ? 700 : 500,
                 boxShadow: activeTab === 'profile' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                 transition: 'all 0.2s ease', border: 'none', cursor: 'pointer' }}
      >
        <PersonIcon fontSize="small" /> {t('मेरी प्रोफ़ाइल', 'My Profile')}
      </button>
    </div>
  );

  if (!user && mode === 'choose') {
    // Profile creation now starts directly since user is already phone-verified
  }

  // Analyzing Mode
  if (mode === 'analyzing') {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div className="loading-spinner" />
        <h2 style={{ marginTop: '24px', fontSize: '1.3rem' }}>{t('🤖 AI समझ रहा है...', '🤖 AI is analyzing...')}</h2>
      </div>
    );
  }

  // Voice Recording Mode
  if (mode === 'voice-recording') {
    return (
      <div className="page-container">
        <div className="voice-question">
          <MicIcon style={{ fontSize: '4rem', color: 'var(--green-600)', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
            {isUpdateMode ? t('छूटी हुई जानकारी बोलें', 'Speak missing details') : t('बोलिए... सब बताइये', 'Speak... tell everything')}
          </h2>

          <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {voice.isListening && (
              <div className="waveform" style={{ justifyContent: 'center' }}>
                {[...Array(7)].map((_, i) => <div key={i} className="bar" />)}
              </div>
            )}
          </div>

          <div style={{ minHeight: '80px', margin: '20px 0', padding: '16px', background: 'var(--green-50)', borderRadius: '12px' }}>
             {voice.transcript || '...'}
          </div>

          <button className="btn btn-danger btn-lg btn-full" onClick={stopRecordingAndParse}>
            <MicOffIcon /> {t('हो गया — अब जांचें', 'Done — Now Analyze')}
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  if (activeTab === 'dashboard' && user) {
    const totalSpent = bookings.reduce((sum, b) => {
       if(b.action === 'buy' && b.equipment?.price) return sum + b.equipment.price;
       if(b.action === 'rent' && b.equipment?.price) return sum + (b.equipment.price * 2); // mockup total
       return sum;
    }, 0);

    // Booked Dates Array for calendar tracking
    const activeDates = bookings.map(b => new Date(b.startDate).toDateString());

    return (
      <div className="page-container">
        {renderTabs()}
        
        {/* Simple Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
           <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '20px', borderRadius: '20px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>{t('खर्च (इस महीने)', 'Spent (This Month)')}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{totalSpent.toLocaleString()}</div>
           </div>
           <div style={{ background: 'white', border: '1px solid var(--slate-200)', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('कुल बुकिंग', 'Total Bookings')}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--slate-800)' }}>{bookings.length}</div>
           </div>
        </div>

        {/* Visual Calendar */}
        <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '16px' }}>
            <EventIcon style={{ color: 'var(--green-600)' }}/> {t('रेंटल कैलेंडर', 'Rental Calendar')}
          </h3>
          <div style={{ width: '100%', overflow: 'hidden', borderRadius: '12px' }}>
            <Calendar 
               className="kissan-calendar"
               tileClassName={({ date }) => activeDates.includes(date.toDateString()) ? 'booked-day' : null}
               tileContent={({ date, view }) => {
                 if (view === 'month') {
                   const dayBookings = bookings.filter(b => new Date(b.startDate).toDateString() === date.toDateString());
                   if (dayBookings.length > 0) {
                     return (
                       <div style={{ fontSize: '0.65rem', color: 'var(--green-700)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40px' }}>
                         {lang === 'hi' ? dayBookings[0].equipment?.nameHi : dayBookings[0].equipment?.name}
                       </div>
                     );
                   }
                 }
                 return null;
               }}
            />
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            .kissan-calendar { width: 100%; border: none; font-family: inherit; }
            .react-calendar__tile { padding: 12px 0; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 60px; }
            .react-calendar__tile:enabled:hover { background: var(--green-50); border-radius: 8px; }
            .react-calendar__tile--now { background: var(--slate-100); }
            .booked-day { background: var(--green-100) !important; color: var(--green-800); font-weight: 700; border-bottom: 3px solid var(--green-500); }
            .react-calendar__navigation button { font-weight: 700; font-size: 1.1rem; }
          `}} />
        </div>

        {/* Recent Activity List */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', paddingLeft: '4px' }}>
          {t('हाल की गतिविधियां', 'Recent Activity')}
        </h3>
        {loadingBookings ? <div className="skeleton" style={{ height: '60px', marginBottom: '12px' }}/> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                {t('कोई बुकिंग नहीं है', 'No bookings yet')}
              </div>
            ) : bookings.map(b => (
              <div 
                 key={b._id} 
                 style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', border: '1px solid var(--slate-100)', cursor: 'pointer', transition: '0.2s all' }}
                 onClick={() => setExpandedActivity(prev => prev === b._id ? null : b._id)}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>{b.equipment?.image || '🚜'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lang === 'hi' ? b.equipment?.nameHi || b.equipment?.name : b.equipment?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {new Date(b.startDate).toLocaleDateString()} • {b.action === 'rent' ? t('किराया', 'Rented') : t('खरीदा', 'Bought')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--green-700)' }}>
                    ₹{b.equipment?.price || 0}
                  </div>
                </div>

                {expandedActivity === b._id && (
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--slate-200)', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <strong>{t('स्थिति:', 'Status:')}</strong> {b.status} <br/>
                       <strong>{t('उद्देश्य:', 'Action:')}</strong> {b.action === 'rent' ? t('किराये पर लिया गया', 'Rented for use') : t('स्थायी रूप से खरीदा गया', 'Purchased permanently')}
                     </div>
                     <button 
                       className="btn btn-secondary" 
                       style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                       onClick={(e) => { e.stopPropagation(); activityVoice.analyzeAndSpeak(b, voice); }}
                       disabled={activityVoice.analyzing || voice.isSpeaking}
                     >
                       <VolumeUpIcon fontSize="small" />
                       {activityVoice.analyzing ? t('समझ रहा है...', 'Analyzing...') : t('सुने', 'Listen')}
                     </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // PROFILE VIEW (Grid format)
  return (
    <div className="page-container" style={{ width: '100%' }}>
      {user && (
         <div style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
           {renderTabs()}
         </div>
      )}

      {!user && (
         <div style={{ textAlign: 'center', marginBottom: '24px' }}>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('प्रोफ़ाइल विवरण', 'Profile Details')}</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('अपनी जानकारी भरें', 'Fill your information')}</p>
         </div>
      )}

      {/* AI Update Tools */}
      <div style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.1), rgba(16,185,129,0.1))', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto 24px' }}>
         <button className="btn btn-primary" style={{ flex: 1, padding: '10px' }} onClick={() => startRecording(true)}>
           <MicIcon fontSize="small" /> {t('बोलकर भरें', 'Fill Missing')}
         </button>
         <button className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={handleManualSave} disabled={saving}>
           <CheckIcon fontSize="small" /> {saving ? '...' : t('सेव', 'Save')}
         </button>
      </div>

      {/* Bento Grid layout for fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', width: '100%' }}>
        {ALL_FIELDS.map(f => {
          const val = extractedData?.[f.field];
          const isMissing = val === undefined || val === null || val === '';
          const displayVal = f.isArray && Array.isArray(val) ? val.join(', ') : val;
          const isEditing = editingField === f.field;

          return (
            <div key={f.field} style={{ 
              background: 'white', 
              border: `1px solid ${isMissing ? 'var(--amber-200)' : 'var(--slate-200)'}`, 
              borderRadius: '16px', 
              padding: '16px', 
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontSize: '1.2rem' }}>{f.icon}</div>
                {!isEditing && (
                  <button onClick={() => startEditField(f.field)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                    <EditIcon style={{ fontSize: '1rem' }} />
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {lang === 'hi' ? f.labelHi : f.labelEn}
              </div>

              {isEditing ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                   {f.type === 'select' ? (
                     <select className="form-input" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ padding: '4px', fontSize: '0.9rem' }}>
                       <option value="">--</option>
                       {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                     </select>
                   ) : (
                     <input type="text" autoFocus className="form-input" style={{ padding: '4px 8px', fontSize: '0.9rem' }} value={editValue} onChange={e => setEditValue(e.target.value)} />
                   )}
                   <button className="btn btn-primary" style={{ padding: '4px' }} onClick={saveFieldEdit}>
                      <CheckIcon fontSize="small"/> {t('सेव', 'Save')}
                   </button>
                 </div>
              ) : (
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  color: isMissing ? 'var(--amber-600)' : 'var(--slate-800)',
                  wordBreak: 'break-word'
                }}>
                  {isMissing ? t('खाली है', 'Empty') : displayVal}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PII Grid Fields */}
      {user && (
        <>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 16px 4px' }}>
            {t('निजी जानकारी (PII)', 'Private Info (PII)')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%', marginBottom: '40px' }}>
            {PII_FIELDS.map(f => {
              const val = extractedData?.[f.field];
              return (
                <div key={f.field} style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {lang === 'hi' ? f.labelHi : f.labelEn}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                       className={`btn ${val === true ? 'btn-primary' : 'btn-secondary'}`} 
                       style={{ padding: '6px 12px', opacity: val === true ? 1 : 0.6 }}
                       onClick={() => setExtractedData(prev => ({ ...prev, [f.field]: true }))}
                    >
                      {t('हाँ', 'Yes')}
                    </button>
                    <button 
                       className={`btn ${val === false ? 'btn-danger' : 'btn-secondary'}`} 
                       style={{ padding: '6px 12px', opacity: val === false ? 1 : 0.6 }}
                       onClick={() => setExtractedData(prev => ({ ...prev, [f.field]: false }))}
                    >
                      {t('नहीं', 'No')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Worker Profile Section — shown when user has worker role */}
      {user && (activeRole === 'worker' || user?.roles?.includes('worker')) && (
        <div style={{ marginTop: '32px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <WorkIcon style={{ color: 'var(--green-600)', fontSize: '1.5rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {t('वर्कर प्रोफ़ाइल', 'Worker Profile')}
            </h3>
          </div>
          <div style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.08), rgba(16,185,129,0.08))', borderRadius: '16px', padding: '16px' }}>
            {renderWorkerSection()}
          </div>
        </div>
      )}

      {/* Equipment Listing Section — shown when user has equipment_owner role */}
      {user && (activeRole === 'equipment_owner' || user?.roles?.includes('equipment_owner')) && (
        <div style={{ marginTop: '32px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AgricultureIcon style={{ color: 'var(--green-600)', fontSize: '1.5rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {t('उपकरण लिस्टिंग', 'Equipment Listing')}
            </h3>
          </div>
          <div style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.08), rgba(99,102,241,0.08))', borderRadius: '16px', padding: '16px' }}>
            {renderEquipmentSection()}
          </div>
        </div>
      )}

    </div>
  );
}
