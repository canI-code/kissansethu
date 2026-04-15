import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, MapPin } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { useLang } from '../../context/LanguageContext';
import { API } from '../../config/constants';

export default function VoiceFAB() {
  const { lang, t } = useLang();
  const {
    isListening, isSpeaking, transcript,
    startListening, stopListening, speak, stopSpeaking, supported
  } = useVoice(lang);

  const [showOverlay, setShowOverlay] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [voiceResults, setVoiceResults] = useState(null);
  const navigate = useNavigate();

  // Ref guard to prevent double processing
  const processingRef = useRef(false);

  const handleFABClick = () => {
    if (isListening) {
      // User clicked to stop — process the command
      const finalText = stopListening();
      if (finalText && finalText.trim().length > 1 && !processingRef.current) {
        processVoiceCommand(finalText.trim());
      }
    } else {
      // User clicked to start listening
      stopSpeaking(); // stop any current speech
      setShowOverlay(true);
      setVoiceResults(null);
      setProcessing(false);
      setStatusText(t('🎤 बोलिए... जब हो जाए तो फिर दबाएं', '🎤 Speak... press again when done'));
      startListening();
    }
  };

  const closeOverlay = () => {
    stopListening();
    stopSpeaking();
    setShowOverlay(false);
    setProcessing(false);
    setVoiceResults(null);
    processingRef.current = false;
  };

  const processVoiceCommand = useCallback(async (text) => {
    if (processingRef.current) return; // prevent double fire
    processingRef.current = true;

    setProcessing(true);
    setStatusText(t('🤔 समझ रहा हूँ...', '🤔 Understanding...'));

    try {
      const res = await fetch(`${API.ai}/smart-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, language: lang })
      });
      const data = await res.json();

      const responseText = lang === 'hi' ? data.responseHi : data.responseEn;
      setStatusText(responseText || t('समझ गया!', 'Got it!'));

      if (data.action === 'show_results' && data.results?.length > 0) {
        setVoiceResults(data.results);

        // Speak ONCE — ref guard prevents double
        if (responseText) await speak(responseText, lang);

        setTimeout(() => {
          navigate(data.route, { state: { voiceResults: data.results, voiceQuery: text } });
          closeOverlay();
          processingRef.current = false;
        }, 3000);

      } else if (data.action === 'chat') {
        if (responseText) await speak(responseText, lang);
        setTimeout(() => {
          navigate('/assistant', { state: { initialMessage: text } });
          closeOverlay();
          processingRef.current = false;
        }, 2000);

      } else if (data.action === 'greeting') {
        if (responseText) await speak(responseText, lang);
        setTimeout(() => {
          closeOverlay();
          processingRef.current = false;
        }, 2500);

      } else if (data.route) {
        if (responseText) await speak(responseText, lang);
        setTimeout(() => {
          navigate(data.route);
          closeOverlay();
          processingRef.current = false;
        }, 1500);

      } else {
        if (responseText) await speak(responseText, lang);
        setTimeout(() => {
          closeOverlay();
          processingRef.current = false;
        }, 2500);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      const errorMsg = t('कुछ गड़बड़ हो गई, दोबारा बोलिए', 'Something went wrong, please try again');
      setStatusText(errorMsg);
      await speak(errorMsg, lang);
      setTimeout(() => {
        closeOverlay();
        processingRef.current = false;
      }, 2000);
    }
    setProcessing(false);
  }, [lang, navigate, speak, t]);

  if (!supported) return null;

  return (
    <>
      <button
        className={`voice-fab ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
        onClick={handleFABClick}
        id="voice-fab-btn"
      >
        {isListening ? <MicOff /> : <Mic />}
        {isListening && <span className="ripple" />}
      </button>

      {showOverlay && (
        <div className="voice-overlay">
          <div className="status-text">{statusText}</div>

          {isListening && (
            <>
              <div className="waveform">
                {[...Array(9)].map((_, i) => <div key={i} className="bar" />)}
              </div>
              <button className="voice-stop-btn" onClick={handleFABClick}>
                <MicOff size={28} />
                <span>{t('बंद करें', 'Stop')}</span>
              </button>
            </>
          )}

          {processing && !voiceResults && (
            <div className="loading-spinner" />
          )}

          {transcript && !voiceResults && (
            <div className="transcript">"{transcript}"</div>
          )}

          {/* Smart Results Preview */}
          {voiceResults && voiceResults.length > 0 && (
            <div className="voice-results-preview">
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '8px', textAlign: 'center' }}>
                {t(`${voiceResults.length} परिणाम मिले — पेज पर ले जा रहे हैं...`, `${voiceResults.length} results found — redirecting...`)}
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px' }}>
                {voiceResults.slice(0, 3).map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    padding: '12px',
                    minWidth: '180px',
                    flexShrink: 0,
                    animation: `slideUp 0.3s ease ${i * 0.1}s both`
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.image || '🚜'}</div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>
                      {lang === 'hi' ? (item.nameHi || item.name) : item.name}
                    </div>
                    <div style={{ color: 'var(--green-300)', fontWeight: 700, fontSize: '0.9rem' }}>
                      ₹{item.price?.toLocaleString() || item.dailyRate?.toLocaleString()}
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                        {item.priceUnit === 'per_hour' ? '/hr' : item.dailyRate ? '/day' : ''}
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
                      <MapPin size={10} /> {item.location?.district}
                      <span style={{ marginLeft: '4px' }}>⭐ {item.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="voice-close-btn" onClick={closeOverlay}>
            <X size={24} />
          </button>
        </div>
      )}
    </>
  );
}
