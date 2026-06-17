const fs = require('fs');

const files = [
  'FuturisticGraphGauge.tsx',
  'CarbonSweepGauge.tsx',
  'ModernEVGauge.tsx',
  'PremiumCircularGauge.tsx',
  'RacingHorizontalGauge.tsx',
  'QuasarGauge.tsx',
  'PerspectiveClusterGauge.tsx',
];

files.forEach(f => {
  let content = fs.readFileSync('components/' + f, 'utf8');
  if (!content.includes('import { Ticker }')) {
    content = content.replace("import React", "import { Ticker } from './Ticker';\nimport React");
    
    // Add navState to destructured props
    content = content.replace(/data,\s*theme/g, "data, navState, theme");
    content = content.replace(/theme,\s*data/g, "theme, data, navState");
    
    // Some might not match precisely, let's just use regex for the component definition
    content = content.replace(/({[^}]*?)(theme)([^}]*?})/, (match, p1, p2, p3) => {
        if (!match.includes('navState')) {
             return p1 + p2 + ", navState" + p3;
        }
        return match;
    });

    // Attempt to inject at the end of the return statement
    const closingTagIndex = content.lastIndexOf('</div');
    if (closingTagIndex !== -1) {
        const before = content.slice(0, closingTagIndex);
        const after = content.slice(closingTagIndex);
        content = before + `\n<div className="absolute inset-x-0 bottom-0 z-[100] h-[3cqh]"><Ticker data={data} navState={navState} theme={theme} className="w-full h-full" /></div>\n` + after;
        fs.writeFileSync('components/' + f, content);
        console.log("Updated " + f);
    }
  }
});
