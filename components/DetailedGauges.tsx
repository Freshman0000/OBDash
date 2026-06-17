import React from 'react';
import { GaugeProps } from './Gauge';
import { RacingHorizontalGauge } from './RacingHorizontalGauge';
import { PremiumCircularGauge } from './PremiumCircularGauge';
import { FuturisticGraphGauge } from './FuturisticGraphGauge';
import { PerspectiveClusterGauge } from './PerspectiveClusterGauge';
import { F1LCDGauge } from './F1LCDGauge';
import { DigitalDashRetro } from './DigitalDashRetro';

export const NeonRacerGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="NEON RACER OS" />;
export const UniversalJDMGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="JDM LEGEND SPEC" />;
export const Cyberpunk2077Gauge: React.FC<any> = (props) => <PerspectiveClusterGauge {...props} customTitle="NIGHT CITY OS" />;
export const SteampunkGearsGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="STEAMPOWER TELEMETRY" />;
export const HolographicProjGauge: React.FC<any> = (props) => <PerspectiveClusterGauge {...props} customTitle="HOLOGRAPHIC CORE" />;
export const RetroArcadeGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="RETRO ARCADE DATA" />;
export const NeonNightsGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="NEON NIGHTS HUB" />;
export const TacticalOpsGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="TACTICAL OPS SYS" />;
export const MinimalistDashGauge: React.FC<any> = (props) => <PremiumCircularGauge {...props} customTitle="MINIMALIST M-SPEC" />;
export const FuturisticHUDGauge: React.FC<any> = (props) => <FuturisticGraphGauge {...props} customTitle="FUTURISTIC HUD" />;
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

export const DETAILED_SKINS: Record<string, React.FC<any>> = {
  'neon-racer': NeonRacerGauge,
  'universal-jdm-legend': UniversalJDMGauge,
  'cyberpunk-2077': Cyberpunk2077Gauge,
  'steampunk-gears': SteampunkGearsGauge,
  'holographic-proj': HolographicProjGauge,
  'retro-arcade': RetroArcadeGauge,
  'neon-nights': NeonNightsGauge,
  'tactical-ops': TacticalOpsGauge,
  'minimalist-dash': MinimalistDashGauge,
  'futuristic-hud': FuturisticHUDGauge,
  'blueprint-v4-master': BlueprintV4Gauge,
  'neon-synthwave-1984': SynthwaveDriveGauge,
  'mech-warrior': MechWarriorHUDGauge,
  'luxury-alcantara-v2': LuxuryYachtGauge,
  'alien-tech': AlienTechGauge,
  'retro-vfd': RetroVFDGauge,
  'deep-space': DeepSpaceGauge,
  'cyber-ninja': CyberNinjaGauge,
  'muscle-car': MuscleCarClassicGauge,
  'quantum-flux': QuantumFluxGauge,
  'neon-grid': NeonGridGauge,
  'perspective-tunnel': PerspectiveClusterGauge,
  'ev-modern': MinimalistDashGauge, // mapping 
  'stealth-ghost': SynthwaveDriveGauge, // mapping
  'gravity-master': FuturisticHUDGauge, // mapping
  'cyber-neon-2088': FuturisticHUDGauge, // mapping
  'f1-lcd-tech-blue-green': F1LCDGauge,
  'f1-lcd-tech-orange': F1LCDGauge,
  'f1-lcd-tech-classic': F1LCDGauge,
  'f1-lcd-tint-orange': F1LCDGauge,
  'f1-lcd-tint-blue': F1LCDGauge,
  'f1-lcd-tint-purple': F1LCDGauge,
  'f1-lcd-neon-blue': F1LCDGauge,
  'f1-lcd-neon-orange': F1LCDGauge,
  'f1-lcd-neon-purple': F1LCDGauge,
  'digital-retro-blue-green': DigitalDashRetro,
  'digital-retro-orange': DigitalDashRetro,
};
