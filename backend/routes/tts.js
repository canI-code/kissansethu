import { Router } from 'express';

const router = Router();

// TTS using edge-tts-universal — returns MP3 audio
router.get('/', async (req, res) => {
  return handleTTS(req, res, req.query);
});

router.post('/', async (req, res) => {
  return handleTTS(req, res, req.body);
});

async function handleTTS(req, res, data) {
  try {
    const { text, lang } = data;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const { Communicate } = await import('edge-tts-universal');

    // Choose voice based on language
    const voiceMap = {
      hi: 'hi-IN-SwaraNeural',
      en: 'en-IN-NeerjaNeural',
    };
    const voice = voiceMap[lang] || voiceMap.hi;

    const tts = new Communicate(text, voice);

    // Stream audio chunks directly to client
    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });

    let hasAudio = false;
    for await (const chunk of tts.stream()) {
      if (chunk.type === 'audio') {
        hasAudio = true;
        res.write(chunk.data);
      }
    }

    if (!hasAudio) {
      // It's technically too late to change status code if headers are already sent, 
      // but if edge-tts failed instantly it might not have sent headers.
      // But typically res.set() only queues them until the first write/end.
    }

    res.end();

  } catch (error) {
    console.error('TTS Error:', error.message);
    res.status(500).json({ error: 'TTS generation failed', details: error.message });
  }
}

export default router;
