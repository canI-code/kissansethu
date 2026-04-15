import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// All supported languages with their Web Speech API codes and labels
export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', labelEn: 'Hindi', speechCode: 'hi-IN' },
  { code: 'en', label: 'English', labelEn: 'English', speechCode: 'en-IN' },
  { code: 'mr', label: 'मराठी', labelEn: 'Marathi', speechCode: 'mr-IN' },
  { code: 'bn', label: 'বাংলা', labelEn: 'Bengali', speechCode: 'bn-IN' },
  { code: 'te', label: 'తెలుగు', labelEn: 'Telugu', speechCode: 'te-IN' },
  { code: 'ta', label: 'தமிழ்', labelEn: 'Tamil', speechCode: 'ta-IN' },
  { code: 'gu', label: 'ગુજરાતી', labelEn: 'Gujarati', speechCode: 'gu-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', labelEn: 'Kannada', speechCode: 'kn-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', labelEn: 'Punjabi', speechCode: 'pa-IN' },
  { code: 'od', label: 'ଓଡ଼ିଆ', labelEn: 'Odia', speechCode: 'or-IN' },
];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ks-lang') || 'hi');

  useEffect(() => {
    localStorage.setItem('ks-lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(prev => prev === 'hi' ? 'en' : 'hi');

  // Get current language config
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // t() helper — for Hindi and English we have hardcoded strings;
  // for other languages the UI falls back to Hindi with a translation indicator
  const t = (hiText, enText) => {
    if (lang === 'en') return enText;
    if (lang === 'hi') return hiText;
    // For regional languages, show Hindi text (most farmers understand)
    // In future, can add translation API here
    return hiText;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, currentLang, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
