import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Tractor, User, FileText, UserCircle, Bot, Mic, ClipboardList } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import CallingAgentCard from '../components/CallingAgentCard';


// ---------------------------------------------------------------------------
// Demo Banner Component
// ---------------------------------------------------------------------------

function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('ks-demo-banner-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('ks-demo-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
        position: 'relative',
        animation: 'slideUp 0.4s ease',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        aria-label="Close banner"
      >
        ✕
      </button>

      {/* Title */}
      <h2
        style={{
          fontSize: '1.3rem',
          fontWeight: '800',
          marginBottom: '16px',
          paddingRight: '32px',
        }}
      >
        🏆 Hackathon Demo — 3 Key Features
      </h2>

      {/* Features list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Feature 1 */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📞</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '2px' }}>
              AI Calling Agent
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95, lineHeight: '1.4' }}>
              Call <strong>+1 (717) 931-0375</strong> to talk to an AI in Hindi/English
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>👥</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '2px' }}>
              Dual Role System
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95, lineHeight: '1.4' }}>
              Sign up as Farmer or Worker/Equipment Owner, switch roles anytime
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🎤</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '2px' }}>
              Full Voice Control
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95, lineHeight: '1.4' }}>
              Tap the green mic button to navigate by voice — no typing needed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role-specific content sections
// ---------------------------------------------------------------------------

function FarmerHome({ t, navigate, farmer }) {
  const quickActions = [
    {
      icon: <Tractor size={28} strokeWidth={1.5} />,
      label: t('उपकरण किराये पर', 'Rent Equipment'),
      sublabel: t('ट्रैक्टर, हार्वेस्टर, पंप', 'Tractor, Harvester, Pump'),
      color: 'blue',
      path: '/equipment',
    },
    {
      icon: <User size={28} strokeWidth={1.5} />,
      label: t('मजदूर खोजें', 'Find Workers'),
      sublabel: t('खेत मजदूर, ऑपरेटर', 'Field Workers, Operators'),
      color: 'orange',
      path: '/workers',
    },
    {
      icon: <ClipboardList size={28} strokeWidth={1.5} />,
      label: t('सरकारी योजनाएं', 'Govt Schemes'),
      sublabel: t('पात्रता जांचें', 'Check Eligibility'),
      color: 'purple',
      path: '/schemes',
    },
    {
      icon: <UserCircle size={28} strokeWidth={1.5} />,
      label: t('मेरी प्रोफ़ाइल', 'My Profile'),
      sublabel: t('आवाज या टाइप से भरें', 'Fill via Voice or Type'),
      color: 'blue',
      path: '/profile',
    },
    {
      icon: <Bot size={28} strokeWidth={1.5} />,
      label: t('AI सहायक', 'AI Assistant'),
      sublabel: t('कुछ भी पूछें', 'Ask Anything'),
      color: 'purple',
      path: '/assistant',
    },
    {
      icon: <Mic size={28} strokeWidth={1.5} />,
      label: t('आवाज से चलाएं', 'Voice Control'),
      sublabel: t('बोलकर काम करें', 'Speak to Navigate'),
      color: 'orange',
      path: null,
      isVoice: true,
    },
  ];

  const handleClick = (action) => {
    if (action.isVoice) {
      document.getElementById('voice-fab-btn')?.click();
    } else {
      navigate(action.path);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
          {farmer?.analyzed?.name || farmer?.name
            ? t(`नमस्ते ${farmer?.analyzed?.name || farmer?.name} जी! 🙏`, `Welcome ${farmer?.analyzed?.name || farmer?.name}! 🙏`)
            : t('नमस्ते किसान भाई! 🙏', 'Welcome Farmer! 🙏')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {t('आज आपको क्या चाहिए? बोलकर या नीचे दबाकर बताएं।', 'What do you need today? Speak or tap below.')}
        </p>
      </div>

      {/* AI Calling Agent Card - Featured */}
      <CallingAgentCard />

      {/* Voice Hint Banner */}
      <div className="card card-green" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>🎤</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
              {t('आवाज से चलाएं', 'Control by Voice')}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {t('हरे बटन को दबाएं और बोलें: "ट्रैक्टर किराये पर चाहिए"', 'Tap the green button and say: "I need a tractor for rent"')}
            </div>
          </div>
        </div>
      </div>

      <div className="section-title">
        <span className="emoji">⚡</span>
        {t('क्या करना है?', 'Quick Actions')}
      </div>

      <div className="grid-2">
        {quickActions.map((action, idx) => (
          <button key={idx} className="big-icon-btn" onClick={() => handleClick(action)}>
            <div className={`icon-wrapper ${action.color}`}>{action.icon}</div>
            <div className="label">{action.label}</div>
            <div className="sublabel">{action.sublabel}</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '32px' }}>
        <div className="section-title">
          <span className="emoji">📊</span>
          {t('प्लेटफ़ॉर्म पर', 'On Platform')}
        </div>
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-number">8+</div>
            <div className="stat-label">{t('उपकरण उपलब्ध', 'Equipment')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">6+</div>
            <div className="stat-label">{t('मजदूर उपलब्ध', 'Workers')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">20+</div>
            <div className="stat-label">{t('सरकारी योजनाएं', 'Schemes')}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function WorkerHome({ t, navigate, user }) {
  const workerName = user?.workerProfile?.name || 'Worker';
  const available = user?.workerProfile?.available ?? true;

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
          {t(`नमस्ते ${workerName}! 👷`, `Hello ${workerName}! 👷`)}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {t('आपका वर्कर होम', 'Your Worker Home')}
        </p>
      </div>

      {/* AI Calling Agent Card - Featured */}
      <CallingAgentCard />

      {/* Availability status banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          background: available ? '#f1f8e9' : '#fff8e1',
          border: `2px solid ${available ? '#a5d6a7' : '#ffcc80'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }}>{available ? '🟢' : '🔴'}</span>
          <div>
            <div style={{ fontWeight: 700 }}>
              {available ? t('आप उपलब्ध हैं', 'You are Available') : t('आप अनुपलब्ध हैं', 'You are Unavailable')}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('डैशबोर्ड से बदलें', 'Change from your dashboard')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <button className="big-icon-btn" onClick={() => navigate('/worker-dashboard')}>
          <div className="icon-wrapper orange"><ClipboardList size={28} strokeWidth={1.5} /></div>
          <div className="label">{t('काम के अनुरोध', 'Job Requests')}</div>
          <div className="sublabel">{t('स्वीकार / अस्वीकार करें', 'Accept / Reject')}</div>
        </button>
        <button className="big-icon-btn" onClick={() => navigate('/profile')}>
          <div className="icon-wrapper purple"><UserCircle size={28} strokeWidth={1.5} /></div>
          <div className="label">{t('मेरी प्रोफ़ाइल', 'My Profile')}</div>
          <div className="sublabel">{t('कौशल, दर, जानकारी', 'Skills, Rate, Info')}</div>
        </button>
        <button className="big-icon-btn" onClick={() => navigate('/assistant')}>
          <div className="icon-wrapper blue"><Bot size={28} strokeWidth={1.5} /></div>
          <div className="label">{t('AI सहायक', 'AI Assistant')}</div>
          <div className="sublabel">{t('मदद लें', 'Get Help')}</div>
        </button>
        <button className="big-icon-btn" onClick={() => document.getElementById('voice-fab-btn')?.click()}>
          <div className="icon-wrapper orange"><Mic size={28} strokeWidth={1.5} /></div>
          <div className="label">{t('आवाज कमांड', 'Voice Commands')}</div>
          <div className="sublabel">{t('"available hoon" बोलें', 'Say "available hoon"')}</div>
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">2</div>
          <div className="stat-label">{t('नए अनुरोध', 'New Requests')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">₹0</div>
          <div className="stat-label">{t('आज की कमाई', "Today's Earnings")}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{available ? '✅' : '⏸'}</div>
          <div className="stat-label">{t('स्थिति', 'Status')}</div>
        </div>
      </div>
    </>
  );
}

function EquipmentOwnerHome({ t, navigate, user }) {
  const ownerName = user?.equipmentProfile?.name || 'Equipment Owner';

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
          {t(`नमस्ते ${ownerName}! 🚜`, `Hello ${ownerName}! 🚜`)}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {t('उपकरण मालिक डैशबोर्ड', 'Equipment Owner Dashboard')}
        </p>
      </div>

      {/* AI Calling Agent Card - Featured */}
      <CallingAgentCard />

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <button className="big-icon-btn" onClick={() => navigate('/equipment')}>
          <div className="icon-wrapper blue"><Tractor size={28} strokeWidth={1.5} /></div>
          <div className="label">{t('मेरे उपकरण', 'My Equipment')}</div>
          <div className="sublabel">{t('लिस्टिंग देखें', 'View Listings')}</div>
        </button>
        <button className="big-icon-btn" onClick={() => navigate('/profile')}>
          <div className="icon-wrapper purple"><UserCircle size={28} strokeWidth={1.5} /></div>
          <div className="label">{t('मेरी प्रोफ़ाइल', 'My Profile')}</div>
          <div className="sublabel">{t('जानकारी अपडेट करें', 'Update Info')}</div>
        </button>
        <button className="big-icon-btn" onClick={() => navigate('/assistant')}>
          <div className="icon-wrapper orange"><Bot size={28} strokeWidth={1.5} /></div>
          <div className="label">{t('AI सहायक', 'AI Assistant')}</div>
          <div className="sublabel">{t('मदद लें', 'Get Help')}</div>
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">0</div>
          <div className="stat-label">{t('मेरी लिस्टिंग', 'My Listings')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">0</div>
          <div className="stat-label">{t('सक्रिय किराये', 'Active Rentals')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">₹0</div>
          <div className="stat-label">{t('कुल कमाई', 'Total Earnings')}</div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Home — delegates to role-specific component
// ---------------------------------------------------------------------------

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, activeRole, farmer } = useAuth();

  // If no role set yet, show a prompt to complete setup
  if (!activeRole) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', paddingTop: '40px' }}>
        <DemoBanner />
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '48px 40px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '540px',
          width: '100%',
          border: '1px solid rgba(22, 163, 74, 0.1)',
          animation: 'slideUp 0.5s ease-out',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            width: '80px', height: '80px', background: '#dcfce7', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.5rem',
            boxShadow: '0 0 0 8px #f0fdf4'
          }}>
            🌾
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            {t('KissanSetu में आपका स्वागत है!', 'Welcome to KissanSetu!')}
          </h2>
          <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '36px' }}>
            {t('शुरू करने के लिए अपनी भूमिका चुनें।', 'Please complete your profile setup to unlock features tailored to farmers, workers, and equipment owners.')}
          </p>
          <button
            onClick={() => navigate('/profile')}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '16px 32px', borderRadius: '16px', width: '100%',
              background: '#16a34a', color: 'white', 
              fontWeight: '700', fontSize: '1.1rem',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 20px -5px rgba(22, 163, 74, 0.4)'
            }}
            onMouseOver={(e) => {
               e.currentTarget.style.transform = 'translateY(-2px)';
               e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(22, 163, 74, 0.5)';
            }}
            onMouseOut={(e) => {
               e.currentTarget.style.transform = 'translateY(0)';
               e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(22, 163, 74, 0.4)';
            }}
          >
            {t('प्रोफ़ाइल सेट करें', 'Set Up Profile')} <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <DemoBanner />
      {activeRole === 'farmer' && (
        <FarmerHome t={t} navigate={navigate} farmer={farmer} />
      )}
      {activeRole === 'worker' && (
        <WorkerHome t={t} navigate={navigate} user={user} />
      )}
      {activeRole === 'equipment_owner' && (
        <EquipmentOwnerHome t={t} navigate={navigate} user={user} />
      )}
    </div>
  );
}
