import * as fs from 'fs';

const file = 'components/DetailedGauges.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetIndex = content.indexOf('export const SynthwaveDriveGauge');
if (targetIndex !== -1) {
  content = content.substring(0, targetIndex);
  
  const additionalCode = `import { RacingHorizontalGauge } from './RacingHorizontalGauge';

export const SynthwaveDriveGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="OUTRUN OS" />;
export const MechWarriorHUDGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="MECH CORE" />;
export const LuxuryYachtGauge: React.FC<any> = (props) => <RacingHorizontalGauge {...props} customTitle="GRAND TOURING" />;
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
  fs.writeFileSync(file, content + additionalCode, 'utf8');
  console.log("Success");
} else {
  console.log("Not found");
}
