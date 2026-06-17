const fs = require('fs');

let content = fs.readFileSync('constants.ts', 'utf-8');

// replace all glowEffect: true to glowEffect: false in THEMES 
content = content.replace(/glowEffect: true/g, 'glowEffect: false');

// some cool 3-color primary palettes with purple
const palettes = [
  { primaryColor: '#8b5cf6', secondaryColor: '#1e0729', accentColor: '#0ea5e9' }, // Purple, Dark Purple, Cyan
  { primaryColor: '#d946ef', secondaryColor: '#000000', accentColor: '#fbbf24' }, // Fuchsia, Black, Amber
  { primaryColor: '#a855f7', secondaryColor: '#050505', accentColor: '#10b981' }, // Purple, Black, Emerald
  { primaryColor: '#c084fc', secondaryColor: '#1a0b2e', accentColor: '#f43f5e' }, // Light Purple, Dark Purple, Rose
  { primaryColor: '#9333ea', secondaryColor: '#0A0A0E', accentColor: '#f59e0b' }, // Royal Purple, Deep Dark, Amber
  { primaryColor: '#f0abfc', secondaryColor: '#000510', accentColor: '#38bdf8' }, // Pink/Purple, Deep Blue, Light Blue
  { primaryColor: '#6366f1', secondaryColor: '#111111', accentColor: '#d946ef' }, // Indigo, Black, Fuchsia
];

let pIndex = 0;

content = content.replace(/primaryColor: '#[^']+', secondaryColor: '#[^']+', accentColor: '#[^']+'/g, (match) => {
  const p = palettes[pIndex % palettes.length];
  pIndex++;
  return `primaryColor: '${p.primaryColor}', secondaryColor: '${p.secondaryColor}', accentColor: '${p.accentColor}'`;
});

fs.writeFileSync('constants.ts', content, 'utf-8');
console.log('constants.ts updated');
