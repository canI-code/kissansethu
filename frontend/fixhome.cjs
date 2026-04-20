const fs = require('fs');
let file = fs.readFileSync('f:/new-kissansetu/frontend/src/pages/Home.jsx', 'utf8');

if (!file.includes('ArrowRight')) {
  file = file.replace(/import \{ useState, useEffect \} from 'react';/, "import { useState, useEffect } from 'react';\nimport { ArrowRight } from 'lucide-react';");
}

const oldBlock = `  // If no role set yet, show a prompt to complete setup
  if (!activeRole) {
    return (
      <div className="page-container">
        <DemoBanner />
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌾</div>
          <h2 style={{ marginBottom: '8px' }}>
            {t('KissanSetu में आपका स्वागत है!', 'Welcome to KissanSetu!')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('शुरू करने के लिए अपनी भूमिका चुनें।', 'Please complete your profile setup to get started.')}
          </p>
          <button
            onClick={() => navigate('/profile')}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '12px 24px', borderRadius: '30px', 
              background: '#16a34a', color: 'white', 
              fontWeight: '600', fontSize: '1.1rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <span>👤</span> {t('प्रोफ़ाइल सेट करें', 'Set Up Profile')}
          </button>
        </div>
      </div>
    );
  }`;

const newBlock = `  // If no role set yet, show a prompt to complete setup
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
  }`;

if (file.includes('<span>👤</span>')) {
  file = file.replace(oldBlock, newBlock);
}

fs.writeFileSync('f:/new-kissansetu/frontend/src/pages/Home.jsx', file);
console.log('Update done');
