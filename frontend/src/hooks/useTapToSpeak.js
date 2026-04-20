import { useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { useVoice } from './useVoice';

/**
 * useTapToSpeak — Hook for tap-to-listen functionality on cards
 * Takes text content and returns { speak, isSpeaking, SpeakerIcon }
 * Uses the existing useVoice speak function internally
 * 
 * @param {string} language - Language code ('hi' or 'en')
 * @returns {Object} { speak, isSpeaking, SpeakerIcon }
 */
export function useTapToSpeak(language = 'hi') {
  const { speak: voiceSpeak, isSpeaking, stopSpeaking } = useVoice(language);

  /**
   * Speak the provided text content
   * @param {string} text - Text to speak aloud
   */
  const speak = useCallback(async (text) => {
    if (!text || text.trim().length === 0) return;
    
    // If already speaking, stop first
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    // Speak the text using the voice hook
    await voiceSpeak(text, language);
  }, [voiceSpeak, isSpeaking, stopSpeaking, language]);

  // Return the speaker icon component
  const SpeakerIcon = Volume2;

  return {
    speak,
    isSpeaking,
    SpeakerIcon
  };
}
