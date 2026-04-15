import { useState, useCallback, useRef, useEffect } from 'react';
import { API } from '../config/constants';

/**
 * useVoice — Voice hook with:
 * - Continuous speech recognition (auto-restarts, no timeouts)
 * - Toggle mode: mic ON → accumulate text → mic OFF → return full text
 * - Natural TTS via edge-tts backend API (fallback: browser speechSynthesis)
 */
export function useVoice(language = 'hi') {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);

  // Refs for persistent state across re-renders
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);     // controls auto-restart
  const accumulatedRef = useRef('');          // accumulated transcript across restarts
  const audioRef = useRef(null);             // current playing audio element
  const speakingAbortRef = useRef(false);

  // Get speech code for Web Speech API
  const getSpeechCode = (langCode) => {
    const map = { hi: 'hi-IN', en: 'en-IN' };
    return map[langCode] || 'hi-IN';
  };

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;          // KEY: don't stop after one sentence
    recognition.interimResults = true;      // Show text as user speaks
    recognition.lang = getSpeechCode(language);
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
        } else {
          interimText += result[0].transcript;
        }
      }

      // Append final text to accumulated buffer
      if (finalText) {
        accumulatedRef.current += finalText;
      }

      // Update visible transcript = accumulated + current interim
      setTranscript((accumulatedRef.current + interimText).trim());
    };

    recognition.onerror = (event) => {
      // Don't crash on no-speech or aborted errors — just let onend handle restart
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      // Auto-restart if user hasn't clicked stop
      if (shouldListenRef.current) {
        try {
          setTimeout(() => {
            if (shouldListenRef.current) {
              recognition.lang = getSpeechCode(language);
              recognition.start();
            }
          }, 150); // small delay to avoid tight loops
        } catch (e) {
          console.error('Auto-restart failed:', e);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      try { recognition.abort(); } catch(e) {}
    };
  }, [language]);

  /**
   * Start listening — toggle ON
   * Clears previous transcript, starts recognition in continuous mode
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // Reset
    accumulatedRef.current = '';
    setTranscript('');
    shouldListenRef.current = true;

    recognitionRef.current.lang = getSpeechCode(language);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      // Already started — stop and restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e2) {
            console.error('Failed to restart recognition:', e2);
          }
        }, 200);
      } catch (e2) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [language]);

  /**
   * Stop listening — toggle OFF
   * Returns the final accumulated transcript
   */
  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIsListening(false);
    // Final transcript is whatever was accumulated
    const finalText = accumulatedRef.current.trim();
    setTranscript(finalText);
    return finalText;
  }, []);

  /**
   * Speak text — uses edge-tts backend API for natural voice
   * Falls back to browser speechSynthesis if API fails or offline
   */
  const speak = useCallback(async (text, lang = 'hi') => {
    if (!text || text.trim().length === 0) return;
    speakingAbortRef.current = false;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    setIsSpeaking(true);

    try {
      const qs = new URLSearchParams({ text, lang }).toString();
      const audioUrl = `${API.tts || 'http://localhost:5000/api/tts'}?${qs}`;

      return new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          resolve();
        };
        
        audio.onerror = (e) => {
          console.error('Audio element onerror triggered');
          setIsSpeaking(false);
          audioRef.current = null;
          // Fallback to browser TTS instantly if stream fails
          browserSpeak(text, lang).then(resolve);
        };
        
        // Use timeout to fallback if stream hangs
        const timeoutId = setTimeout(() => {
           if (audioRef.current === audio && audio.readyState === 0) {
             console.warn('Audio stream timed out, falling back to browser');
             audio.pause();
             audioRef.current = null;
             browserSpeak(text, lang).then(resolve);
           }
        }, 8000);

        audio.onplay = () => clearTimeout(timeoutId);

        const playPromise = audio.play();
        if (playPromise !== undefined) {
           playPromise.catch((e) => {
             clearTimeout(timeoutId);
             console.error('Audio play failed (Autoplay blocked?), falling back:', e);
             browserSpeak(text, lang).then(resolve);
           });
        }
      });
    } catch (error) {
      // Network error / timeout — fallback to browser TTS
      console.warn('Edge-TTS unavailable, using browser fallback:', error);
      return browserSpeak(text, lang);
    }
  }, []);

  /**
   * Browser speechSynthesis fallback
   */
  const browserSpeak = useCallback((text, lang = 'hi') => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) { setIsSpeaking(false); resolve(); return; }

      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const speechCode = lang === 'en' ? 'en-IN' : 'hi-IN';
      utterance.lang = speechCode;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find matching voice
      const voices = synth.getVoices();
      const prefix = speechCode.split('-')[0];
      const langVoices = voices.filter(v => v.lang.startsWith(prefix));
      if (langVoices.length > 0) utterance.voice = langVoices[0];

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };

      synth.speak(utterance);
    });
  }, []);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    speakingAbortRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    supported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setTranscript
  };
}
