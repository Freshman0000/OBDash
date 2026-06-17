
export interface CanBusMessage {
  id: string; // CAN ID in hex
  data: string; // Hex data string
  timestamp: number;
  count: number;
  isChanged: boolean;
}

export interface CanCommand {
  id: string;
  name: string;
  description: string;
  canId: string;
  data: string;
  category: 'WINDOWS' | 'CLIMATE' | 'STEERING' | 'LIGHTS' | 'OTHER';
}

export interface NavigationState {
  isNavigating: boolean;
  instruction: string;
  destinationName: string;
  distanceRemaining: string;
  timeRemaining: string;
  destination: { lat: number; lng: number } | null;
  upcomingManeuvers?: Array<{ instruction: string; distance: string }>;
  routeCoordinates?: [number, number][];
  mapStyleIndex?: number;
}

export interface WeatherDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}

export interface SavedDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface VehicleData {
  speed: number;
  rpm: number;
  coolantTemp: number;
  fuelLevel: number;
  voltage: number;
  throttlePos: number;
  engineLoad: number;
  gear: string;
  boost: number;
  oilTemp: number;
  oilPressure: number;
  odo: number;
  trip: number;
  intakeTemp: number;
  acceleration: number;
  fuelConsumption: number;
  warningLights: {
    checkEngine: boolean;
    oilPressure: boolean;
    battery: boolean;
    tpms: boolean;
    highBeam: boolean;
    parkingBrake: boolean;
    abs: boolean;
    traction: boolean;
    leftSignal: boolean;
    rightSignal: boolean;
  };
  tpms: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
}

export type AudioProfile = 
  | 'REFERENCE' 
  | 'VINTAGE_WARM' 
  | 'PUNCHY_90S' 
  | 'CRISP_HI_FI' 
  | 'STUDIO_FLAT' 
  | 'DEEP_BASS_ELITE' 
  | 'CLEAR_VOCAL_GOLD' 
  | 'TUBE_AMPLIFIER' 
  | 'CONCERT_HALL' 
  | 'BRIGHT_PRECISION'
  | 'DYNAMIC_LOUDNESS'
  | 'ANALOG_CLASSIC';

export type GPSResponsiveness = 'low' | 'medium' | 'high' | 'instant';

export type ThemeStyle = 'futuristic' | 'retro' | 'realistic' | 'minimalist' | 'performance' | 'luxury' | 'modern-premium' | 'tactical';
export type LayoutType = 'standard' | 'focused' | 'minimal' | 'grid' | 'asymmetric' | 'ultrawide';
export type TextureType = 'none' | 'carbon' | 'leather' | 'lcd' | 'metal' | 'graphite' | 'honeycomb' | 'machined' | 'polished-carbon' | 'forged-carbon' | 'brushed-aluminum' | 'brushed' | 'piano-black' | 'alcantara' | 'hex-grid' | 'circuit-board' | 'blueprint' | 'matrix-digital' | 'carbon-fibre' | 'stardust' | 'hexellence' | 'circuit' | 'aged-paper' | 'pixel' | 'cubes' | 'radar' | 'carbon-forged';

export interface EqualizerSettings {
  sensitivity: number;
  decay: number;
  fluidity: number;
  clarity: number;
  treble: number;
  bass: number;
  soundProfile: string;
}

export interface UserSettings {
  forceSimulation: boolean;
  highAccuracyGps: boolean;
  useGpsFallback: boolean;
  useGpsForSpeed: boolean;
  isSimulatingPids: boolean;
  showPidSimulationToggle: boolean;
}

export interface Contact {
  id: string;
  name: string;
  number: string;
  avatar?: string;
}

export interface Message {
  id: string;
  contactId: string;
  text: string;
  timestamp: number;
  isIncoming: boolean;
}

export interface CustomSkin {
  primaryColor: string;
  fontSizeLarge: number;
  fontSizeBottom: number;
  fontFamily: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  style: ThemeStyle;
  layout: LayoutType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  texture: TextureType;
  gaugeType: 'radial' | 'realistic' | 'retro-digital' | 'mustang-cluster' | 'haltech-race' | 'supercar-center' | 'ev-horizon' | 'sport-red' | 'minimal-dash' | 'kia-vision' | 'arc-horizon' | 's2k-legend' | 'sinco-tech' | 'ev-futuro' | 'racing-hud' | 'modern-perspective' | 'circular-tach' | 'analog-mix' | 'expert-grid' | 'hud-projection' | 'turbo-center' | 'f1-telemetry' | 'retro-7seg' | 'hyper-drag' | 'matrix-tach' | 'nismo-dash' | 'radial-outline' | 'vertical-stack' | 'drift-spec' | 'minimal-gauge' | 'race-bar' | 'm-track-v2' | 'rs-virtual' | 'amg-performance' | 'sti-core' | 'gt-legend' | 'mclaren-ultra' | 'svj-active' | 'scuderia-pro' | 'godzilla-r35' | 'lfa-concept' | 'jdm-legend' | 'bavarian-precision' | 'stuttgart-classic' | 'tokyo-night' | 'autobahn-cruiser' | 'digital-retro' | 'cyber-drift' | 'racing-red' | 'black-forest' | 'transparent-tech' | 'supra-mk4' | 'r34-vspec' | '911-gt3' | 'm3-comp' | 'nsx-r' | 'rx7-spirit' | 'lambo-rev' | 'ferrari-sf90' | 'bugatti-chi' | 'pagani-hua' | 'wican-pro-native' | 'hks-camp' | 'defi-advance' | 'mugen-rr' | 'trd-pro' | 'nismo-z' | 'alpina-b5' | 'brabus-900' | 'ruf-ctr' | 'techart-gt' | 'mansory-vane' | 'novitec-rosso' | 'matrix-overdrive' | 'stuttgart-rs-v3' | 'vfd-link' | 'inter-link-v2' | 'kia-vision-pro' | 'x-pro-adventure' | 'stealth-ghost' | 'cyber-neon-2088' | 'titanium-precision-x' | 'monza-corsa-gt' | 'luxury-alcantara-v2' | 'blueprint-v4' | 'forged-rs-elite' | 'retro-vfd-pro' | 'matrix-overdrive-v2' | 'stuttgart-rs-v4' | 'amg-track-v3' | 'mclaren-ultra-v2' | 'svj-active-v2' | 'scuderia-pro-v3' | 'godzilla-r35-v3' | 'lfa-concept-v3' | 'nismo-z-v2' | 'sti-core-v3' | 'neon-link-v3' | 'quantum-flux' | 'neural-link' | 'void-walker' | 'plasma-core' | 'gravity-well' | 'hyper-drive' | 'stellar-drift' | 'event-horizon' | 'singularity-core' | 'warp-speed' | 'omega-prime' | 'nebula-core' | 'zenith-horizon' | 'spectre-ghost' | 'pulse-overdrive' | 'titan-forge' | 'velocity-prime' | 'aurora-borealis' | 'dark-matter' | 'supernova-elite' | 'nebula-flux' | 'aero-precision' | 'quantum-core' | 'plasma-drive' | 'zenith-pro' | 'vortex-gt' | 'stellar-link' | 'nova-rs' | 'gravity-master' | 'hyperion-x' | string;
  showDetails: boolean;
  glowEffect: boolean;
  overlayEffect?: 'plastic' | 'glass' | 'none';
  backlitEnabled?: boolean;
  overlay?: boolean;
  backlit?: boolean;
}

export interface BackgroundShade {
  id: string;
  name: string;
  color: string;
}

export interface StereoTheme {
  id: string;
  name: string;
  style: 'segment-lcd' | 'vfd-80s' | 'hi-fi-90s' | 'dot-matrix' | 'pixel-art';
  barColor: string;
  peakColor: string;
  bgColor: string;
  segmentCount: number;
  glowIntensity: number;
  scanlineEffect?: boolean;
  dspProfile: AudioProfile;
  isLcd?: boolean;
  isPerformance?: boolean;
  useGradient?: boolean;
  doubleBars?: boolean;
  hardwareStyle?: 'nakamichi' | 'mcintosh' | 'alpine' | 'pioneer' | 'sony' | 'clarion' | 'kenwood' | 'denon' | 'generic-vfd' | 'generic-lcd' | 'winamp';
}
