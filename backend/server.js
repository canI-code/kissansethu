import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDB } from './config/db.js';
import profileRoutes from './routes/profile.js';
import equipmentRoutes from './routes/equipment.js';
import workersRoutes from './routes/workers.js';
import schemesRoutes from './routes/schemes.js';
import aiRoutes from './routes/ai.js';
import bookingsRoutes from './routes/bookings.js';
import ttsRoutes from './routes/tts.js';
import authRoutes from './routes/auth.js';
import callingRoutes from './routes/calling.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes wrapper to handle both local '/api' and Vercel's stripped prefix
const apiRouter = express.Router();

apiRouter.use('/profile', profileRoutes);
apiRouter.use('/equipment', equipmentRoutes);
apiRouter.use('/workers', workersRoutes);
apiRouter.use('/schemes', schemesRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/bookings', bookingsRoutes);
apiRouter.use('/tts', ttsRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/calling', callingRoutes);

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', name: 'KissanSetu API', timestamp: new Date().toISOString() });
});

// Mount router twice to support local dev AND Vercel's experimental routing
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Seed sample data
async function seedData() {
  let db;
  try {
    db = getDB();
  } catch {
    console.log('⚠️  Skipping seed — no database connection.');
    return;
  }
  
  // Check if already seeded
  const existingEquipment = await db.collection('equipment').countDocuments();
  if (existingEquipment > 0) {
    console.log('📦 Database already seeded, skipping...');
    return;
  }

  console.log('🌱 Seeding sample data...');

  // Sample Equipment
  const equipment = [
    {
      name: 'Mahindra 575 DI Tractor',
      nameHi: 'महिंद्रा 575 DI ट्रैक्टर',
      type: 'tractor',
      description: '45 HP tractor, perfect for ploughing and hauling. Well-maintained, 2022 model.',
      descriptionHi: '45 HP ट्रैक्टर, जुताई और ढुलाई के लिए उत्तम। अच्छी हालत में, 2022 मॉडल।',
      action: 'rent',
      price: 800,
      priceUnit: 'per_hour',
      hp: 45,
      image: '🚜',
      owner: 'Suresh Yadav',
      location: { village: 'Rampur', district: 'Lucknow', state: 'Uttar Pradesh' },
      rating: 4.5,
      totalRentals: 23,
      status: 'available',
      createdAt: new Date()
    },
    {
      name: 'Swaraj 744 FE Tractor',
      nameHi: 'स्वराज 744 FE ट्रैक्टर',
      type: 'tractor',
      description: '48 HP tractor with power steering. Ideal for heavy-duty farming operations.',
      descriptionHi: '48 HP ट्रैक्टर पावर स्टीयरिंग के साथ। भारी कृषि कार्य के लिए आदर्श।',
      action: 'rent',
      price: 900,
      priceUnit: 'per_hour',
      hp: 48,
      image: '🚜',
      owner: 'Rajesh Singh',
      location: { village: 'Sultanpur', district: 'Varanasi', state: 'Uttar Pradesh' },
      rating: 4.2,
      totalRentals: 15,
      status: 'available',
      createdAt: new Date()
    },
    {
      name: 'Combine Harvester (Self-Propelled)',
      nameHi: 'कम्बाइन हार्वेस्टर (स्वचालित)',
      type: 'harvester',
      description: 'Full-size combine harvester for wheat and rice harvesting. Comes with operator.',
      descriptionHi: 'गेहूं और चावल की कटाई के लिए फुल-साइज़ कम्बाइन हार्वेस्टर। ऑपरेटर के साथ।',
      action: 'rent',
      price: 2500,
      priceUnit: 'per_hour',
      image: '🌾',
      owner: 'Krishna Agro Services',
      location: { village: 'Mainpuri', district: 'Mainpuri', state: 'Uttar Pradesh' },
      rating: 4.8,
      totalRentals: 45,
      status: 'available',
      createdAt: new Date()
    },
    {
      name: 'Rotavator (Soil Tiller)',
      nameHi: 'रोटावेटर (मिट्टी जोतने वाला)',
      type: 'rotavator',
      description: '7-foot rotavator attachment for soil preparation. Fits most tractors above 35 HP.',
      descriptionHi: '7 फीट रोटावेटर अटैचमेंट मिट्टी तैयारी के लिए। 35 HP से ऊपर के ट्रैक्टरों पर फिट होता है।',
      action: 'rent',
      price: 500,
      priceUnit: 'per_hour',
      image: '⚙️',
      owner: 'Mohan Lal',
      location: { village: 'Barabanki', district: 'Barabanki', state: 'Uttar Pradesh' },
      rating: 4.0,
      totalRentals: 12,
      status: 'available',
      createdAt: new Date()
    },
    {
      name: 'Sprayer Machine (Battery Operated)',
      nameHi: 'स्प्रेयर मशीन (बैटरी चालित)',
      type: 'sprayer',
      description: '16L battery-powered knapsack sprayer for pesticide and fertilizer application.',
      descriptionHi: '16L बैटरी-चालित नैपसैक स्प्रेयर कीटनाशक और उर्वरक छिड़काव के लिए।',
      action: 'buy',
      price: 3500,
      priceUnit: 'fixed',
      image: '💨',
      owner: 'Kisan Agri Store',
      location: { village: 'Kanpur', district: 'Kanpur', state: 'Uttar Pradesh' },
      rating: 4.3,
      totalRentals: 0,
      status: 'available',
      createdAt: new Date()
    },
    {
      name: 'Seed Drill Machine',
      nameHi: 'सीड ड्रिल मशीन',
      type: 'seeder',
      description: '9-row seed drill for precise sowing. Saves seeds and improves germination rate.',
      descriptionHi: '9-पंक्ति सीड ड्रिल सटीक बुवाई के लिए। बीज बचाता है और अंकुरण दर बढ़ाता है।',
      action: 'rent',
      price: 600,
      priceUnit: 'per_hour',
      image: '🌱',
      owner: 'Farmtech Solutions',
      location: { village: 'Agra', district: 'Agra', state: 'Uttar Pradesh' },
      rating: 4.1,
      totalRentals: 8,
      status: 'available',
      createdAt: new Date()
    },
    {
      name: 'Solar Water Pump (5 HP)',
      nameHi: 'सोलर वाटर पंप (5 HP)',
      type: 'pump',
      description: '5 HP submersible solar pump with panels. Zero electricity cost irrigation.',
      descriptionHi: '5 HP सबमर्सिबल सोलर पंप पैनल के साथ। बिजली खर्च शून्य सिंचाई।',
      action: 'buy',
      price: 150000,
      priceUnit: 'fixed',
      image: '☀️',
      owner: 'Solar Green Energy',
      location: { village: 'Jaipur', district: 'Jaipur', state: 'Rajasthan' },
      rating: 4.7,
      totalRentals: 0,
      status: 'available',
      createdAt: new Date()
    },
    {
      name: 'Thresher Machine',
      nameHi: 'थ्रेशर मशीन',
      type: 'thresher',
      description: 'Multi-crop thresher for wheat, paddy, and soybean. High capacity output.',
      descriptionHi: 'गेहूं, धान और सोयाबीन के लिए मल्टी-क्रॉप थ्रेशर। उच्च क्षमता आउटपुट।',
      action: 'rent',
      price: 1200,
      priceUnit: 'per_hour',
      image: '🏭',
      owner: 'Bharat Agro',
      location: { village: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh' },
      rating: 4.4,
      totalRentals: 30,
      status: 'available',
      createdAt: new Date()
    }
  ];

  // Sample Workers
  const workers = [
    {
      name: 'Ramu Kaka',
      nameHi: 'रामू काका',
      skills: ['ploughing', 'sowing', 'harvesting', 'general'],
      skillsHi: ['जुताई', 'बुवाई', 'कटाई', 'सामान्य'],
      experience: 15,
      dailyRate: 400,
      image: '👨‍🌾',
      location: { village: 'Rampur', district: 'Lucknow', state: 'Uttar Pradesh' },
      available: true,
      rating: 4.8,
      totalJobs: 120,
      phone: '9876543210',
      bio: 'Experienced farmer with 15+ years of work. Expert in wheat and rice cultivation.',
      bioHi: '15+ साल के अनुभवी किसान। गेहूं और चावल की खेती में विशेषज्ञ।',
      createdAt: new Date()
    },
    {
      name: 'Lakshmi Devi',
      nameHi: 'लक्ष्मी देवी',
      skills: ['sowing', 'weeding', 'transplanting', 'vegetable_farming'],
      skillsHi: ['बुवाई', 'निराई', 'रोपाई', 'सब्जी खेती'],
      experience: 10,
      dailyRate: 350,
      image: '👩‍🌾',
      location: { village: 'Sultanpur', district: 'Varanasi', state: 'Uttar Pradesh' },
      available: true,
      rating: 4.6,
      totalJobs: 85,
      phone: '9876543211',
      bio: 'Expert in vegetable farming and transplanting. Leads a group of 5 women workers.',
      bioHi: 'सब्जी खेती और रोपाई में विशेषज्ञ। 5 महिला मजदूरों का समूह।',
      createdAt: new Date()
    },
    {
      name: 'Shyam Tractor Operator',
      nameHi: 'श्याम ट्रैक्टर ऑपरेटर',
      skills: ['tractor_operation', 'ploughing', 'transport', 'harvester_operation'],
      skillsHi: ['ट्रैक्टर चालक', 'जुताई', 'ढुलाई', 'हार्वेस्टर संचालन'],
      experience: 8,
      dailyRate: 600,
      image: '🧑‍🔧',
      location: { village: 'Mainpuri', district: 'Mainpuri', state: 'Uttar Pradesh' },
      available: true,
      rating: 4.5,
      totalJobs: 200,
      phone: '9876543212',
      bio: 'Licensed tractor and harvester operator. Can operate all major tractor brands.',
      bioHi: 'लाइसेंस प्राप्त ट्रैक्टर और हार्वेस्टर ऑपरेटर। सभी प्रमुख ट्रैक्टर ब्रांड चला सकते हैं।',
      createdAt: new Date()
    },
    {
      name: 'Birju & Team (5 Workers)',
      nameHi: 'बिरजू और टीम (5 मजदूर)',
      skills: ['harvesting', 'loading', 'general', 'irrigation'],
      skillsHi: ['कटाई', 'लदाई', 'सामान्य', 'सिंचाई'],
      experience: 12,
      dailyRate: 350,
      image: '👷',
      location: { village: 'Barabanki', district: 'Barabanki', state: 'Uttar Pradesh' },
      available: true,
      rating: 4.3,
      totalJobs: 300,
      phone: '9876543213',
      bio: 'Team of 5 experienced workers available for all farming tasks. Group booking preferred.',
      bioHi: 'सभी कृषि कार्यों के लिए 5 अनुभवी मजदूरों की टीम। समूह बुकिंग को प्राथमिकता।',
      groupSize: 5,
      createdAt: new Date()
    },
    {
      name: 'Sunil Sprayer Expert',
      nameHi: 'सुनील स्प्रे विशेषज्ञ',
      skills: ['spraying', 'pest_control', 'fertilizer_application'],
      skillsHi: ['छिड़काव', 'कीट नियंत्रण', 'उर्वरक छिड़काव'],
      experience: 6,
      dailyRate: 500,
      image: '🧑‍🌾',
      location: { village: 'Kanpur', district: 'Kanpur', state: 'Uttar Pradesh' },
      available: true,
      rating: 4.4,
      totalJobs: 60,
      phone: '9876543214',
      bio: 'Specialist in crop spraying with drone and manual equipment. Certified in pesticide handling.',
      bioHi: 'ड्रोन और मैनुअल उपकरण से फसल छिड़काव में विशेषज्ञ। कीटनाशक प्रमाणित।',
      createdAt: new Date()
    },
    {
      name: 'Geeta Organic Farm Worker',
      nameHi: 'गीता जैविक खेती मजदूर',
      skills: ['organic_farming', 'composting', 'vermicompost', 'sowing'],
      skillsHi: ['जैविक खेती', 'कम्पोस्टिंग', 'वर्मीकम्पोस्ट', 'बुवाई'],
      experience: 5,
      dailyRate: 450,
      image: '👩‍🌾',
      location: { village: 'Agra', district: 'Agra', state: 'Uttar Pradesh' },
      available: false,
      rating: 4.7,
      totalJobs: 40,
      phone: '9876543215',
      bio: 'Trained in organic farming methods. Expert in vermicomposting and natural pest control.',
      bioHi: 'जैविक खेती विधियों में प्रशिक्षित। वर्मीकम्पोस्टिंग और प्राकृतिक कीट नियंत्रण में विशेषज्ञ।',
      createdAt: new Date()
    }
  ];

  await db.collection('equipment').insertMany(equipment);
  await db.collection('workers').insertMany(workers);
  console.log(`✅ Seeded ${equipment.length} equipment items and ${workers.length} workers`);
}

// Start server (local dev only — Vercel uses the exported app via api/index.js)
async function start() {
  await connectDB();
  await seedData();

  app.listen(PORT, () => {
    console.log(`\n🌾 KissanSetu API Server running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health\n`);
  });
}

// Only start the HTTP server when running directly (not imported by Vercel)
if (process.env.VERCEL !== '1') {
  start().catch(console.error);
} else {
  // On Vercel: connect DB at cold start without blocking
  connectDB().catch(err => console.error('DB connect error:', err));
}

export default app;
