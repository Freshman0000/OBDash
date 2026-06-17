const fs = require('fs');
let content = fs.readFileSync('constants.ts', 'utf8');

content = content.replace(/fontFamily:\s*'font-tech'/g, "fontFamily: 'font-lcd'");
content = content.replace(/fontFamily:\s*'font-digital'/g, "fontFamily: 'font-lcd-italic'");
content = content.replace(/fontFamily:\s*'font-mono'/g, "fontFamily: 'font-lcd'");
content = content.replace(/fontFamily:\s*'font-sans'/g, "fontFamily: 'font-lcd'");
content = content.replace(/fontFamily:\s*'font-micro'/g, "fontFamily: 'font-lcd'");

fs.writeFileSync('constants.ts', content);
console.log('Updated fonts in constants.ts');
