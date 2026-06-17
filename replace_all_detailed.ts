import * as fs from 'fs';

const file = 'components/DetailedGauges.tsx';

const newContent = `import React from 'react';
import { GaugeProps } from './Gauge';
import { RacingHorizontalGauge } from './RacingHorizontalGauge';
import { PremiumCircularGauge } from './PremiumCircularGauge';

export const NeonRacerGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="NEON RACER OS" />;
export const UniversalJDMGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="JDM LEGEND SPEC" />;
export const Cyberpunk2077Gauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="NIGHT CITY OS" />;
export const SteampunkGearsGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="STEAMPOWER TELEMETRY" />;
export const HolographicProjGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="HOLOGRAPHIC CORE" />;
export const RetroArcadeGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="RETRO ARCADE DATA" />;
export const NeonNightsGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="NEON NIGHTS HUB" />;
export const TacticalOpsGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="TACTICAL OPS SYS" />;
export const MinimalistDashGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="MINIMALIST M-SPEC" />;
export const FuturisticHUDGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="FUTURISTIC HUD" />;
export const BlueprintV4Gauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="BLUEPRINT MASTER" />;

// The next 10 are the horizontal gauges
export const SynthwaveDriveGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="OUTRUN OS" />;
export const MechWarriorHUDGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="MECH CORE" />;
export const LuxuryYachtGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="GRAND TOURING" />;
export const AlienTechGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="XENO CORE" />;
export const RetroVFDGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="VFD TELEMETRY" />;
export const DeepSpaceGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="ORBITAL HUD" />;
export const CyberNinjaGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="RONIN OS" />;
export const MuscleCarClassicGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="V8 MUSCLE" />;
export const QuantumFluxGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="QUANTUM STATE" />;
export const NeonGridGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="GRID RUNNER" />;

export const DETAILED_SKINS = [
  NeonRacerGauge,
  UniversalJDMGauge,
  Cyberpunk2077Gauge,
  SteampunkGearsGauge,
  HolographicProjGauge,
  RetroArcadeGauge,
  NeonNightsGauge,
  TacticalOpsGauge,
  MinimalistDashGauge,
  FuturisticHUDGauge,
  BlueprintV4Gauge,
  SynthwaveDriveGauge,
  MechWarriorHUDGauge,
  LuxuryYachtGauge,
  AlienTechGauge,
  RetroVFDGauge,
  DeepSpaceGauge,
  CyberNinjaGauge,
  MuscleCarClassicGauge,
  QuantumFluxGauge,
  NeonGridGauge
];
`;

fs.writeFileSync(file, newContent, 'utf8');
console.log("Replaced DetailedGauges.tsx perfectly.");
