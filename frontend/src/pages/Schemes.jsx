import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API } from '../config/constants';
import { ExternalLink, CheckCircle, AlertTriangle, Info, ChevronRight, User } from 'lucide-react';

// Fields needed for scheme eligibility
const SCHEME_FIELDS = [
  { field: 'landAcres', labelHi: 'जमीन (एकड़)', labelEn: 'Land (Acres)' },
  { field: 'age', labelHi: 'उम्र', labelEn: 'Age' },
  { field: 'annualIncome', labelHi: 'सालाना आय', labelEn: 'Annual Income' },
  { field: 'state', labelHi: 'राज्य', labelEn: 'State' },
  { field: 'hasAadhaar', labelHi: 'आधार कार्ड', labelEn: 'Aadhaar Card' },
  { field: 'hasBankAccount', labelHi: 'बैंक खाता', labelEn: 'Bank Account' },
  { field: 'hasLivestock', labelHi: 'पशु', labelEn: 'Livestock' },
  { field: 'irrigationType', labelHi: 'सिंचाई', labelEn: 'Irrigation Type' },
  { field: 'crops', labelHi: 'फसलें', labelEn: 'Crops' },
  { field: 'gender', labelHi: 'लिंग', labelEn: 'Gender' },
];

export default function Schemes() {
  const { lang, t } = useLang();
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('eligible');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const profile = farmer?.analyzed || farmer?.profile;

  useEffect(() => {
    fetchSchemesAndEligibility();
  }, [farmer]);

  // Find missing profile fields that would help with better scheme matching
  const getMissingFields = () => {
    if (!profile) return SCHEME_FIELDS;
    return SCHEME_FIELDS.filter(f => {
      const val = profile[f.field] ?? profile?.location?.[f.field] ?? profile?.landHolding?.[f.field === 'landAcres' ? 'sizeAcres' : f.field];
      return val === undefined || val === null || val === '';
    });
  };

  async function fetchSchemesAndEligibility() {
    setLoading(true);
    try {
      const schemesRes = await fetch(API.schemes);
      const schemesData = await schemesRes.json();
      setSchemes(schemesData);

      if (profile) {
        const eligRes = await fetch(`${API.schemes}/eligibility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        const eligData = await eligRes.json();
        setEligibility(eligData);
      }
    } catch (error) {
      console.error('Failed to fetch schemes:', error);
    }
    setLoading(false);
  }

  const getTabData = () => {
    if (!eligibility) return schemes;
    switch (activeTab) {
      case 'eligible': return eligibility.eligible || [];
      case 'almost': return eligibility.almostEligible || [];
      case 'all': return schemes;
      default: return schemes;
    }
  };

  const renderSchemeCard = (scheme) => {
    const isEligible = eligibility?.eligible?.some(s => s.id === scheme.id);
    const isAlmost = eligibility?.almostEligible?.some(s => s.id === scheme.id);
    const schemeData = isAlmost 
      ? eligibility.almostEligible.find(s => s.id === scheme.id)
      : (isEligible ? eligibility.eligible.find(s => s.id === scheme.id) : scheme);

    return (
      <div 
        key={scheme.id} 
        className={`scheme-card ${isEligible ? 'eligible' : isAlmost ? 'almost' : ''}`}
        onClick={() => setSelectedScheme(schemeData)}
        style={{ cursor: 'pointer', marginBottom: '12px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div className="scheme-name">{lang === 'hi' ? scheme.nameHi : scheme.name}</div>
          {eligibility && (
            isEligible ? (
              <span className="badge badge-green"><CheckCircle size={12} /> {t('पात्र', 'Eligible')}</span>
            ) : isAlmost ? (
              <span className="badge badge-amber"><AlertTriangle size={12} /> {t('लगभग पात्र', 'Almost')}</span>
            ) : null
          )}
        </div>
        <div className="scheme-desc">{lang === 'hi' ? scheme.descriptionHi : scheme.description}</div>
        <div className="scheme-benefits">💰 {scheme.benefits}</div>

        {isAlmost && schemeData.gaps?.length > 0 && (
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber-600)', marginBottom: '4px' }}>
              {t('⚠️ इसके लिए और चाहिए:', '⚠️ You still need:')}
            </div>
            <ul className="gap-list">
              {schemeData.gaps.map((gap, i) => (
                <li key={i}>{lang === 'hi' ? gap.messageHi : gap.messageEn}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span className="badge badge-gray">{scheme.category?.replace(/_/g, ' ')}</span>
          {scheme.score && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('स्कोर:', 'Score:')} {scheme.score}%</span>
          )}
        </div>
      </div>
    );
  };

  const missingFields = getMissingFields();

  return (
    <div className="page-container">
      <div className="section-title">
        <span className="emoji">📋</span>
        {t('सरकारी योजनाएं', 'Government Schemes')}
      </div>

      {/* No profile → show full prompt */}
      {!profile && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px', borderLeft: '4px solid var(--amber-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber-600)', marginBottom: '12px' }}>
            <Info size={18} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              {t('पात्रता जांचने के लिए पहले प्रोफ़ाइल भरें', 'Fill your profile first to check eligibility')}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {t('योजना पात्रता के लिए हमें इन जानकारियों की ज़रूरत है:', 'We need this information for scheme eligibility:')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {SCHEME_FIELDS.map(f => (
              <span key={f.field} className="tag" style={{ background: '#fef3c7', color: '#92400e' }}>
                {lang === 'hi' ? f.labelHi : f.labelEn}
              </span>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/profile')}>
            <User size={16} /> {t('प्रोफ़ाइल भरें →', 'Fill Profile →')}
          </button>
        </div>
      )}

      {/* Profile exists but incomplete → show what's missing */}
      {profile && missingFields.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', padding: '16px', borderLeft: '4px solid var(--info)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info)', marginBottom: '8px' }}>
            <Info size={16} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {t(`${missingFields.length} जानकारी और भरें तो बेहतर योजनाएं मिलेंगी`, `Fill ${missingFields.length} more fields for better scheme matching`)}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {missingFields.map(f => (
              <span key={f.field} className="tag" style={{ background: '#dbeafe', color: '#1e40af' }}>
                ❌ {lang === 'hi' ? f.labelHi : f.labelEn}
              </span>
            ))}
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} 
            onClick={() => navigate('/profile')}>
            <ChevronRight size={14} /> {t('प्रोफ़ाइल अपडेट करें', 'Update Profile')}
          </button>
        </div>
      )}

      {/* Summary Stats */}
      {eligibility && (
        <div className="stats-bar" style={{ marginBottom: '20px' }}>
          <div className="stat-item" style={{ borderLeft: '3px solid var(--green-500)' }}>
            <div>
              <div className="stat-number">{eligibility.summary?.eligible || 0}</div>
              <div className="stat-label">{t('पात्र योजनाएं', 'Eligible')}</div>
            </div>
          </div>
          <div className="stat-item" style={{ borderLeft: '3px solid var(--amber-500)' }}>
            <div>
              <div className="stat-number" style={{ color: 'var(--amber-600)' }}>{eligibility.summary?.almostEligible || 0}</div>
              <div className="stat-label">{t('लगभग पात्र', 'Almost Eligible')}</div>
            </div>
          </div>
          <div className="stat-item">
            <div>
              <div className="stat-number" style={{ color: 'var(--text-secondary)' }}>{eligibility.summary?.totalChecked || schemes.length}</div>
              <div className="stat-label">{t('कुल योजनाएं', 'Total Checked')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {eligibility && (
        <div className="tab-header">
          <button className={`tab-btn ${activeTab === 'eligible' ? 'active' : ''}`} onClick={() => setActiveTab('eligible')}>
            ✅ {t('पात्र', 'Eligible')} <span className="count">{eligibility.eligible?.length || 0}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'almost' ? 'active' : ''}`} onClick={() => setActiveTab('almost')}>
            ⚠️ {t('लगभग', 'Almost')} <span className="count">{eligibility.almostEligible?.length || 0}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            📋 {t('सभी', 'All')} <span className="count">{schemes.length}</span>
          </button>
        </div>
      )}

      {/* Schemes List */}
      {loading ? (
        <div className="loading-spinner" />
      ) : (
        <div>
          {getTabData().map(scheme => renderSchemeCard(scheme))}
          {getTabData().length === 0 && (
            <div className="empty-state">
              <div className="emoji">📭</div>
              <p>{activeTab === 'eligible' 
                ? t('प्रोफ़ाइल भरने पर पात्र योजनाएं दिखेंगी', 'Fill profile to see eligible schemes')
                : t('कोई योजना नहीं मिली', 'No schemes found')
              }</p>
            </div>
          )}
        </div>
      )}

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="modal-overlay" onClick={() => setSelectedScheme(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <span>{lang === 'hi' ? selectedScheme.nameHi : selectedScheme.name}</span>
              <button onClick={() => setSelectedScheme(null)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>×</button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              {lang === 'hi' ? selectedScheme.descriptionHi : selectedScheme.description}
            </p>

            <div className="scheme-benefits" style={{ fontSize: '1rem', marginBottom: '16px' }}>
              💰 {selectedScheme.benefits}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                📄 {t('ज़रूरी दस्तावेज़', 'Documents Required')}
              </h4>
              <ul style={{ paddingLeft: '20px' }}>
                {selectedScheme.documentsRequired?.map((doc, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '2px 0' }}>{doc}</li>
                ))}
              </ul>
            </div>

            {selectedScheme.gaps?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: 'var(--amber-600)' }}>
                  ⚠️ {t('क्या करना होगा', 'What you need to do')}
                </h4>
                <ul className="gap-list">
                  {selectedScheme.gaps.map((gap, i) => (
                    <li key={i}>{lang === 'hi' ? gap.messageHi : gap.messageEn}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedScheme.applicationLink && (
              <a href={selectedScheme.applicationLink} target="_blank" rel="noopener noreferrer" 
                className="btn btn-primary btn-full btn-lg" style={{ textDecoration: 'none' }}>
                <ExternalLink size={18} />
                {t('आवेदन करें', 'Apply Now')}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
