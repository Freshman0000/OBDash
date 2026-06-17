const fs = require('fs');
const path = require('path');

const dir = './components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f.includes('Gauge'));

let totalReplacements = 0;
for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Replace font-sans and font-bold with appropriate theme fonts or tech fonts
  // We'll replace generic fonts with aggressive 
  content = content.replace(/font-sans/g, '${theme.fontFamily || \'font-tech\'}');
  
  // Brighten things up (textures)
  content = content.replace(/opacity-10/g, 'opacity-30');
  content = content.replace(/opacity-20/g, 'opacity-40');
  content = content.replace(/opacity-5/g, 'opacity-20');
  content = content.replace(/bg-black\/50/g, 'bg-black/30');
  content = content.replace(/bg-black\/80/g, 'bg-black/50');
  // Make borders brighter
  content = content.replace(/border-white\/5/g, 'border-white/20');
  content = content.replace(/border-white\/10/g, 'border-white/30');
  content = content.replace(/border-white\/20/g, 'border-white/40');
  // Text brighter
  content = content.replace(/text-white\/30/g, 'text-white/60');
  content = content.replace(/text-white\/40/g, 'text-white/70');
  content = content.replace(/text-white\/50/g, 'text-white/80');

  fs.writeFileSync(path.join(dir, file), content);
  totalReplacements++;
}
console.log(`Updated brightness and generic fonts in ${totalReplacements} files`);
