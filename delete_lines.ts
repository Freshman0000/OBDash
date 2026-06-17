import fs from 'fs';
const file = 'components/Gauge.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Ranges to delete (0-indexed)
const ranges = [
  [203, 350],
  [503, 1693],
  [1835, 1898],
  [1963, 2025],
  [2671, 3803]
];

const linesToKeep = [];
for (let i = 0; i < lines.length; i++) {
  let keep = true;
  for (const [start, end] of ranges) {
    if (i >= start && i <= end) {
      keep = false;
      break;
    }
  }
  if (keep) {
    linesToKeep.push(lines[i]);
  }
}

fs.writeFileSync(file, linesToKeep.join('\n'));
