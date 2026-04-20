import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * useVoiceNav — Hook for voice navigation and worker-specific commands
 * Detects intents from voice input and maps them to navigation/filter actions
 * 
 * Supported commands:
 * - Navigation: home, equipment, workers, schemes, profile, assistant
 * - Filtering: "tractor chahiye", "sasta tractor", "available workers"
 * - Worker actions: "accept karo", "available hoon", "busy hoon"
 * 
 * @returns {Object} { detectIntent, executeCommand }
 */
export function useVoiceNav() {
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();

  /**
   * Detect intent from voice transcript
   * Returns: { action, route, filters, workerAction }
   */
  const detectIntent = useCallback((transcript) => {
    const text = transcript.toLowerCase().trim();

    // Navigation intents
    if (/\b(home|ghar|घर)\b/.test(text)) {
      return { action: 'navigate', route: '/home' };
    }
    if (/\b(equipment|yantra|यंत्र|औज़ार)\b/.test(text)) {
      return { action: 'navigate', route: '/equipment' };
    }
    if (/\b(workers?|majdoor|मजदूर|कामगार)\b/.test(text)) {
      return { action: 'navigate', route: '/workers' };
    }
    if (/\b(schemes?|yojana|योजना)\b/.test(text)) {
      return { action: 'navigate', route: '/schemes' };
    }
    if (/\b(profile|mera|मेरा)\b/.test(text)) {
      return { action: 'navigate', route: '/profile' };
    }
    if (/\b(assistant|ai|बात|सहायक)\b/.test(text)) {
      return { action: 'navigate', route: '/assistant' };
    }

    // Equipment filtering intents
    if (/\b(tractor|ट्रैक्टर)\b/.test(text)) {
      const filters = { type: 'tractor' };
      
      // Check for action type
      if (/\b(kiraye|rent|किराये)\b/.test(text)) {
        filters.action = 'rent';
      }
      if (/\b(kharidna|buy|खरीदना)\b/.test(text)) {
        filters.action = 'buy';
      }
      
      // Check for price sorting
      if (/\b(sasta|cheap|सस्ता)\b/.test(text)) {
        filters.sortBy = 'price_asc';
      }
      
      return { action: 'navigate', route: '/equipment', filters };
    }

    // Other equipment types
    if (/\b(harvester|हार्वेस्टर)\b/.test(text)) {
      return { action: 'navigate', route: '/equipment', filters: { type: 'harvester' } };
    }
    if (/\b(rotavator|रोटावेटर)\b/.test(text)) {
      return { action: 'navigate', route: '/equipment', filters: { type: 'rotavator' } };
    }
    if (/\b(sprayer|स्प्रेयर)\b/.test(text)) {
      return { action: 'navigate', route: '/equipment', filters: { type: 'sprayer' } };
    }
    if (/\b(pump|पंप)\b/.test(text)) {
      return { action: 'navigate', route: '/equipment', filters: { type: 'pump' } };
    }

    // Worker filtering intents
    if (/\b(available|उपलब्ध)\b/.test(text) && /\b(workers?|majdoor|मजदूर)\b/.test(text)) {
      return { action: 'navigate', route: '/workers', filters: { available: true } };
    }

    // Worker-specific commands (only if user is a worker)
    if (activeRole === 'worker') {
      // Accept command
      if (/\b(accept|स्वीकार|karo|करो)\b/.test(text)) {
        return { action: 'worker_command', workerAction: 'accept' };
      }
      
      // Availability toggle commands
      if (/\b(available|उपलब्ध|hoon|हूं)\b/.test(text) && !/\b(busy|व्यस्त)\b/.test(text)) {
        return { action: 'worker_command', workerAction: 'set_available' };
      }
      if (/\b(busy|व्यस्त|hoon|हूं)\b/.test(text)) {
        return { action: 'worker_command', workerAction: 'set_busy' };
      }
    }

    // No specific intent detected
    return { action: 'unknown' };
  }, [activeRole]);

  /**
   * Execute a detected command
   * @param {Object} intent - Intent object from detectIntent
   * @param {Function} onWorkerAction - Callback for worker actions (accept, availability)
   * @returns {Promise<Object>} { success, message, messageHi }
   */
  const executeCommand = useCallback(async (intent, onWorkerAction) => {
    if (intent.action === 'navigate') {
      // Build query params from filters
      const params = new URLSearchParams();
      if (intent.filters) {
        Object.entries(intent.filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const fullRoute = intent.filters 
        ? `${intent.route}?${params.toString()}`
        : intent.route;
      
      navigate(fullRoute, { state: { voiceFilters: intent.filters } });
      
      return {
        success: true,
        message: `Navigating to ${intent.route}`,
        messageHi: `${intent.route} पर जा रहे हैं`
      };
    }

    if (intent.action === 'worker_command' && onWorkerAction) {
      // Delegate to callback (will be handled by VoiceFAB or WorkerDashboard)
      const result = await onWorkerAction(intent.workerAction);
      return result;
    }

    return {
      success: false,
      message: 'Command not recognized',
      messageHi: 'आदेश समझ नहीं आया'
    };
  }, [navigate]);

  return {
    detectIntent,
    executeCommand
  };
}
