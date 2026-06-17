import fs from 'fs';

const content = fs.readFileSync('./components/Gauge.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/className="text-\[(32|28|22|18|20|24|14)cqh\]/)) {
    // Remove existing font-micro or font-lcd
    lines[i] = lines[i].replace(/\bfont-micro\b/g, '').replace(/\bfont-lcd\b/g, '');
    // Add font-lcd
    lines[i] = lines[i].replace(/className="/, 'className="font-lcd ');
    // Clean up double spaces
    lines[i] = lines[i].replace(/  +/g, ' ');
  }
}

fs.writeFileSync('./components/Gauge.tsx', lines.join('\n'));
console.log('Done');
