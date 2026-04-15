import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, User, LogOut } from 'lucide-react';
import { useLang, LANGUAGES } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { lang, setLang, currentLang } = useLang();
  const { user, clearAuth } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowLangMenu(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setShowUserMenu(false);
  };

  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-icon">🌾</span>
        <div>
          <div className="logo-text">KissanSetu</div>
          <div className="logo-sub">{lang === 'hi' ? 'किसान सेतु — आपका कृषि साथी' : 'Your Farming Companion'}</div>
        </div>
      </div>

      {/* Multi-language selector dropdown */}
      <div className="lang-selector" ref={menuRef}>
        <button className="lang-trigger" onClick={() => setShowLangMenu(!showLangMenu)}>
          <Globe size={16} />
          <span>{currentLang.label}</span>
          <ChevronDown size={14} style={{ transform: showLangMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {showLangMenu && (
          <div className="lang-dropdown">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={`lang-option ${lang === l.code ? 'active' : ''}`}
                onClick={() => { setLang(l.code); setShowLangMenu(false); }}
              >
                <span className="lang-native">{l.label}</span>
                <span className="lang-en">{l.labelEn}</span>
                {lang === l.code && <span className="lang-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User menu */}
      {user && (
        <div className="user-menu" ref={userMenuRef}>
          <button 
            className="user-trigger" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <User size={18} />
            <span className="user-phone">+91 {user.phone}</span>
            <ChevronDown size={14} style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-phone">+91 {user.phone}</div>
                <div className="user-role">{user.role}</div>
                <div className={`user-status ${user.isVerified ? 'verified' : 'unverified'}`}>
                  {user.isVerified ? '✓ Verified' : '⚠ Not Verified'}
                </div>
              </div>
              
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
