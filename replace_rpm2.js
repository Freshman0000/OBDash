import fs from 'fs';

const content = fs.readFileSync('./components/Gauge.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('>RPM</span>')) {
    // Look backwards for the span containing the number
    for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
      if (lines[j].includes('<span className=')) {
        lines[j] = lines[j].replace('font-micro', 'font-lcd').replace('font-sans', 'font-lcd').replace('font-mono', 'font-lcd');
        break;
      }
    }
  }
}

fs.writeFileSync('./components/Gauge.tsx', lines.join('\n'));
console.log('Done');
