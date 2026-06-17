const fs = require('fs');

const files = [
  'components/CarbonSweepGauge.tsx',
  'components/PremiumCircularGauge.tsx',
  'components/RacingHorizontalGauge.tsx',
  'components/PerspectiveClusterGauge.tsx',
  'components/QuasarGauge.tsx',
  'components/FuturisticGraphGauge.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // CarbonSweepGauge.tsx has a specific block we can simplify
    content = content.replace(
      /\{\s*\/\*\s*Deep Carbon Fiber Background with Texture\s*\*\/\s*\}([\s\S]*?)\{\s*\/\*\s*Structural Mounting\s*/,
      `{/* Refined Background Textures */}
      {theme.texture === 'polished-carbon' || theme.texture === 'forged-carbon' ? (
         <div className="absolute inset-0 texture-carbon opacity-60 mix-blend-screen" />
      ) : theme.texture === 'hex-grid' ? (
         <div className="absolute inset-0 opacity-80 texture-hex mix-blend-screen" />
      ) : theme.texture === 'brushed-aluminum' || theme.texture === 'brushed' ? (
         <div className="absolute inset-0 texture-brushed opacity-60 mix-blend-screen" />
      ) : theme.texture === 'machined' ? (
         <div className="absolute inset-0 opacity-100 brightness-150 mix-blend-screen bg-[repeating-radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0px,rgba(255,255,255,0.1)_3px,transparent_3px,transparent_8px)]" />
      ) : (
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)] mix-blend-screen" />
      )}
      {/* Structural Mounting `
    );

    // PremiumCircularGauge.tsx has an getBgPattern() function
    content = content.replace(
      /const getBgPattern = \(\) => \{[\s\S]*?return "none";\n  \};/,
      `const getBgClass = () => {
    switch(theme.texture) {
      case 'carbon-forged': 
      case 'carbon-weave':
      case 'polished-carbon': return "texture-carbon";
      case 'hex-grid': return "texture-hex";
      case 'brushed': return "texture-brushed";
      default: return "";
    }
  };`
    );
    
    content = content.replace(
      /style=\{\{ \.\.\.customStyle,\s*(?:backgroundImage:\s*getBgPattern\(\),)?\n?\s*(?:backgroundColor:\s*bg,\n?)?\s*\}\}/g,
      `style={{ ...customStyle, backgroundColor: bg }}`
    );
    
    content = content.replace(
      /className=\{(["`])[\s\S]*?relative overflow-hidden/,
      (match, p1) => {
         return match.replace(/relative overflow-hidden/, `relative overflow-hidden \${getBgClass()}`);
      }
    );

    // RacingHorizontalGauge.tsx
    content = content.replace(
      /const getBgPattern = \(\) => \{[\s\S]*?return "none";\n  \};/,
      `const getBgClass = () => {
    switch (theme.texture) {
      case "carbon-forged":
      case "carbon-weave":
        return "texture-carbon";
      case "hex-grid":
        return "texture-hex";
      case "brushed":
        return "texture-brushed";
      default:
        return "";
    }
  };`
    );

    fs.writeFileSync(f, content);
  }
});
console.log("Done");
