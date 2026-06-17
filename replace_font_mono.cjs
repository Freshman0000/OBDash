const fs = require('fs');
let content = fs.readFileSync('components/Gauge.tsx', 'utf8');
content = content.replace(/\bfont-mono\b/g, 'font-micro');
fs.writeFileSync('components/Gauge.tsx', content);
console.log('Replaced font-mono with font-micro');
