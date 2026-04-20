import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, MapPin } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { useVoiceNav } from '../../hooks/useVoiceNav';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../config/constants';
import VoiceCommandOverlay from '../voice/VoiceCommandOverlay';

export default function VoiceFAB() {
  const { lang, t } = useLang();
  const { user, activeRole, updateProfile, refreshUser } = useAuth();
  const {
    isListening, isSpeaking, transcript,
    startListening, stopListening, speak, stopSpeaking, supported
  } = useVoice(lang);
  const { detectIntent, executeCommand } = useVoiceNav();

  const [showOverlay, setShowOverlay] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [voiceResults, setVoiceResults] = useState(null);
  const navigate = useNavigate();

  // VoiceCommandOverlay state
  const [commandOverlay, setCommandOverlay] = useState({
    visible: false,
    command: '',
    action: ''
  });

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

  /**
   * Show the VoiceCommandOverlay briefly (2 seconds)
   */
  const showCommandOverlay = useCallback((command, action) => {
    setCommandOverlay({ visible: true, command, action });
  }, []);

  const dismissCommandOverlay = useCallback(() => {
    setCommandOverlay(prev => ({ ...prev, visible: false }));
  }, []);

  /**
   * Handle worker-specific voice actions (accept, availability toggle)
   */
  const handleWorkerAction = useCallback(async (workerAction) => {
    if (!user?._id) {
      return { success: false, message: 'Not logged in', messageHi: 'लॉगिन नहीं है' };
    }

    const API_BASE = 'http://localhost:5000/api';

    if (workerAction === 'accept') {
      // Accept top pending job request
      try {
        const res = await fetch(`${API_BASE}/profile/worker/${user._id}/requests/accept-top`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          return { success: true, message: 'Accepted top request', messageHi: 'अनुरोध स्वीकार किया' };
        }
        return { success: false, message: data.message || 'No pending requests', messageHi: 'कोई अनुरोध नहीं है' };
      } catch {
        return { success: false, message: 'Failed to accept request', messageHi: 'अनुरोध स्वीकार नहीं हुआ' };
      }
    }

    if (workerAction === 'set_available' || workerAction === 'set_busy') {
      const available = workerAction === 'set_available';
      try {
        const res = await fetch(`${API_BASE}/profile/worker/${user._id}/availability`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ available })
        });
        const data = await res.json();
        if (data.success) {
          await refreshUser();
          return {
            success: true,
            message: available ? 'You are now available' : 'You are now busy',
            messageHi: available ? 'आप अब उपलब्ध हैं' : 'आप अब व्यस्त हैं'
          };
        }
        return { success: false, message: data.message || 'Failed', messageHi: 'अपडेट नहीं हुआ' };
      } catch {
        return { success: false, message: 'Failed to update availability', messageHi: 'उपलब्धता अपडेट नहीं हुई' };
      }
    }

    return { success: false, message: 'Unknown worker action', messageHi: 'अज्ञात आदेश' };
  }, [user, refreshUser]);

  const processVoiceCommand = useCallback(async (text) => {
    if (processingRef.current) return; // prevent double fire
    processingRef.current = true;

    setProcessing(true);
    setStatusText(t('🤔 समझ रहा हूँ...', '🤔 Understanding...'));

    // First, try local intent detection via useVoiceNav
    const intent = detectIntent(text);

    if (intent.action !== 'unknown') {
      // Local intent matched — show overlay and execute
      let overlayAction = '';

      if (intent.action === 'navigate') {
        const routeLabels = {
          '/': t('होम', 'Home'),
          '/equipment': t('उपकरण', 'Equipment'),
          '/workers': t('कामगार', 'Workers'),
          '/schemes': t('योजनाएं', 'Schemes'),
          '/profile': t('प्रोफ़ाइल', 'Profile'),
          '/assistant': t('सहायक', 'Assistant'),
        };
        const routeLabel = routeLabels[intent.route] || intent.route;
        overlayAction = t(`${routeLabel} पर जा रहे हैं...`, `Navigating to ${routeLabel}...`);
      } else if (intent.action === 'worker_command') {
        const actionLabels = {
          accept: t('अनुरोध स्वीकार कर रहे हैं...', 'Accepting request...'),
          set_available: t('उपलब्धता चालू कर रहे हैं...', 'Setting available...'),
          set_busy: t('व्यस्त स्थिति सेट कर रहे हैं...', 'Setting busy...'),
        };
        overlayAction = actionLabels[intent.workerAction] || t('आदेश चला रहे हैं...', 'Executing command...');
      }

      showCommandOverlay(text, overlayAction);

      const result = await executeCommand(intent, handleWorkerAction);

      const responseText = lang === 'hi' ? result.messageHi : result.message;
      if (responseText) {
        setStatusText(responseText);
        await speak(responseText, lang);
      }

      setTimeout(() => {
        closeOverlay();
        processingRef.current = false;
      }, 1500);

      setProcessing(false);
      return;
    }

    // Fall back to AI smart-voice endpoint for complex queries
    try {
      const res = await fetch(`${API.ai}/smart-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, language: lang })
      });
      const data = await res.json();

      const responseText = lang === 'hi' ? data.responseHi : data.responseEn;
      setStatusText(responseText || t('समझ गया!', 'Got it!'));

      // Show overlay for AI-detected navigation too
      if (data.route || data.action === 'show_results') {
        const aiAction = data.action === 'show_results'
          ? t(`${data.results?.length || 0} परिणाम मिले`, `${data.results?.length || 0} results found`)
          : t('पेज पर जा रहे हैं...', 'Navigating...');
        showCommandOverlay(text, aiAction);
      }

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
  }, [lang, navigate, speak, t, detectIntent, executeCommand, handleWorkerAction, showCommandOverlay]);

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

      {/* VoiceCommandOverlay — shows recognized command and action for 2 seconds */}
      <VoiceCommandOverlay
        visible={commandOverlay.visible}
        command={commandOverlay.command}
        action={commandOverlay.action}
        onDismiss={dismissCommandOverlay}
      />

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
