const fs = require('fs');
const path = require('path');

const dir = './components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f.includes('Gauge'));

let fixes = 0;
for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Fix className="..." with ${} inside
  content = content.replace(/className="([^"]*\$\{theme\.fontFamily \|\| 'font-tech'\}[^"]*)"/g, 'className={`$1`}');
  
  // Fix the mainFontClass issue where it uses "${theme.fontFamily || 'font-tech'} font-black italic"
  content = content.replace(/"\$\{theme\.fontFamily \|\| 'font-tech'\} ([^"]+)"/g, '`${theme.fontFamily || \'font-tech\'} $1`');

  fs.writeFileSync(path.join(dir, file), content);
  fixes++;
}
console.log(`Applied fixes in ${fixes} files`);
