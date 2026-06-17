const fs = require('fs');
let content = fs.readFileSync('components/Gauge.tsx', 'utf8');

const regex = /<ResponsiveValue value=\{Math\.round\((value \* 1000|speed \|\| 0)\)\} \/>/g;

let count = 0;
content = content.replace(regex, (match, val) => {
  count++;
  if (val === 'value * 1000') {
    return `<ResponsiveValue value={Math.round(value * 1000)} isRpm={true} theme={theme} />`;
  } else {
    return `<ResponsiveValue value={Math.round(speed || 0)} theme={theme} />`;
  }
});

fs.writeFileSync('components/Gauge.tsx', content);
console.log(`Updated ${count} instances of ResponsiveValue in Gauge.tsx`);
