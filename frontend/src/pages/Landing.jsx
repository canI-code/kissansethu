import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Mic, Globe, Sun, ShieldCheck, Wallet, Navigation, ChevronRight, 
  User, Tractor, Users, MapPin, PlayCircle, AppWindow, BadgeCheck, CheckCircle2, 
  Zap, ArrowRight, Star, Smartphone, Apple, CloudSun
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{ background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        .landing-page * { box-sizing: border-box; }
        .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); }
        .btn-hover { transition: all 0.2s; }
        .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3); }
        .badge-pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .float-anim { animation: float 6s ease-in-out infinite; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #16a34a, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav-btn:hover { color: #16a34a; }
        .step-card:hover .step-num { background: #16a34a; color: white; border-color: #16a34a; }
      `}</style>

      {/* ========== HEADER ========== */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', position: 'absolute', width: '100%', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#22c55e', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🌱</span>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
            Kissan<span style={{ color: '#16a34a' }}>Setu</span>
          </span>
        </div>
        
        <div className="nav-links" style={{ display: 'none' }}>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="nav-btn" style={{ color: '#475569', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', transition: 'color 0.2s' }}><Search size={20} /></button>
          
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: '50px', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
            <Mic size={16} /> Try Voice
            <span className="badge-pulse" style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></span>
          </button>

          <button className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', background: 'none', border: 'none', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }}>
            <Globe size={18} /> EN
          </button>

          <button className="nav-btn" onClick={() => navigate('/login')} style={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}>Login</button>
          
          <button className="btn-hover" onClick={() => navigate('/signup')} style={{ background: '#16a34a', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}>Get Started</button>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', paddingTop: '140px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>
        {/* Decor */}
        <div style={{ position: 'absolute', top: '20%', left: '5%', opacity: 0.3, transform: 'rotate(-15deg)', fontSize: '3rem' }}>🌿</div>
        <div style={{ position: 'absolute', bottom: '25%', right: '10%', opacity: 0.5, transform: 'rotate(25deg)', fontSize: '2.5rem' }}>🌱</div>
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
          
          {/* Left Text */}
          <div style={{ flex: '1', maxWidth: '650px', paddingRight: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '32px', boxShadow: '0 4px 12px rgba(22,163,74,0.1)' }}>
              ✨ India's Premier Agricultural Platform
            </div>

            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Empowering India's Farmers <span className="gradient-text">with Technology</span>
            </h1>

            <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: 1.6, marginBottom: '48px', maxWidth: '580px' }}>
              Connect with verified agricultural workers, rent modern farming equipment, and boost your productivity — all from one platform built for Indian farmers.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
              <button className="btn-hover" onClick={() => navigate('/signup')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', color: 'white', padding: '16px 32px', borderRadius: '14px', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>
                Get Started <ArrowRight size={20} />
              </button>
              <button className="btn-hover" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#0f172a', padding: '16px 32px', borderRadius: '14px', fontWeight: 600, fontSize: '1.1rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                Browse Services
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                <ShieldCheck size={20} color="#16a34a" /> Verified Workers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                <Wallet size={20} color="#f59e0b" /> Secure Payments
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                <Mic size={20} color="#a855f7" /> Voice Enabled
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                <Navigation size={20} color="#3b82f6" /> GPS Tracking
              </div>
            </div>
          </div>

          {/* Right Mobile Mockup */}
          <div className="float-anim" style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '300px', height: '300px', background: '#bbf7d0', filter: 'blur(70px)', zIndex: 0, borderRadius: '50%', opacity: 0.6 }}></div>
            
            <div style={{ width: '340px', height: '680px', background: '#1e293b', borderRadius: '45px', padding: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px #334155, 30px 40px 60px rgba(0,0,0,0.1)', position: 'relative', transform: 'rotate(6deg)', zIndex: 10 }}>
              <div style={{ width: '100%', height: '100%', background: '#f8fafc', borderRadius: '35px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {/* Notch */}
                <div style={{ position: 'absolute', top: 0, width: '100%', height: '26px', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                  <div style={{ width: '110px', height: '26px', background: '#1e293b', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '40px', height: '6px', background: '#334155', borderRadius: '4px' }}></div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>
                  <span>9:41</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '12px', height: '10px', background: '#1e293b', borderRadius: '2px' }}></div>
                    <div style={{ width: '14px', height: '10px', background: '#1e293b', borderRadius: '2px' }}></div>
                  </div>
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ background: '#22c55e', color: 'white', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                      <span style={{ fontSize: '0.7rem' }}>🌱</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#064e3b' }}>KissanSetu</span>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '20px', padding: '20px', color: 'white', marginBottom: '20px', boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.4)' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '2px' }}>Good Morning</p>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '20px' }}>किसान!</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>Dashboard</div>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>AI Chat</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[ 
                      { i: <User size={20} color="#f59e0b" />, t: 'Hire Worker', s: 'Find nearby', b: '#fffbeb' },
                      { i: <Tractor size={20} color="#3b82f6" />, t: 'Rent Equipment', s: 'Browse all', b: '#eff6ff' },
                      { i: <Mic size={20} color="#a855f7" />, t: 'AI Assistant', s: 'Ask anything', b: '#faf5ff' },
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: 'white', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ width: '42px', height: '42px', background: item.b, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.i}</div>
                        <div>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{item.t}</h3>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.s}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '5px', background: '#cbd5e1', borderRadius: '10px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section style={{ maxWidth: '1400px', margin: '-40px auto 80px', padding: '0 48px', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', background: 'white', padding: '32px 40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
          {[
            { value: '10,000+', label: 'Farmers', sub: 'Connecting rural India' },
            { value: '5,000+', label: 'Workers', sub: 'Skilled agricultural labor' },
            { value: '2,500+', label: 'Equipment', sub: 'Modern farming tools' },
            { value: '35+', label: 'Districts', sub: 'Across Maharashtra' },
          ].map((stat, i) => (
            <div key={i} style={{ borderRight: i < 3 ? '1px solid #e2e8f0' : 'none' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16a34a', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section style={{ padding: '80px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Features</div>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>Everything You Need for Modern Farming</h2>
          <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Three powerful features designed specifically for Indian agriculture</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {[
            { icon: <Users size={32} color="#f59e0b" />, title: 'Find Skilled Workers', bg: '#fffbeb', desc: 'Browse verified agricultural workers near you with skills matching your exact needs. Filter by location, skill, rating, and availability.' },
            { icon: <Tractor size={32} color="#3b82f6" />, title: 'Rent Equipment', bg: '#eff6ff', desc: 'Access modern farming equipment at affordable rates. From tractors to seed drills — find what you need, when you need it.' },
            { icon: <Mic size={32} color="#a855f7" />, title: 'AI Voice Assistant', bg: '#faf5ff', desc: 'Navigate the platform using voice commands in Hindi, Marathi, and English. Perfect for farmers who prefer speaking over typing.' },
          ].map((f, i) => (
            <div key={i} className="hover-lift" style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '72px', height: '72px', background: f.bg, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>{f.title}</h3>
              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== VOICE SHOWCASE SECTION ========== */}
      <section style={{ padding: '100px 48px', background: '#0f172a', color: 'white', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '80px' }}>
          
          {/* Left info */}
          <div style={{ flex: '1' }}>
            <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Voice-First Platform</div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.1 }}>Just Speak — <br />We Understand</h2>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '40px' }}>
              Our AI Voice Assistant understands Hindi, Marathi & English. No typing needed — simply speak your query and get instant help with farming, weather, prices & more.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              {[
                { e: '🗣️', t: 'Book workers by voice command' },
                { e: '🌤️', t: 'Get weather updates in your language' },
                { e: '💰', t: 'Ask about crop prices instantly' },
                { e: '✋', t: 'Navigate the entire app hands-free' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.e}</span>
                  <span style={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: 500 }}>{item.t}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-hover" style={{ background: '#22c55e', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Mic size={20} /> Try Voice Assistant
              </button>
              <button className="btn-hover" style={{ background: 'transparent', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', border: '1px solid #334155', cursor: 'pointer' }}>
                Learn More
              </button>
            </div>
          </div>

          {/* Right Chat Mockup */}
          <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: '#3b82f6', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.3 }}></div>
            
            <div style={{ width: '400px', background: '#1e293b', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', border: '1px solid #334155', position: 'relative', zIndex: 10 }}>
              
              <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#3b82f6', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mic size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>AI Assistant</div>
                    <div style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>Voice Active</div>
                  </div>
                </div>
                <div style={{ background: '#0f172a', padding: '6px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #334155' }}>
                  EN / HI / MR
                </div>
              </div>

              <div style={{ padding: '24px', background: '#0f172a', height: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* User msg */}
                <div style={{ alignSelf: 'flex-end', background: '#3b82f6', padding: '12px 16px', borderRadius: '16px 16px 0 16px', maxWidth: '80%' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>How's the weather in Nashik today?</p>
                </div>

                {/* AI msg */}
                <div style={{ alignSelf: 'flex-start', background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '16px 16px 16px 0', maxWidth: '85%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CloudSun size={18} color="#f59e0b" /> <span style={{ fontWeight: 600 }}>Nashik Weather</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.5 }}>Partly cloudy, 32°C. Good day for spraying pesticides. Light winds expected. No rain for next 3 days.</p>
                  <button style={{ background: 'none', border: 'none', color: '#3b82f6', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <PlayCircle size={16} /> Listen
                  </button>
                </div>

                {/* User msg */}
                <div style={{ alignSelf: 'flex-end', background: '#3b82f6', padding: '12px 16px', borderRadius: '16px 16px 0 16px', maxWidth: '80%' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Best crop to plant now?</p>
                </div>

                {/* Typing ind */}
                <div style={{ alignSelf: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge-pulse" style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span> 
                  Listening in Hindi...
                </div>

              </div>

              <div style={{ padding: '16px', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '50px', padding: '12px 20px', color: '#64748b', fontSize: '0.9rem' }}>
                  Type or speak...
                </div>
                <button style={{ background: '#22c55e', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Mic size={20} color="white" />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section style={{ padding: '100px 48px', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>How It Works</div>
        <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>Get Started in 4 Simple Steps</h2>
        <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 64px' }}>From registration to verified work — it's that simple</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', position: 'relative' }}>
          {/* Connector line */}
          <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0, border: '1px dashed #cbd5e1' }}></div>
          
          {[
            { n: 1, t: 'Register', p: 'Create your profile in under 2 minutes', i: <User size={24} color="#16a34a" /> },
            { n: 2, t: 'Search', p: 'Find workers & equipment near you', i: <Search size={24} color="#16a34a" /> },
            { n: 3, t: 'Book', p: 'Book with voice or text commands', i: <Zap size={24} color="#16a34a" /> },
            { n: 4, t: 'Done', p: 'Work verified & payment released', i: <CheckCircle2 size={24} color="#16a34a" /> },
          ].map((item, i) => (
            <div key={i} className="step-card hover-lift" style={{ position: 'relative', zIndex: 1, background: 'white', padding: '40px 24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', cursor: 'pointer' }}>
              <div className="step-num" style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', border: '8px solid #f0fdf4', transition: 'all 0.3s' }}>
                {item.i}
              </div>
              <div style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Step 0{item.n}</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>{item.t}</h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section style={{ padding: '100px 48px', background: '#f0fdf4' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Plans</div>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>Simple, Affordable Pricing</h2>
            <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Choose a plan that works for you — upgrade anytime</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', alignItems: 'center' }}>
            {/* Basic */}
            <div className="hover-lift" style={{ background: 'white', padding: '40px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Basic</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16a34a', marginBottom: '8px' }}>Free</div>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', minHeight: '44px' }}>Get started with basic features</p>
              <button style={{ width: '100%', background: '#f8fafc', color: '#0f172a', fontWeight: 700, border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', marginBottom: '32px' }}>Current Plan</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#16a34a" /> Browse workers & equipment</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#16a34a" /> Create up to 2 bookings/month</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#16a34a" /> View weather updates</div>
              </div>
            </div>

            {/* Pro Farmer */}
            <div className="hover-lift" style={{ background: '#16a34a', padding: '48px 32px', borderRadius: '24px', border: '2px solid #22c55e', boxShadow: '0 20px 40px rgba(22,163,74,0.2)', position: 'relative', transform: 'scale(1.05)', zIndex: 10 }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: 'white', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', padding: '6px 16px', borderRadius: '50px' }}>Popluar</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Pro Farmer</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>₹49<span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.8 }}>/month</span></div>
              <p style={{ color: '#dcfce7', fontSize: '0.95rem', marginBottom: '24px', minHeight: '44px' }}>Everything a farmer needs</p>
              <button className="hover-bg-green" style={{ width: '100%', background: 'white', color: '#16a34a', fontWeight: 800, border: 'none', padding: '14px', borderRadius: '12px', marginBottom: '32px', cursor: 'pointer' }}>Upgrade Now</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'white' }}><CheckCircle2 size={20} color="#86efac" /> Unlimited bookings</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'white' }}><CheckCircle2 size={20} color="#86efac" /> AI voice assistant</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'white' }}><CheckCircle2 size={20} color="#86efac" /> Priority support</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'white' }}><CheckCircle2 size={20} color="#86efac" /> Government scheme alerts</div>
              </div>
            </div>

            {/* Pro Worker */}
            <div className="hover-lift" style={{ background: 'white', padding: '40px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Pro Worker</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16a34a', marginBottom: '8px' }}>₹99<span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>/month</span></div>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', minHeight: '44px' }}>Grow your agricultural business</p>
              <button style={{ width: '100%', background: '#f8fafc', color: '#16a34a', fontWeight: 700, border: '1px solid #22c55e', padding: '12px', borderRadius: '12px', marginBottom: '32px', cursor: 'pointer' }}>Upgrade Now</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#16a34a" /> Verified badge</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#16a34a" /> Priority in search</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#16a34a" /> Earnings analytics</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#16a34a" /> Direct messaging</div>
              </div>
            </div>

            {/* Elite */}
            <div className="hover-lift" style={{ background: 'white', padding: '40px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Elite</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16a34a', marginBottom: '8px' }}>₹299<span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>/month</span></div>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', minHeight: '44px' }}>Complete platform access</p>
              <button style={{ width: '100%', background: '#0f172a', color: 'white', fontWeight: 700, border: 'none', padding: '12px', borderRadius: '12px', marginBottom: '32px', cursor: 'pointer' }}>Go Elite</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#0f172a" /> All Pro features</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#0f172a" /> Multi-role support</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#0f172a" /> Advanced analytics</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: '#475569' }}><CheckCircle2 size={20} color="#0f172a" /> Dedicated account manager</div>
              </div>
            </div>

          </div>
          
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>View All Plans <ArrowRight size={18} /></button>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section style={{ padding: '100px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Testimonials</div>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>Trusted by Farmers Across Maharashtra</h2>
          <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Hear what our community has to say</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {[
            { tag: 'KS', name: 'Early Adopter', role: 'Farmer, Maharashtra', q: "KissanSetu is building the future of farming — connecting farmers with workers and equipment through a simple, voice-enabled platform." },
            { tag: 'BT', name: 'Beta Tester', role: 'Worker, Maharashtra', q: "A platform that truly understands the needs of agricultural workers. Easy to use, available in Hindi and Marathi, and built for rural India." },
            { tag: 'CM', name: 'Community Member', role: 'Equipment Owner, Maharashtra', q: "Finally, a platform where I can list my farming equipment and connect with farmers who need it. Simple, secure, and effective." },
          ].map((t, i) => (
            <div key={i} style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', marginBottom: '24px' }}>
                <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" />
              </div>
              <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.6, flex: 1, fontStyle: 'italic', marginBottom: '32px' }}>“{t.q}”</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                  {t.tag}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{t.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== MOBILE APP CTA ========== */}
      <section style={{ padding: '0 48px 100px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', background: '#064e3b', borderRadius: '40px', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0 64px', position: 'relative' }}>
          
          <div style={{ flex: 1, padding: '80px 0', zIndex: 10, color: 'white' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.1 }}>Download the App,<br/>Farm Smarter</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '40px', maxWidth: '450px' }}>
              Get KissanSetu on your phone. Book workers, rent equipment, and manage your farm — all from your pocket. Works offline too!
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
              <button className="btn-hover" style={{ background: '#0f172a', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <Apple size={24} /> 
                <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.7rem', display: 'block', fontWeight: 500 }}>Download on the</span>
                  <span>App Store</span>
                </span>
              </button>
              <button className="btn-hover" style={{ background: '#0f172a', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <Smartphone size={24} /> 
                <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.7rem', display: 'block', fontWeight: 500 }}>Get it on</span>
                  <span>Google Play</span>
                </span>
              </button>
            </div>
            <div style={{ display: 'flex', gap: '24px', opacity: 0.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle2 size={16} /> Free to download</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle2 size={16} /> Works offline</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle2 size={16} /> Voice enabled</div>
            </div>
          </div>

          <div style={{ flex: 1, height: '400px', position: 'relative' }}>
             <img src="https://images.unsplash.com/photo-1592982537447-6f2b6a0a2c5a?auto=format&fit=crop&q=80&w=600&h=800" alt="Farmer" style={{ position: 'absolute', right: '-10%', bottom: '-150px', width: '120%', filter: 'opacity(0.4) saturate(0.5)' }} />
          </div>

        </div>
      </section>

      {/* ========== NEWSLETTER ========== */}
      <section style={{ padding: '0 48px 100px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Stay Updated with <span style={{ color: '#16a34a' }}>KissanSetu News</span></h2>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '40px' }}>Get farming tips, scheme updates, and platform news delivered to your inbox. Join 10,000+ farmers already subscribed.</p>
        
        <div style={{ display: 'flex', gap: '12px', background: 'white', padding: '8px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <input type="email" placeholder="Enter your email" style={{ flex: 1, border: 'none', padding: '16px 20px', fontSize: '1.05rem', outline: 'none', background: 'transparent' }} />
          <button style={{ background: '#16a34a', color: 'white', padding: '0 32px', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', border: 'none', cursor: 'pointer' }}>Subscribe</button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '16px' }}>No spam, unsubscribe anytime. We respect your privacy.</p>
      </section>

      {/* ========== BOTTOM CTA ========== */}
      <section style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '120px 48px', color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-1px' }}>Join 10,000+ Farmers<br/>Transforming Agriculture</h2>
        <p style={{ fontSize: '1.3rem', opacity: 0.9, marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>Start your journey today. It's free, simple, and built for you.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button className="btn-hover" onClick={() => navigate('/signup')} style={{ background: 'white', color: '#16a34a', padding: '18px 40px', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            Create Free Account
          </button>
          <button className="btn-hover" onClick={() => navigate('/login')} style={{ background: 'transparent', color: 'white', padding: '18px 40px', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            Login to Account
          </button>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{ background: '#0f172a', padding: '80px 48px', color: '#94a3b8' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '64px' }}>
          
          <div style={{ flex: '2', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ background: '#22c55e', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🌱</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
                Kissan<span style={{ color: '#22c55e' }}>Setu</span>
              </span>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: '24px', maxWidth: '300px' }}>
              India's premier agricultural platform connecting farmers, workers, and equipment owners through voice-enabled technology.
            </p>
            <div style={{ fontSize: '1rem', color: '#dcfce7', fontWeight: 600 }}>
              AI Calling: +1 (717) 931-0375
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '24px' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Find Workers</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Rent Equipment</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Govt Schemes</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</a>
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '24px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Careers</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Blog</a>
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '24px' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Cookie Policy</a>
            </div>
          </div>

        </div>

        <div style={{ maxWidth: '1400px', margin: '80px auto 0', paddingTop: '32px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p style={{ margin: 0 }}>© 2026 KissanSetu. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Twitter</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>LinkedIn</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Instagram</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

