const fs = require('fs');
const path = './components/Gauge.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(line => line.includes('const UniversalJDMGauge: React.FC<GaugeProps> = React.memo(({ value, speed, gear, data, theme, backlit = false }) => {'));
const endIndex = lines.findIndex(line => line.includes('const GAUGE_SKINS = ['));

if (startIndex !== -1 && endIndex !== -1) {
  const newLines = [
    ...lines.slice(0, startIndex),
    ...lines.slice(endIndex)
  ];
  fs.writeFileSync(path, newLines.join('\n'));
  console.log('Successfully truncated Gauge.tsx');
} else {
  console.log('Could not find start or end index', startIndex, endIndex);
}
