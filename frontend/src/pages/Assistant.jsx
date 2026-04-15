import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../hooks/useVoice';
import { API } from '../config/constants';

export default function Assistant() {
  const { lang, t } = useLang();
  const { farmer } = useAuth();
  const { isListening, transcript, startListening, stopListening, speak, setTranscript } = useVoice(lang);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: lang === 'hi' 
        ? 'नमस्ते! 🙏 मैं KissanSetu AI सहायक हूँ। आप मुझसे खेती, योजनाओं, उपकरण, या किसी भी सवाल के बारे में पूछ सकते हैं। बोलकर या लिखकर पूछें!'
        : 'Hello! 🙏 I\'m KissanSetu AI Assistant. Ask me about farming, schemes, equipment, or any question. Speak or type!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice input
  useEffect(() => {
    if (!isListening && transcript) {
      sendMessage(transcript);
      setTranscript('');
    }
  }, [isListening, transcript]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API.ai}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: farmer?.analyzed || {},
          language: lang
        })
      });
      const data = await res.json();
      
      const assistantMsg = { role: 'assistant', text: data.response };
      setMessages(prev => [...prev, assistantMsg]);

      // Auto-speak response
      speak(data.response, lang);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: t('माफ़ करें, कुछ गड़बड़ हो गई। दोबारा कोशिश करें।', 'Sorry, something went wrong. Please try again.')
      }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="page-container" style={{ padding: 0, height: 'calc(100vh - var(--navbar-height))' }}>
      <div className="chat-container">
        {/* Chat Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: 'var(--border-light)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-400), var(--green-600))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem'
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>KissanSetu AI</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-600)' }}>
              {t('🟢 ऑनलाइन — हिंदी में बात करें', '🟢 Online — Chat in Hindi or English')}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              {msg.text}
              {msg.role === 'assistant' && (
                <button 
                  onClick={() => speak(msg.text, lang)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    marginLeft: '8px', color: 'var(--green-600)', fontSize: '0.75rem',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px'
                  }}
                >
                  <Volume2 size={12} /> {t('सुनें', 'Listen')}
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble assistant" style={{ display: 'flex', gap: '4px' }}>
              <span style={{ animation: 'wave 1s infinite', animationDelay: '0s' }}>●</span>
              <span style={{ animation: 'wave 1s infinite', animationDelay: '0.2s' }}>●</span>
              <span style={{ animation: 'wave 1s infinite', animationDelay: '0.4s' }}>●</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form className="chat-input-area" onSubmit={handleSubmit}>
          <button 
            type="button"
            className={`btn btn-icon ${isListening ? 'btn-danger' : ''}`}
            style={{ 
              background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'var(--green-100)',
              color: isListening ? 'white' : 'var(--green-700)',
              flexShrink: 0
            }}
            onClick={() => isListening ? stopListening() : startListening()}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={isListening ? transcript : input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('यहाँ टाइप करें या 🎤 बटन दबाएं...', 'Type here or tap 🎤...')}
            disabled={isListening}
          />
          <button 
            type="submit" 
            className="btn btn-icon"
            style={{ background: 'var(--green-600)', color: 'white', flexShrink: 0 }}
            disabled={loading || (!input && !transcript)}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
