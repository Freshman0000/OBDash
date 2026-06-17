const fs = require('fs');
let content = fs.readFileSync('components/Gauge.tsx', 'utf8');
content = content.replace(/\bfont-sans\b/g, 'font-micro');
fs.writeFileSync('components/Gauge.tsx', content);
console.log('Replaced font-sans with font-micro');
