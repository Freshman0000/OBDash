const fs = require('fs');
let content = fs.readFileSync('components/Gauge.tsx', 'utf8');

const rpmRegex = /<span className="([^"]*)"([^>]*)>\s*<ResponsiveValue value=\{Math\.round\(value \* 1000\)\} isRpm=\{true\} theme=\{theme\} \/>\s*<\/span>/g;
const rpmRegex2 = /<span className=\{`([^`]*)`\}([^>]*)>\s*<ResponsiveValue value=\{Math\.round\(value \* 1000\)\} isRpm=\{true\} theme=\{theme\} \/>\s*<\/span>/g;

let count = 0;
content = content.replace(rpmRegex, (match, className, rest) => {
  count++;
  let newClassName = className.replace(/\bfont-micro\b/g, '').replace(/\bfont-sans\b/g, '').replace(/\bfont-lcd\b/g, '').replace(/\bfont-lcd-italic\b/g, '').replace(/\s+/g, ' ').trim();
  return `<span className={\`${newClassName} \${theme.fontFamily || ''}\`} ${rest.trim()}>\n                    <ResponsiveValue value={Math.round(value * 1000)} isRpm={true} theme={theme} />\n                  </span>`;
});

content = content.replace(rpmRegex2, (match, className, rest) => {
  count++;
  let newClassName = className.replace(/\bfont-micro\b/g, '').replace(/\bfont-sans\b/g, '').replace(/\bfont-lcd\b/g, '').replace(/\bfont-lcd-italic\b/g, '').replace(/\s+/g, ' ').replace(/\$\{theme\.fontFamily \|\| ''\}/g, '').trim();
  return `<span className={\`${newClassName} \${theme.fontFamily || ''}\`} ${rest.trim()}>\n                    <ResponsiveValue value={Math.round(value * 1000)} isRpm={true} theme={theme} />\n                  </span>`;
});

fs.writeFileSync('components/Gauge.tsx', content);
console.log(`Updated ${count} rpm instances in Gauge.tsx`);
