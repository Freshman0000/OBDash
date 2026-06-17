const fs = require('fs');
let content = fs.readFileSync('components/Gauge.tsx', 'utf8');

// Find spans wrapping ResponsiveValue for speed
const speedRegex = /<span className="([^"]*)"([^>]*)>\s*<ResponsiveValue value=\{Math\.round\(speed \|\| 0\)\} theme=\{theme\} \/>\s*<\/span>/g;
const speedRegex2 = /<span className=\{`([^`]*)`\}([^>]*)>\s*<ResponsiveValue value=\{Math\.round\(speed \|\| 0\)\} theme=\{theme\} \/>\s*<\/span>/g;

let count = 0;
content = content.replace(speedRegex, (match, className, rest) => {
  count++;
  let newClassName = className.replace(/\bfont-lcd\b/g, '').replace(/\bfont-lcd-italic\b/g, '').replace(/\bfont-sans\b/g, '').replace(/\s+/g, ' ').trim();
  if (!newClassName.includes('font-micro')) newClassName += ' font-micro';
  return `<span className="${newClassName}" ${rest.trim()}>\n                    <ResponsiveValue value={Math.round(speed || 0)} theme={theme} />\n                  </span>`;
});

content = content.replace(speedRegex2, (match, className, rest) => {
  count++;
  let newClassName = className.replace(/\bfont-lcd\b/g, '').replace(/\bfont-lcd-italic\b/g, '').replace(/\bfont-sans\b/g, '').replace(/\s+/g, ' ').replace(/\$\{theme\.fontFamily \|\| ''\}/g, '').trim();
  if (!newClassName.includes('font-micro')) newClassName += ' font-micro';
  return `<span className="${newClassName}" ${rest.trim()}>\n                    <ResponsiveValue value={Math.round(speed || 0)} theme={theme} />\n                  </span>`;
});

fs.writeFileSync('components/Gauge.tsx', content);
console.log(`Updated ${count} speed instances in Gauge.tsx`);
