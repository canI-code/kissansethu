import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { API } from '../config/constants';

export default function CallingAgentCard() {
  const { t } = useLang();
  const [status, setStatus] = useState({
    phoneNumber: '+17179310375',
    isOnline: false,
    activeService: null,
    loading: true,
  });

  useEffect(() => {
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API.calling}/status`);
      const data = await res.json();
      setStatus({
        phoneNumber: data.phoneNumber || '+17179310375',
        isOnline: data.isOnline || false,
        activeService: data.activeService,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch calling agent status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const formatPhoneNumber = (phone) => {
    // Format +17179310375 as +1 (717) 931-0375
    if (phone.startsWith('+1') && phone.length === 12) {
      return `+1 (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: status.isOnline
              ? 'rgba(34, 197, 94, 0.2)'
              : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${status.isOnline ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '0.6rem' }}>
            {status.isOnline ? '🟢' : '🔴'}
          </span>
          {status.loading
            ? t('जांच रहे हैं...', 'Checking...')
            : status.isOnline
              ? t('AI एजेंट लाइव', 'AI Agent Live')
              : t('ऑफ़लाइन', 'Offline')}
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            📞
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '2px' }}>
              {t('AI से बात करें', 'Talk to AI Agent')}
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>
              {t('हिंदी या अंग्रेजी में फ़ोन करें', 'Call in Hindi or English')}
            </p>
          </div>
        </div>

        {/* Phone Number */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '4px' }}>
            {t('फ़ोन नंबर', 'Phone Number')}
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              fontFamily: 'monospace',
            }}
          >
            {formatPhoneNumber(status.phoneNumber)}
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '16px', lineHeight: '1.5' }}>
          {t(
            'ट्रैक्टर, मजदूर, या सरकारी योजनाओं के बारे में पूछें। AI आपकी मदद करेगा!',
            'Ask about tractors, workers, or government schemes. AI will help you!'
          )}
        </p>

        {/* Call Now Button */}
        <a
          href={`tel:${status.phoneNumber}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'white',
            color: '#667eea',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          <Phone size={20} />
          {t('अभी कॉल करें', 'Call Now')}
        </a>

        {/* Service indicator (small text) */}
        {status.activeService && (
          <div
            style={{
              marginTop: '12px',
              fontSize: '0.7rem',
              opacity: 0.7,
            }}
          >
            {t('सेवा:', 'Service:')} {status.activeService === 'retell' ? 'Retell AI' : 'VAPI'}
          </div>
        )}
      </div>
    </div>
  );
}
