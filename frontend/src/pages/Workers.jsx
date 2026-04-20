import { useState, useEffect } from 'react';
import { MapPin, Star, Search, Mic, Phone, Clock, Award } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { API, WORKER_SKILLS } from '../config/constants';
import { useVoice } from '../hooks/useVoice';
import SpeakableCard from '../components/voice/SpeakableCard';

export default function Workers() {
  const { lang, t } = useLang();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSkill, setActiveSkill] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const { startListening, stopListening, isListening, transcript, setTranscript } = useVoice(lang);

  useEffect(() => {
    fetchWorkers();
  }, [activeSkill, searchQuery]);

  async function fetchWorkers() {
    setLoading(true);
    try {
      let url = API.workers + '?';
      if (activeSkill !== 'all') url += `skill=${activeSkill}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      setWorkers(data);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
    setLoading(false);
  }

  const handleMicSearch = () => {
    if (isListening) {
      stopListening();
      if (transcript) setSearchQuery(transcript);
    } else {
      setTranscript('');
      startListening();
    }
  };

  useEffect(() => {
    if (!isListening && transcript) {
      setSearchQuery(transcript);
    }
  }, [isListening, transcript]);

  return (
    <div className="page-container">
      <div className="section-title">
        <span className="emoji">👷</span>
        {t('खेत मजदूर', 'Farm Workers')}
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        {t('अनुभवी मजदूर और ऑपरेटर — आपके पास उपलब्ध', 'Experienced workers & operators — available near you')}
      </p>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder={t('मजदूर खोजें... "ट्रैक्टर ऑपरेटर"', 'Search workers... "tractor operator"')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={handleMicSearch}>
          <Mic size={18} />
        </button>
      </div>

      {/* Skill Filters */}
      <div className="filter-bar">
        {WORKER_SKILLS.map(skill => (
          <button
            key={skill.id}
            className={`filter-chip ${activeSkill === skill.id ? 'active' : ''}`}
            onClick={() => setActiveSkill(skill.id)}
          >
            {lang === 'hi' ? skill.labelHi : skill.label}
          </button>
        ))}
      </div>

      {/* Workers List */}
      {loading ? (
        <div className="loading-spinner" />
      ) : workers.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🔍</div>
          <p>{t('कोई मजदूर नहीं मिला', 'No workers found')}</p>
        </div>
      ) : (
        <div className="grid-3">
          {workers.map(worker => (
            <SpeakableCard
              key={worker._id}
              textContent={[
                lang === 'hi' ? worker.nameHi : worker.name,
                lang === 'hi' ? worker.bioHi : worker.bio,
                `कौशल: ${(lang === 'hi' ? worker.skillsHi : worker.skills)?.join(', ')}`,
                `दैनिक दर: ${worker.dailyRate} रुपये प्रति दिन`,
                `स्थान: ${worker.location?.district}`,
                `अनुभव: ${worker.experience} साल`,
                worker.available ? 'अभी उपलब्ध है' : 'अभी व्यस्त है'
              ].filter(Boolean).join('. ')}
              onClick={() => setSelectedWorker(worker)}
            >
            <div className="listing-card">
              <div className="card-emoji" style={{ 
                background: worker.available 
                  ? 'linear-gradient(135deg, var(--green-50), var(--green-100))' 
                  : 'linear-gradient(135deg, var(--slate-50), var(--slate-100))',
                overflow: 'hidden', padding: worker.image?.startsWith('http') ? 0 : undefined
              }}>
                {worker.image?.startsWith('http') ? (
                  <img src={worker.image} alt="worker" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  worker.image || '👨‍🌾'
                )}
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="card-title">{lang === 'hi' ? worker.nameHi : worker.name}</div>
                  <span className={`badge ${worker.available ? 'badge-green' : 'badge-red'}`}>
                    {worker.available ? t('उपलब्ध', 'Available') : t('व्यस्त', 'Busy')}
                  </span>
                </div>
                <div className="card-subtitle">{lang === 'hi' ? worker.bioHi : worker.bio}</div>
                
                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {(lang === 'hi' ? worker.skillsHi : worker.skills)?.slice(0, 3).map((skill, i) => (
                    <span key={i} className="tag">{skill}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="card-price">
                    ₹{worker.dailyRate}<span> /{t('दिन', 'day')}</span>
                  </div>
                  <div className="rating">
                    <Star size={14} fill="currentColor" />
                    <span className="rating-value">{worker.rating}</span>
                  </div>
                </div>
                <div className="card-meta">
                  <div className="card-location">
                    <MapPin size={14} />
                    {worker.location?.district}
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} />
                    {worker.experience} {t('साल', 'yrs')}
                  </span>
                </div>
              </div>
            </div>
            </SpeakableCard>
          ))}
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="modal-overlay" onClick={() => setSelectedWorker(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <span>{lang === 'hi' ? selectedWorker.nameHi : selectedWorker.name}</span>
              <button onClick={() => setSelectedWorker(null)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>×</button>
            </div>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                {selectedWorker.image?.startsWith('http') ? (
                  <img src={selectedWorker.image} alt="worker" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  selectedWorker.image
                )}
              </div>
              <span className={`badge ${selectedWorker.available ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
                {selectedWorker.available ? t('✅ उपलब्ध', '✅ Available') : t('❌ व्यस्त', '❌ Busy')}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6, textAlign: 'center' }}>
              {lang === 'hi' ? selectedWorker.bioHi : selectedWorker.bio}
            </p>
            <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {t('दैनिक दर', 'Daily Rate')}</span>
                <strong style={{ color: 'var(--green-700)', fontSize: '1.1rem' }}>₹{selectedWorker.dailyRate}/{t('दिन', 'day')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={14} /> {t('अनुभव', 'Experience')}</span>
                <strong>{selectedWorker.experience} {t('साल', 'years')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {t('स्थान', 'Location')}</span>
                <strong>{selectedWorker.location?.district}, {selectedWorker.location?.state}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('कुल काम', 'Total Jobs')}</span>
                <strong>{selectedWorker.totalJobs}</strong>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {(lang === 'hi' ? selectedWorker.skillsHi : selectedWorker.skills)?.map((skill, i) => (
                <span key={i} className="badge badge-green" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>{skill}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => {
                alert(t('काम पर रखने का अनुरोध भेजा! मजदूर जल्दी संपर्क करेगा।', 'Hire request sent! Worker will contact you soon.'));
                setSelectedWorker(null);
              }}>
                {t('👷 काम पर रखें', '👷 Hire Now')}
              </button>
              <button className="btn btn-secondary btn-lg" style={{ flexShrink: 0 }} onClick={() => {
                if (selectedWorker.phone) window.open(`tel:${selectedWorker.phone}`);
              }}>
                <Phone size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
