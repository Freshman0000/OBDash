import * as fs from 'fs';

let content = fs.readFileSync('components/ModernEVGauge.tsx', 'utf8');
content = `import React from 'react';
import { GaugeProps } from './Gauge';
import { PremiumCircularGauge } from './PremiumCircularGauge';

export const ModernEVGauge: React.FC<GaugeProps> = (props) => {
  return <PremiumCircularGauge {...props} customTitle={props.theme.name} />;
};
`;
fs.writeFileSync('components/ModernEVGauge.tsx', content, 'utf8');

let replaceDetailed = fs.readFileSync('replace_all_detailed.ts', 'utf8');
replaceDetailed = replaceDetailed.replace(
  'export const LuxuryYachtGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="GRAND TOURING" />;',
  'export const LuxuryYachtGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="GRAND TOURING" />;'
);
fs.writeFileSync('replace_all_detailed.ts', replaceDetailed, 'utf8');
console.log("Updated ModernEVGauge and replace_all_detailed");
