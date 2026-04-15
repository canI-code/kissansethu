import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { farmer } = useAuth();

  const quickActions = [
    {
      emoji: '🚜',
      label: t('उपकरण किराये पर', 'Rent Equipment'),
      sublabel: t('ट्रैक्टर, हार्वेस्टर, पंप', 'Tractor, Harvester, Pump'),
      color: '',
      path: '/equipment'
    },
    {
      emoji: '👷',
      label: t('मजदूर खोजें', 'Find Workers'),
      sublabel: t('खेत मजदूर, ऑपरेटर', 'Field Workers, Operators'),
      color: 'orange',
      path: '/workers'
    },
    {
      emoji: '📋',
      label: t('सरकारी योजनाएं', 'Govt Schemes'),
      sublabel: t('पात्रता जांचें', 'Check Eligibility'),
      color: 'blue',
      path: '/schemes'
    },
    {
      emoji: '👤',
      label: t('मेरी प्रोफ़ाइल', 'My Profile'),
      sublabel: t('आवाज या टाइप से भरें', 'Fill via Voice or Type'),
      color: 'purple',
      path: '/profile'
    },
    {
      emoji: '🤖',
      label: t('AI सहायक', 'AI Assistant'),
      sublabel: t('कुछ भी पूछें', 'Ask Anything'),
      color: '',
      path: '/assistant'
    },
    {
      emoji: '🎤',
      label: t('आवाज से चलाएं', 'Voice Control'),
      sublabel: t('बोलकर काम करें', 'Speak to Navigate'),
      color: 'orange',
      path: null,
      isVoice: true
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
    <div className="page-container">
      {/* Welcome Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
          {farmer?.analyzed?.name 
            ? t(`नमस्ते ${farmer.analyzed.name} जी! 🙏`, `Welcome ${farmer.analyzed.name}! 🙏`)
            : t('नमस्ते किसान भाई! 🙏', 'Welcome Farmer! 🙏')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {t('आज आपको क्या चाहिए? बोलकर या नीचे दबाकर बताएं।', 
             'What do you need today? Speak or tap below.')}
        </p>
      </div>

      {/* Voice Hint Banner */}
      <div className="card card-green" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>🎤</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
              {t('आवाज से चलाएं', 'Control by Voice')}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {t('हरे बटन को दबाएं और बोलें: "ट्रैक्टर किराये पर चाहिए"', 
                 'Tap the green button and say: "I need a tractor for rent"')}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="section-title">
        <span className="emoji">⚡</span>
        {t('क्या करना है?', 'Quick Actions')}
      </div>
      
      <div className="grid-2">
        {quickActions.map((action, idx) => (
          <button 
            key={idx}
            className="big-icon-btn"
            onClick={() => handleClick(action)}
          >
            <div className={`icon-wrapper ${action.color}`}>
              {action.emoji}
            </div>
            <div className="label">{action.label}</div>
            <div className="sublabel">{action.sublabel}</div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ marginTop: '32px' }}>
        <div className="section-title">
          <span className="emoji">📊</span>
          {t('प्लेटफ़ॉर्म पर', 'On Platform')}
        </div>
        <div className="stats-bar">
          <div className="stat-item">
            <div>
              <div className="stat-number">8+</div>
              <div className="stat-label">{t('उपकरण उपलब्ध', 'Equipment')}</div>
            </div>
          </div>
          <div className="stat-item">
            <div>
              <div className="stat-number">6+</div>
              <div className="stat-label">{t('मजदूर उपलब्ध', 'Workers')}</div>
            </div>
          </div>
          <div className="stat-item">
            <div>
              <div className="stat-number">20+</div>
              <div className="stat-label">{t('सरकारी योजनाएं', 'Schemes')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginTop: '16px' }}>
        <div className="section-title">
          <span className="emoji">💡</span>
          {t('कैसे इस्तेमाल करें', 'How to Use')}
        </div>
        <div className="card" style={{ padding: '20px' }}>
          {[ 
            { step: '1', text: t('🎤 हरे बटन को दबाएं', '🎤 Tap the green mic button') },
            { step: '2', text: t('🗣️ हिंदी में बोलें जो चाहिए', '🗣️ Speak what you need in Hindi') },
            { step: '3', text: t('🤖 AI समझेगा और पेज खोलेगा', '🤖 AI will understand and navigate') },
            { step: '4', text: t('🔊 जवाब आवाज में सुनें', '🔊 Hear the response in audio') },
          ].map((item, idx) => (
            <div key={idx} style={{
              padding: '10px 0',
              borderBottom: idx < 3 ? '1px solid var(--slate-100)' : 'none',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--green-100)', color: 'var(--green-800)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
              }}>{item.step}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
