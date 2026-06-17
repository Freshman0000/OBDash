const fs = require('fs');
const content = fs.readFileSync('./components/Gauge.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{rpm}')) {
    // The line before or the line itself might have the class
    if (lines[i].includes('className=')) {
      lines[i] = lines[i].replace('font-micro', 'font-lcd').replace('font-sans', 'font-lcd').replace('font-mono', 'font-lcd');
    } else if (i > 0 && lines[i-1].includes('className=')) {
      lines[i-1] = lines[i-1].replace('font-micro', 'font-lcd').replace('font-sans', 'font-lcd').replace('font-mono', 'font-lcd');
    }
  }
}

fs.writeFileSync('./components/Gauge.tsx', lines.join('\n'));
console.log('Done');
