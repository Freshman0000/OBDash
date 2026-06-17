const fs = require('fs');
const path = require('path');

const dir = './components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f.includes('Gauge') && f !== 'Gauge.tsx');

let replacements = 0;
for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');

  // Add more intense drop shadows and glows
  content = content.replace(/shadow-\[inset_0_20px_50px_rgba\(0,0,0,0\.9\),inset_0_-10px_20px_rgba\(0,0,0,0\.8\),0_10px_20px_rgba\(0,0,0,1\)\]/g, 'shadow-[inset_0_20px_60px_rgba(0,0,0,0.9),inset_0_-10px_20px_rgba(0,0,0,0.8),0_15px_30px_rgba(0,0,0,1)] ring-1 ring-white/10 ring-inset');
  
  // Add inner edge reflections
  content = content.replace(/className={`w-full h-full p-\[1\.5cqh\]/g, 'className={`w-full h-full p-[1.5cqh] after:absolute after:inset-0 after:rounded-[inherit] after:border-t-2 after:border-white/10 after:pointer-events-none');
  
  // Make borders look machined
  content = content.replace(/border-4 border-\[#121212\]/g, 'border-4 border-[#121212] border-t-[#222] border-b-[#050505]');
  
  // Brighten existing gradients for data elements slightly to pop more
  content = content.replace(/from-white\/10 to-transparent/g, 'from-white/20 to-transparent');
  content = content.replace(/opacity-50/g, 'opacity-60');
  content = content.replace(/opacity-60/g, 'opacity-75');

  if (content !== fs.readFileSync(path.join(dir, file), 'utf8')) {
     fs.writeFileSync(path.join(dir, file), content);
     replacements++;
  }
}

console.log(`Enhanced details in ${replacements} gauge components.`);
