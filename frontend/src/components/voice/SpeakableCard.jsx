import { useTapToSpeak } from '../../hooks/useTapToSpeak';
import { useLang } from '../../context/LanguageContext';

/**
 * SpeakableCard — Wrapper component that adds a speaker icon button to any card
 * On tap, reads the card's text content aloud using TTS
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content to wrap
 * @param {string} props.textContent - Text to speak when speaker icon is clicked
 * @param {string} [props.className] - Additional CSS classes for the wrapper
 * @param {Function} [props.onClick] - Optional click handler for the card itself
 */
export default function SpeakableCard({ children, textContent, className = '', onClick }) {
  const { lang } = useLang();
  const { speak, isSpeaking, SpeakerIcon } = useTapToSpeak(lang);

  const handleSpeakerClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    speak(textContent);
  };

  return (
    <div 
      className={`speakable-card-wrapper ${className}`}
      onClick={onClick}
      style={{ position: 'relative' }}
    >
      {children}
      
      {/* Speaker Icon Button */}
      <button
        className="speaker-icon-btn"
        onClick={handleSpeakerClick}
        aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: isSpeaking ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          zIndex: 10,
          color: isSpeaking ? 'white' : 'var(--primary)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        }}
      >
        <SpeakerIcon 
          size={16} 
          className={isSpeaking ? 'speaker-icon-active' : ''}
          style={{
            animation: isSpeaking ? 'pulse 1s ease-in-out infinite' : 'none'
          }}
        />
      </button>

      {/* Add pulse animation for speaking state */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
