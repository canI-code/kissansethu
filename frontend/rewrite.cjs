const fs = require('fs');

try {
  let text = fs.readFileSync('f:/new-kissansetu/frontend/src/pages/Landing.jsx', 'utf8');

  if (!text.includes('./Landing.css')) {
    text = text.replace(/import React(.*?);/, "import React$1;\nimport './Landing.css';");
  }

  // Grids
  text = text.replace(/style=\{\{\s*gridTemplateColumns:\s*'repeat\(4,\s*1fr\)',\s*gap:\s*'24px',\s*background:\s*'white',\s*padding:\s*'32px 40px',\s*borderRadius:\s*'24px',\s*boxShadow:\s*'0 20px 40px rgba\(0,0,0,0\.06\)'\s*\}\}/g, 
    'className="stats-container grid-4" style={{}}');

  text = text.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\(3,\s*1fr\)',\s*gap:\s*'32px'\s*\}\}/g,
    'className="features-container grid-3" style={{ display: "grid", gap: "32px" }}');

  text = text.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\(4,\s*1fr\)',\s*gap:\s*'40px',\s*position:\s*'relative'\s*\}\}/g,
    'className="how-it-works-container grid-4" style={{ display: "grid", gap: "40px", position: "relative" }}');

  text = text.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\(4,\s*1fr\)',\s*gap:\s*'24px',\s*alignItems:\s*'center'\s*\}\}/g,
    'className="pricing-container grid-4" style={{ display: "grid", gap: "24px", alignItems: "center" }}');
    
  text = text.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\(3,\s*1fr\)',\s*gap:\s*'32px'\s*\}\}/g,
    'className="testimonials-container grid-3" style={{ display: "grid", gap: "32px" }}');

  text = text.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'1fr 1fr',\s*gap:\s*'20px',\s*marginBottom:\s*'40px'\s*\}\}/g,
    'className="grid-2" style={{ display: "grid", gap: "20px", marginBottom: "40px" }}');

  // Nav links
  text = text.replace(/<div className="nav-links" style=\{\{ display: 'none' \}\}>/, 
    '<div className="nav-links mobile-hidden" style={{ display: "flex", gap: "32px" }}>');

  // Hero Section Content flex fix
  text = text.replace(/style=\{\{\s*maxWidth:\s*'1400px',\s*margin:\s*'0 auto',\s*padding:\s*'0 48px',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*justifyContent:\s*'space-between',\s*zIndex:\s*1,\s*position:\s*'relative'\s*\}\}/g,
    'className="hero-content"');

  text = text.replace(/style=\{\{\s*flex:\s*'1',\s*maxWidth:\s*'650px',\s*paddingRight:\s*'40px'\s*\}\}/g,
    'className="hero-text" style={{ flex: 1 }}');

  text = text.replace(/style=\{\{\s*fontSize:\s*'4\.5rem',\s*fontWeight:\s*900,\s*color:\s*'#0f172a',\s*lineHeight:\s*1\.1,\s*marginBottom:\s*'24px',\s*letterSpacing:\s*'-1\.5px'\s*\}\}/g,
    'className="hero-title"');

  text = text.replace(/style=\{\{\s*fontSize:\s*'1\.25rem',\s*color:\s*'#475569',\s*lineHeight:\s*1\.6,\s*marginBottom:\s*'48px',\s*maxWidth:\s*'580px'\s*\}\}/g,
    'className="hero-subtitle"');
    
  text = text.replace(/style=\{\{\s*display:\s*'flex',\s*gap:\s*'16px',\s*marginBottom:\s*'48px',\s*flexWrap:\s*'wrap'\s*\}\}/g,
    'className="hero-buttons"');

  text = text.replace(/style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'20px',\s*flexWrap:\s*'wrap'\s*\}\}/g,
    'className="hero-features"');

  // Header 
  text = text.replace(/<header style=\{\{\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*alignItems:\s*'center',\s*padding:\s*'20px 48px',\s*position:\s*'absolute',\s*width:\s*'100%',\s*zIndex:\s*50\s*\}\}>/,
    '<header className="header">');

  text = text.replace(/<div style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'24px'\s*\}\}>/,
    '<div className="header-actions">');

  // Voice Showcase Content flex wrapping
  text = text.replace(/style=\{\{\s*maxWidth:\s*'1400px',\s*margin:\s*'0 auto',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'80px'\s*\}\}/g,
    'className="voice-showcase-content" style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "80px", flexWrap: "wrap", justifyContent: "center" }}');

  // App CTA flex wrap
  text = text.replace(/style=\{\{\s*maxWidth:\s*'1400px',\s*margin:\s*'0 auto',\s*background:\s*'#064e3b',\s*borderRadius:\s*'40px',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*overflow:\s*'hidden',\s*padding:\s*'0 64px',\s*position:\s*'relative'\s*\}\}/g,
    'style={{ maxWidth: "1400px", margin: "0 auto", background: "#064e3b", borderRadius: "40px", display: "flex", alignItems: "center", flexWrap: "wrap", overflow: "hidden", padding: "0 32px", position: "relative" }}');

  // Footer flex wrap
  text = text.replace(/style=\{\{\s*maxWidth:\s*'1400px',\s*margin:\s*'0 auto',\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*flexWrap:\s*'wrap',\s*gap:\s*'64px'\s*\}\}/g,
    'style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px" }}');

  fs.writeFileSync('f:/new-kissansetu/frontend/src/pages/Landing.jsx', text);
  console.log("Rewrite successful.");
} catch (e) {
  console.error("Error during rewrite:", e);
}
