const fs = require('fs');
let css = fs.readFileSync('f:/new-kissansetu/frontend/src/index.css', 'utf8');

// Ensure navbar is horizontally constrained and centered.
css = css.replace(/\.navbar\s*\{([\s\S]*?)\}/, `.navbar {
  $1
  max-width: var(--max-width);
  margin: 0 auto;
}`);

css += `
@media (min-width: 1024px) {
  .navbar {
    justify-content: center;
    gap: 60px;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.05);
  }
}
`;

fs.writeFileSync('f:/new-kissansetu/frontend/src/index.css', css);
console.log('Desktop navbar polished');
