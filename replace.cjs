const fs = require('fs');
let data = fs.readFileSync('components/Gauge.tsx', 'utf8');
data = data.replace(/font-micro("\s*>\s*<ResponsiveValue value=\{Math\.round\(speed \|\| 0\)\})/g, 'font-mxsquad$1');
fs.writeFileSync('components/Gauge.tsx', data);
