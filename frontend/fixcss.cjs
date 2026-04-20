const fs = require('fs');

let css = fs.readFileSync('f:/new-kissansetu/frontend/src/index.css', 'utf8');

// 1. Remove the lime green background radial gradient completely.
css = css.replace(/body::before\s*\{[\s\S]*?z-index:\s*-1;\s*\}/, 
  `body {
  background-color: var(--slate-50);
}`);

css = css.replace(/body\s*\{([\s\S]*?)\}/, `body {
  $1
  background-color: var(--slate-50);
}`);

// 2. Clean App-header
css = css.replace(/\.app-header\s*\{[\s\S]*?z-index:\s*100;\s*\}/, 
`.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}`);

// 3. Navbar fixes
css = css.replace(/\.navbar\s*\{([\s\S]*?box-shadow:\s*0\s*-4px\s*20px\s*rgba\(0,0,0,0\.06\);\s*)\}/,
`.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 var(--space-4);
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.04);
}`);

// Clear out navbar-scroll behavior
css = css.replace(/\.navbar\.navbar-scroll\s*\{[\s\S]*?-ms-overflow-style:\s*none;\s*\}/,
`.navbar-scroll {
  /* removed aggressive scrolling logic */
}`);

// Nav item basics
css = css.replace(/\.nav-item\s*\{[\s\S]*?text-decoration:\s*none;\s*\}/,
`.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  color: var(--slate-500);
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.nav-item:hover {
  color: var(--green-600);
  background: var(--green-50);
}`);

css = css.replace(/\.nav-item\.active\s*\{[\s\S]*?rgba\(22,\s*163,\s*74,\s*0\.1\);\s*\}/,
`.nav-item.active {
  color: var(--green-600);
  background: var(--green-50);
  box-shadow: 0 2px 8px rgba(34,197,94,0.1);
}`);

// Tone down the overly aggressive .nav-item-call popup
css = css.replace(/\.nav-item-call\s*\{[\s\S]*?padding:\s*0;\s*box-shadow:\s*.*?;\s*\}/,
`.nav-item-call {
  color: var(--slate-500);
  background: transparent;
}`);

css = css.replace(/\.nav-item-call\s*svg\s*\{\s*width:\s*24px;\s*height:\s*24px;\s*\}/, '');

css = css.replace(/\.nav-item-call:hover\s*\{[\s\S]*?color:\s*white;\s*\}/, 
`.nav-item-call:hover {
  transform: none;
  box-shadow: none;
}`);

fs.writeFileSync('f:/new-kissansetu/frontend/src/index.css', css);
console.log('index.css script ran.');
