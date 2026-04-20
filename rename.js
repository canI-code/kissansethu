const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.match(/\.(jsx?|js|css|html|json|md)$/)) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('f:/new-kissansetu');
let replacedCount = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let updated = content
    .replace(/KissanSetu/g, 'KhetSetu')
    .replace(/kissansetu/g, 'khetsetu')
    .replace(/KISSANSETU/g, 'KHETSETU')
    .replace(/Kissan Setu/g, 'Khet Setu')
    .replace(/Kissan/g, 'Khet')
    .replace(/kissan/g, 'khet');
    
  if (updated !== content) {
    fs.writeFileSync(f, updated, 'utf8');
    replacedCount++;
    console.log(`Updated: ${f}`);
  }
});

console.log(`Total files updated: ${replacedCount}`);
