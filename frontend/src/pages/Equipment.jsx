import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Star, Search, Mic, Calendar, Clock, ShoppingCart, RotateCcw, AlertTriangle } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { API, EQUIPMENT_TYPES } from '../config/constants';
import { useVoice } from '../hooks/useVoice';

export default function Equipment() {
  const { lang, t } = useLang();
  const location = useLocation();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [activeAction, setActiveAction] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingModal, setBookingModal] = useState(null); // { item, action: 'rent' | 'buy' }
  const [bookingForm, setBookingForm] = useState({ startDate: '', endDate: '', notes: '' });
  const [bookingStatus, setBookingStatus] = useState(null);
  const { startListening, stopListening, isListening, transcript, setTranscript } = useVoice(lang);

  // Accept voice results from VoiceFAB
  useEffect(() => {
    if (location.state?.voiceResults) {
      setEquipment(location.state.voiceResults);
      setLoading(false);
    } else {
      fetchEquipment();
    }
  }, [activeType, activeAction, searchQuery]);

  async function fetchEquipment() {
    setLoading(true);
    try {
      let url = API.equipment + '?';
      if (activeType !== 'all') url += `type=${activeType}&`;
      if (activeAction !== 'all') url += `action=${activeAction}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
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

  const openBooking = (item, action) => {
    // Can't rent/buy if already booked
    if (item.status === 'booked' || item.status === 'sold') {
      setBookingStatus({ type: 'error', message: t('यह उपकरण अभी उपलब्ध नहीं है', 'This equipment is currently not available') });
      setTimeout(() => setBookingStatus(null), 3000);
      return;
    }
    setBookingModal({ item, action });
    setBookingForm({ startDate: '', endDate: '', notes: '' });
  };

  const submitBooking = async () => {
    if (bookingModal.action === 'rent' && (!bookingForm.startDate || !bookingForm.endDate)) {
      setBookingStatus({ type: 'error', message: t('तारीख भरें', 'Please fill dates') });
      return;
    }

    try {
      const res = await fetch(`${API.equipment}/${bookingModal.item._id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: 'user',
          startDate: bookingForm.startDate || new Date().toISOString(),
          endDate: bookingForm.endDate || new Date().toISOString(),
          action: bookingModal.action,
          notes: bookingForm.notes
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setBookingStatus({ 
          type: 'success', 
          message: bookingModal.action === 'rent' 
            ? t('✅ किराये की बुकिंग हो गई! मालिक जल्दी संपर्क करेंगे।', '✅ Rental booking confirmed! Owner will contact you soon.')
            : t('✅ खरीदने का अनुरोध भेजा गया! मालिक जल्दी संपर्क करेंगे।', '✅ Purchase request sent! Owner will contact you soon.')
        });
        
        // Update the item status locally
        setEquipment(prev => prev.map(eq => 
          eq._id === bookingModal.item._id ? { ...eq, status: bookingModal.action === 'buy' ? 'sold' : 'booked' } : eq
        ));
        
        setTimeout(() => {
          setBookingModal(null);
          setBookingStatus(null);
        }, 3000);
      }
    } catch (error) {
      setBookingStatus({ type: 'error', message: t('बुकिंग में दिक्कत हुई', 'Booking failed') });
    }
  };

  const getStatusBadge = (item) => {
    if (item.status === 'booked') return <span className="badge badge-amber">🔒 {t('किराये पर', 'Rented')}</span>;
    if (item.status === 'sold') return <span className="badge badge-red">🚫 {t('बिक गया', 'Sold')}</span>;
    return <span className="badge badge-green">✅ {t('उपलब्ध', 'Available')}</span>;
  };

  return (
    <div className="page-container">
      <div className="section-title">
        <span className="emoji">🚜</span>
        {t('कृषि उपकरण', 'Farm Equipment')}
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        {t('किराये पर लें या खरीदें — अपने पास के उपकरण खोजें', 'Rent or buy — find equipment near you')}
      </p>

      {/* Voice results banner */}
      {location.state?.voiceResults && (
        <div className="card card-green" style={{ marginBottom: '16px', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🎤 {t(`आवाज से ${location.state.voiceResults.length} परिणाम मिले`, `${location.state.voiceResults.length} voice search results`)}</span>
            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} 
              onClick={() => { window.history.replaceState({}, ''); fetchEquipment(); }}>
              {t('सभी देखें', 'Show All')}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text"
          placeholder={t('उपकरण खोजें... "ट्रैक्टर"', 'Search equipment... "tractor"')}
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
        />
        <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={handleMicSearch}>
          <Mic size={18} />
        </button>
      </div>

      {/* Type Filters */}
      <div className="filter-bar">
        {EQUIPMENT_TYPES.map(type => (
          <button key={type.id}
            className={`filter-chip ${activeType === type.id ? 'active' : ''}`}
            onClick={() => setActiveType(type.id)}>
            {type.emoji} {lang === 'hi' ? type.labelHi : type.label}
          </button>
        ))}
      </div>

      {/* Action Filters */}
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        {[
          { id: 'all', label: t('सभी', 'All') },
          { id: 'rent', label: t('🔄 किराये पर', '🔄 Rent') },
          { id: 'buy', label: t('🛒 खरीदें', '🛒 Buy') },
        ].map(action => (
          <button key={action.id}
            className={`filter-chip ${activeAction === action.id ? 'active' : ''}`}
            onClick={() => setActiveAction(action.id)}>
            {action.label}
          </button>
        ))}
      </div>

      {/* Status notification */}
      {bookingStatus && (
        <div className={`toast ${bookingStatus.type}`} style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 300 }}>
          {bookingStatus.message}
        </div>
      )}

      {/* Equipment List */}
      {loading ? (
        <div className="loading-spinner" />
      ) : equipment.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🔍</div>
          <p>{t('कोई उपकरण नहीं मिला', 'No equipment found')}</p>
        </div>
      ) : (
        <div className="grid-3">
          {equipment.map(item => (
            <div key={item._id} className="listing-card">
              <div className="card-emoji" style={{ 
                opacity: (item.status === 'booked' || item.status === 'sold') ? 0.5 : 1 
              }}>
                {item.image || '🚜'}
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div className="card-title">{lang === 'hi' ? item.nameHi : item.name}</div>
                  {getStatusBadge(item)}
                </div>
                <div className="card-subtitle">{lang === 'hi' ? item.descriptionHi : item.description}</div>
                
                <div className="card-price" style={{ marginBottom: '8px' }}>
                  ₹{item.price?.toLocaleString()}
                  <span> /{item.priceUnit === 'per_hour' ? t('घंटा', 'hr') : t('निश्चित', 'fixed')}</span>
                </div>

                {/* Buy / Rent Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {/* Rent Button - only for rentable items */}
                  {(item.action === 'rent' || item.action === 'both') && (
                    <button className="btn btn-primary" 
                      style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                      disabled={item.status === 'booked' || item.status === 'sold'}
                      onClick={(e) => { e.stopPropagation(); openBooking(item, 'rent'); }}>
                      <RotateCcw size={14} /> {t('किराये पर लें', 'Rent')}
                    </button>
                  )}
                  {/* Buy Button - always available unless sold */}
                  <button className="btn btn-accent" 
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                    disabled={item.status === 'sold'}
                    onClick={(e) => { e.stopPropagation(); openBooking(item, 'buy'); }}>
                    <ShoppingCart size={14} /> {t('खरीदें', 'Buy')}
                  </button>
                </div>

                <div className="card-meta" style={{ marginTop: '0', paddingTop: '8px' }}>
                  <div className="card-location">
                    <MapPin size={14} /> {item.location?.district}
                  </div>
                  <div className="rating">
                    <Star size={14} fill="currentColor" />
                    <span className="rating-value">{item.rating}</span>
                  </div>
                </div>

                {/* Unavailable warning */}
                {(item.status === 'booked' || item.status === 'sold') && (
                  <div style={{ 
                    marginTop: '8px', padding: '6px 10px', borderRadius: '8px',
                    background: '#fef3c7', fontSize: '0.75rem', color: '#92400e',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <AlertTriangle size={12} />
                    {item.status === 'booked' 
                      ? t('यह अभी किसी और को किराये पर दिया गया है', 'Currently rented to someone else')
                      : t('यह बिक चुका है', 'This has been sold')
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <div className="modal-overlay" onClick={() => setBookingModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <span>
                {bookingModal.action === 'rent' ? '🔄 ' : '🛒 '}
                {bookingModal.action === 'rent' ? t('किराये पर लें', 'Rent Equipment') : t('खरीदें', 'Buy Equipment')}
              </span>
              <button onClick={() => setBookingModal(null)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>×</button>
            </div>

            {/* Equipment summary */}
            <div className="card" style={{ padding: '12px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '2rem' }}>{bookingModal.item.image}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{lang === 'hi' ? bookingModal.item.nameHi : bookingModal.item.name}</div>
                <div className="card-price">₹{bookingModal.item.price?.toLocaleString()}<span>/{bookingModal.item.priceUnit === 'per_hour' ? t('घंटा', 'hr') : ''}</span></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('मालिक', 'Owner')}: {bookingModal.item.owner}</div>
              </div>
            </div>

            {/* Rent-specific fields */}
            {bookingModal.action === 'rent' && (
              <>
                <div className="form-group">
                  <label className="form-label"><Calendar size={14} style={{ display: 'inline' }} /> {t('शुरू तारीख', 'Start Date')}</label>
                  <input type="date" className="form-input" value={bookingForm.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label"><Calendar size={14} style={{ display: 'inline' }} /> {t('अंतिम तारीख', 'End Date')}</label>
                  <input type="date" className="form-input" value={bookingForm.endDate}
                    min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                    onChange={e => setBookingForm(prev => ({ ...prev, endDate: e.target.value }))} />
                </div>
                {bookingForm.startDate && bookingForm.endDate && (
                  <div className="card" style={{ padding: '10px', marginBottom: '12px', textAlign: 'center', background: 'var(--green-50)' }}>
                    <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    <span style={{ color: 'var(--green-800)', fontWeight: 600, marginLeft: '4px' }}>
                      {Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24))} {t('दिन', 'days')}
                      {bookingModal.item.priceUnit === 'per_hour' && (
                        <> — {t('अनुमानित', 'Est.')} ₹{(bookingModal.item.price * 8 * Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24))).toLocaleString()}</>
                      )}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label className="form-label">{t('अतिरिक्त जानकारी (वैकल्पिक)', 'Additional notes (optional)')}</label>
              <input type="text" className="form-input" value={bookingForm.notes}
                placeholder={t('कोई खास जरूरत?', 'Any special requirements?')}
                onChange={e => setBookingForm(prev => ({ ...prev, notes: e.target.value }))} />
            </div>

            {bookingStatus && (
              <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '12px', textAlign: 'center',
                background: bookingStatus.type === 'success' ? 'var(--green-50)' : '#fee2e2',
                color: bookingStatus.type === 'success' ? 'var(--green-800)' : '#991b1b' }}>
                {bookingStatus.message}
              </div>
            )}

            <button className={`btn ${bookingModal.action === 'rent' ? 'btn-primary' : 'btn-accent'} btn-full btn-lg`} 
              onClick={submitBooking}>
              {bookingModal.action === 'rent' 
                ? t('✅ किराये की बुकिंग करें', '✅ Confirm Rental Booking')
                : t('✅ खरीदने का अनुरोध भेजें', '✅ Send Purchase Request')
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
