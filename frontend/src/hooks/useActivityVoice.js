import { useState, useCallback } from 'react';
import { API } from '../config/constants';

export const useActivityVoice = (lang) => {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeAndSpeak = async (activity, voiceHook) => {
    setAnalyzing(true);
    try {
      // Create a raw dump of the activity
      const payload = {
        name: activity.equipment?.nameHi || activity.equipment?.name,
        price: activity.equipment?.price,
        action: activity.action,
        date: new Date(activity.startDate).toLocaleDateString(),
        status: activity.status
      };

      const res = await fetch(`${API.ai}/describe-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: payload, language: lang })
      });
      const data = await res.json();

      if (data.description) {
        await voiceHook.speak(data.description, lang);
      }
    } catch (e) {
      console.error('Failed to analyze activity', e);
    }
    setAnalyzing(false);
  };

  return { analyzing, analyzeAndSpeak };
};
