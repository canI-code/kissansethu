import { useState, useEffect } from 'react';
import { API } from '../config/constants';

const CLOUD_NAME = 'dq4iipai1'; // Standard Cloudinary name from env
const UPLOAD_PRESET = 'ml_default';

export default function Admin() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState('workers'); // 'workers' or 'equipment'
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    fetchItems(type);
  }, [type]);

  const fetchItems = async (currentType) => {
    try {
      const res = await fetch(API[currentType]);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error('Failed to fetch', e);
    }
  };

  const handleUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(id);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      // 1. Upload to Cloudinary
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      if (!imageUrl) {
        alert('Failed to upload image to Cloudinary.');
        setUploadingId(null);
        return;
      }

      // 2. Update backend record
      await fetch(`${API[type]}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }),
      });

      // 3. Refresh list
      fetchItems(type);
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    }
    setUploadingId(null);
  };

  return (
    <div className="page-container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛠️ Secret Data Admin</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Upload Cloudinary images for dummy data items.</p>
      
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button 
          className={`btn ${type === 'workers' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setType('workers')}
        >
          Workers
        </button>
        <button 
          className={`btn ${type === 'equipment' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setType('equipment')}
        >
          Equipment
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {items.map(item => (
          <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {item.image?.startsWith('http') ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (item.image || '❓')}
              </div>
              <div>
                <strong>{item.name || item.nameHi}</strong>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{type === 'workers' ? item.skills?.[0] : item.type}</div>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              {uploadingId === item._id ? (
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Uploading...</span>
              ) : (
                <>
                  <label htmlFor={`upload-${item._id}`} className="btn btn-accent" style={{ cursor: 'pointer', fontSize: '0.9rem', padding: '6px 12px' }}>
                    Upload Image
                  </label>
                  <input 
                    id={`upload-${item._id}`} 
                    type="file" 
                    accept="image/*" 
                    style={{ position: 'absolute', width: '0', height: '0', opacity: 0 }}
                    onChange={(e) => handleUpload(e, item._id)}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
