const API_BASE = 'http://localhost:5000/api';

export const API = {
  profile: `${API_BASE}/profile`,
  equipment: `${API_BASE}/equipment`,
  workers: `${API_BASE}/workers`,
  schemes: `${API_BASE}/schemes`,
  ai: `${API_BASE}/ai`,
  bookings: `${API_BASE}/bookings`,
  tts: `${API_BASE}/tts`,
  health: `${API_BASE}/health`,
  calling: `${API_BASE}/calling`,
};

export const EQUIPMENT_TYPES = [
  { id: 'all', label: 'All', labelHi: 'सभी', emoji: '📦' },
  { id: 'tractor', label: 'Tractor', labelHi: 'ट्रैक्टर', emoji: '🚜' },
  { id: 'harvester', label: 'Harvester', labelHi: 'हार्वेस्टर', emoji: '🌾' },
  { id: 'rotavator', label: 'Rotavator', labelHi: 'रोटावेटर', emoji: '⚙️' },
  { id: 'sprayer', label: 'Sprayer', labelHi: 'स्प्रेयर', emoji: '💨' },
  { id: 'seeder', label: 'Seeder', labelHi: 'सीड ड्रिल', emoji: '🌱' },
  { id: 'pump', label: 'Pump', labelHi: 'पंप', emoji: '☀️' },
  { id: 'thresher', label: 'Thresher', labelHi: 'थ्रेशर', emoji: '🏭' },
];

export const WORKER_SKILLS = [
  { id: 'all', label: 'All', labelHi: 'सभी' },
  { id: 'ploughing', label: 'Ploughing', labelHi: 'जुताई' },
  { id: 'sowing', label: 'Sowing', labelHi: 'बुवाई' },
  { id: 'harvesting', label: 'Harvesting', labelHi: 'कटाई' },
  { id: 'spraying', label: 'Spraying', labelHi: 'छिड़काव' },
  { id: 'tractor_operation', label: 'Tractor', labelHi: 'ट्रैक्टर' },
  { id: 'irrigation', label: 'Irrigation', labelHi: 'सिंचाई' },
  { id: 'general', label: 'General', labelHi: 'सामान्य' },
];

export default API_BASE;
