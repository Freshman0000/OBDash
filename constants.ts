
import { ThemeConfig, StereoTheme, BackgroundShade, AudioProfile } from './types';

export const BACKGROUND_SHADES: BackgroundShade[] = [
  { id: 'sh1', name: 'OBSIDIAN_GRAY', color: '#0A0A0A' },
  { id: 'sh2', name: 'DEEP_CHARCOAL', color: '#141414' },
  { id: 'sh3', name: 'MIDNIGHT_PURPLE', color: '#12051A' },
  { id: 'sh4', name: 'SLATE_STONE', color: '#1F1F24' },
  { id: 'sh5', name: 'ABYSSAL_VIOLET', color: '#0E0414' },
  { id: 'sh6', name: 'ROYAL_AMETHYST', color: '#1B0B2E' },
  { id: 'sh7', name: 'GRAVITY_GRAY', color: '#262626' },
  { id: 'sh8', name: 'NEBULA_DEEP', color: '#2A0E3D' },
  { id: 'sh9', name: 'STEEL_PURPLE', color: '#251B2F' },
  { id: 'sh10', name: 'IRON_CLAD', color: '#333333' },
  { id: 'sh11', name: 'VOID_INDIGO', color: '#0D0D1F' },
  { id: 'sh12', name: 'PURE_BLACK', color: '#000000' },
];

const ROYAL_PURPLE = '#7851A9';

export const HEADER_SHADES: BackgroundShade[] = [
  { id: 'h1', name: 'CARBON_GREY', color: '#1a1a1a' },
  { id: 'h2', name: 'SLATE_GREY', color: '#2d3748' },
  { id: 'h3', name: 'ROYAL_PURPLE', color: '#44337a' },
  { id: 'h4', name: 'DEEP_INDIGO', color: '#2a4365' },
  { id: 'h5', name: 'MIDNIGHT_PLUM', color: '#322659' },
  { id: 'h6', name: 'GUNMETAL', color: '#2d3436' },
  { id: 'h7', name: 'OBSIDIAN', color: '#000000' },
  { id: 'h8', name: 'TITANIUM', color: '#2f3542' },
];

export const THEMES: ThemeConfig[] = [
  { id: 'f1-lcd-racing-bw', name: 'FORMULA 1 MONO', style: 'performance', layout: 'focused', primaryColor: '#ffffff', secondaryColor: '#121212', accentColor: '#a3a3a3', backgroundColor: '#000000', fontFamily: 'font-lcd', texture: 'forged-carbon', gaugeType: 'mechanic', showDetails: true, glowEffect: false },
  { id: 'f1-lcd-racing', name: 'FORMULA 1 LCD', style: 'performance', layout: 'focused', primaryColor: '#8b5cf6', secondaryColor: '#1e0729', accentColor: '#0ea5e9', backgroundColor: '#050505', fontFamily: 'font-lcd', texture: 'forged-carbon', gaugeType: 'f1-lcd-tech-classic', showDetails: true, glowEffect: false },
  { id: 'f1-lcd-tech-blue-green', name: 'F1 LCD TECH GREEN', style: 'performance', layout: 'focused', primaryColor: '#4ade80', secondaryColor: '#061a16', accentColor: '#39ff14', backgroundColor: '#030a08', fontFamily: 'font-lcd', texture: 'carbon', gaugeType: 'f1-lcd-tech-blue-green', showDetails: true, glowEffect: true },
  { id: 'f1-lcd-tech-orange', name: 'F1 LCD TECH ORANGE', style: 'performance', layout: 'focused', primaryColor: '#f97316', secondaryColor: '#1a0d05', accentColor: '#ffaa00', backgroundColor: '#0a0502', fontFamily: 'font-lcd', texture: 'forged-carbon', gaugeType: 'f1-lcd-tech-orange', showDetails: true, glowEffect: true },
  { id: 'f1-lcd-tint-orange', name: 'F1 LCD ORANGE TINT', style: 'performance', layout: 'focused', primaryColor: '#f97316', secondaryColor: '#1a0d05', accentColor: '#ffaa00', backgroundColor: '#000000', fontFamily: 'font-lcd', texture: 'carbon', gaugeType: 'f1-lcd-tint-orange', showDetails: true, glowEffect: false },
  { id: 'f1-lcd-tint-blue', name: 'F1 LCD BLUE TINT', style: 'performance', layout: 'focused', primaryColor: '#38bdf8', secondaryColor: '#081a2e', accentColor: '#0ea5e9', backgroundColor: '#000000', fontFamily: 'font-lcd', texture: 'carbon', gaugeType: 'f1-lcd-tint-blue', showDetails: true, glowEffect: false },
  { id: 'f1-lcd-tint-purple', name: 'F1 LCD PURPLE TINT', style: 'performance', layout: 'focused', primaryColor: '#a855f7', secondaryColor: '#1a0b2e', accentColor: '#d946ef', backgroundColor: '#000000', fontFamily: 'font-lcd', texture: 'carbon', gaugeType: 'f1-lcd-tint-purple', showDetails: true, glowEffect: false },
  { id: 'f1-lcd-neon-blue', name: 'F1 LCD NEON BLUE', style: 'performance', layout: 'focused', primaryColor: '#00f0ff', secondaryColor: '#040d1a', accentColor: '#38bdf8', backgroundColor: '#050505', fontFamily: 'font-lcd', texture: 'forged-carbon', gaugeType: 'f1-lcd-neon-blue', showDetails: true, glowEffect: true },
  { id: 'f1-lcd-neon-orange', name: 'F1 LCD NEON ORANGE', style: 'performance', layout: 'focused', primaryColor: '#f97316', secondaryColor: '#1a0a00', accentColor: '#ffaa00', backgroundColor: '#050505', fontFamily: 'font-lcd', texture: 'forged-carbon', gaugeType: 'f1-lcd-neon-orange', showDetails: true, glowEffect: true },
  { id: 'f1-lcd-neon-purple', name: 'F1 LCD NEON PURPLE', style: 'performance', layout: 'focused', primaryColor: '#d946ef', secondaryColor: '#12021c', accentColor: '#c084fc', backgroundColor: '#050505', fontFamily: 'font-lcd', texture: 'forged-carbon', gaugeType: 'f1-lcd-neon-purple', showDetails: true, glowEffect: true },
  { id: 'digital-retro-blue-green', name: 'DIGITAL DASH RETRO B/G', style: 'retro', layout: 'focused', primaryColor: '#39ff14', secondaryColor: '#002200', accentColor: '#00ffff', backgroundColor: '#000000', fontFamily: 'font-lcd', texture: 'brushed', gaugeType: 'digital-retro-blue-green', showDetails: true, glowEffect: true },
  { id: 'digital-retro-orange', name: 'DIGITAL DASH RETRO ORANGE', style: 'retro', layout: 'focused', primaryColor: '#ff9900', secondaryColor: '#221100', accentColor: '#ffff00', backgroundColor: '#000000', fontFamily: 'font-lcd', texture: 'brushed', gaugeType: 'digital-retro-orange', showDetails: true, glowEffect: true },
  // 1. Perspective Tunnel Effect
  { id: 'perspective-tunnel', name: 'PERSPECTIVE_X_TUNNEL', style: 'futuristic', layout: 'ultrawide', primaryColor: '#d946ef', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#050505', fontFamily: 'font-lcd-italic', texture: 'polished-carbon', gaugeType: 'perspective-tunnel', showDetails: true, glowEffect: false },
  
  // 2. Neon Racer Circular
  { id: 'neon-racer', name: 'NEON_OS_MK1', style: 'futuristic', layout: 'standard', primaryColor: '#39FF14', secondaryColor: '#050505', accentColor: '#10b981', backgroundColor: '#020202', fontFamily: 'font-tech', texture: 'carbon', gaugeType: 'neon-racer', showDetails: true, glowEffect: false },
  
  // 3. Realistic JDM
  { id: 'universal-jdm-legend', name: 'JDM_LEGEND_SPEC', style: 'performance', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#1a0b2e', accentColor: '#f43f5e', backgroundColor: '#0a0a0a', fontFamily: 'font-tech', texture: 'machined', gaugeType: 'universal-jdm-legend', showDetails: true, glowEffect: false },
  
  // 4. Night City / Cyberpunk (Perspective)
  { id: 'cyberpunk-2077', name: 'NIGHT_CITY_OS', style: 'futuristic', layout: 'grid', primaryColor: '#6d28d9', secondaryColor: '#0A0A0E', accentColor: '#f59e0b', backgroundColor: '#050505', fontFamily: 'font-tech', texture: 'circuit', gaugeType: 'cyberpunk-2077', showDetails: true, glowEffect: false },
  
  // 5. Classic Luxury
  { id: 'elegance-minimal', name: 'GRAND_TOURING_V8', style: 'luxury', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#000510', accentColor: '#38bdf8', backgroundColor: '#080808', fontFamily: 'font-orbitron', texture: 'alcantara', gaugeType: 'luxury-alcantara-v2', showDetails: true, glowEffect: false },
  
  // 6. Futuristic Graph HUD (Graph)
  { id: 'futuristic-hud', name: 'FUTURISTIC_HUD_V2', style: 'futuristic', layout: 'standard', primaryColor: '#6366f1', secondaryColor: '#111111', accentColor: '#d946ef', backgroundColor: '#000000', fontFamily: 'font-tech', texture: 'cubes', gaugeType: 'futuristic-hud', showDetails: true, glowEffect: false },

  // 7. Horizontal Synthwave
  { id: 'neon-synthwave-1984', name: 'OUTRUN_DRIVE_1984', style: 'retro', layout: 'ultrawide', primaryColor: '#6d28d9', secondaryColor: '#1e0729', accentColor: '#0ea5e9', backgroundColor: '#0f0214', fontFamily: 'font-lcd-italic', texture: 'hex-grid', gaugeType: 'neon-synthwave-1984', showDetails: true, glowEffect: false },

  // 8. Minimalist EV
  { id: 'ev-modern-vision', name: 'EV_VISION_PRO', style: 'futuristic', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#050505', fontFamily: 'font-orbitron', texture: 'none', gaugeType: 'ev-modern', showDetails: true, glowEffect: false },

  // 9. Stealth Ghost (Horizontal)
  { id: 'stealth-ghost', name: 'STEALTH_GHOST_X', style: 'minimalist', layout: 'focused', primaryColor: '#39FF14', secondaryColor: '#050505', accentColor: '#10b981', backgroundColor: '#010101', fontFamily: 'font-lcd-italic', texture: 'piano-black', gaugeType: 'stealth-ghost', showDetails: true, glowEffect: false },

  // 10. Blueprint Tactical (Graph)
  { id: 'blueprint-v4-master', name: 'BLUEPRINT_MASTER', style: 'minimalist', layout: 'grid', primaryColor: '#7c3aed', secondaryColor: '#1a0b2e', accentColor: '#f43f5e', backgroundColor: '#00050f', fontFamily: 'font-tech', texture: 'blueprint', gaugeType: 'blueprint-v4-master', showDetails: true, glowEffect: false },

  // 11. Holographic Projection
  { id: 'holographic-proj', name: 'HOLO_NAV_CORE', style: 'futuristic', layout: 'standard', primaryColor: '#6d28d9', secondaryColor: '#0A0A0E', accentColor: '#f59e0b', backgroundColor: '#020005', fontFamily: 'font-tech', texture: 'stardust', gaugeType: 'holographic-proj', showDetails: true, glowEffect: false },

  // 12. Carbon Sweep Performance
  { id: 'forged-rs-elite', name: 'CARBON_RS_TRACK', style: 'performance', layout: 'ultrawide', primaryColor: '#7c3aed', secondaryColor: '#000510', accentColor: '#38bdf8', backgroundColor: '#000000', fontFamily: 'font-lcd-italic', texture: 'forged-carbon', gaugeType: 'forged-rs-elite', showDetails: true, glowEffect: false },

  // 13. Gravity Master Tactial (Graph)
  { id: 'gravity-master', name: 'GRAVITY_MASTER_G', style: 'futuristic', layout: 'focused', primaryColor: '#6366f1', secondaryColor: '#111111', accentColor: '#d946ef', backgroundColor: '#020202', fontFamily: 'font-lcd-italic', texture: 'carbon-forged', gaugeType: 'gravity-master', showDetails: true, glowEffect: false },

  // 14. Fighter HUD (Tactical)
  { id: 'fighter-jet', name: 'RAPTOR_HUD_V9', style: 'futuristic', layout: 'focused', primaryColor: '#6d28d9', secondaryColor: '#1e0729', accentColor: '#0ea5e9', backgroundColor: '#000500', fontFamily: 'font-bebas', texture: 'radar', gaugeType: 'fighter-jet', showDetails: true, glowEffect: false },

  // 15. Cyber Neon 2088 (Graph)
  { id: 'cyber-neon-2088', name: 'CYBER_NEON_2088', style: 'futuristic', layout: 'asymmetric', primaryColor: '#7c3aed', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#050010', fontFamily: 'font-lcd-italic', texture: 'circuit', gaugeType: 'cyber-neon-2088', showDetails: true, glowEffect: false },

  // 16. Tactical Ops (Tactical)
  { id: 'tactical-ops', name: 'TACTICAL_OPS_CMD', style: 'performance', layout: 'focused', primaryColor: '#39FF14', secondaryColor: '#050505', accentColor: '#10b981', backgroundColor: '#0A0500', fontFamily: 'font-bebas', texture: 'machined', gaugeType: 'tactical-ops', showDetails: true, glowEffect: false },

  // 17. Steampunk Gears
  { id: 'steampunk-gears', name: 'STEAMPOWER TELEMETRY', style: 'retro', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#1a0b2e', accentColor: '#f43f5e', backgroundColor: '#1c1917', fontFamily: 'font-serif', texture: 'machined', gaugeType: 'steampunk-gears', showDetails: true, glowEffect: false },

  // 18. Retro Arcade
  { id: 'retro-arcade', name: 'RETRO ARCADE DATA', style: 'retro', layout: 'standard', primaryColor: '#6d28d9', secondaryColor: '#0A0A0E', accentColor: '#f59e0b', backgroundColor: '#09090b', fontFamily: 'font-tech', texture: 'hex-grid', gaugeType: 'retro-arcade', showDetails: true, glowEffect: false },

  // 19. Neon Nights
  { id: 'neon-nights', name: 'NEON NIGHTS HUB', style: 'futuristic', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#000510', accentColor: '#38bdf8', backgroundColor: '#020617', fontFamily: 'font-orbitron', texture: 'circuit', gaugeType: 'neon-nights', showDetails: true, glowEffect: false },

  // 20. Mech Warrior
  { id: 'mech-warrior', name: 'MECH CORE', style: 'performance', layout: 'ultrawide', primaryColor: '#6366f1', secondaryColor: '#111111', accentColor: '#d946ef', backgroundColor: '#0a0a0a', fontFamily: 'font-bebas', texture: 'forged-carbon', gaugeType: 'mech-warrior', showDetails: true, glowEffect: false },

  // 21. Alien Tech
  { id: 'alien-tech', name: 'XENO CORE', style: 'futuristic', layout: 'ultrawide', primaryColor: '#6d28d9', secondaryColor: '#1e0729', accentColor: '#0ea5e9', backgroundColor: '#022c22', fontFamily: 'font-tech', texture: 'stardust', gaugeType: 'alien-tech', showDetails: true, glowEffect: false },

  // 22. Deep Space
  { id: 'deep-space', name: 'ORBITAL HUD', style: 'minimalist', layout: 'ultrawide', primaryColor: '#7c3aed', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#020617', fontFamily: 'font-orbitron', texture: 'none', gaugeType: 'deep-space', showDetails: true, glowEffect: false },

  // 23. Muscle Car
  { id: 'muscle-car', name: 'V8 MUSCLE', style: 'luxury', layout: 'ultrawide', primaryColor: '#39FF14', secondaryColor: '#050505', accentColor: '#10b981', backgroundColor: '#000000', fontFamily: 'font-orbitron', texture: 'alcantara', gaugeType: 'muscle-car', showDetails: true, glowEffect: false },

  // 24. Quantum Flux
  { id: 'quantum-flux', name: 'QUANTUM STATE', style: 'futuristic', layout: 'ultrawide', primaryColor: '#7c3aed', secondaryColor: '#1a0b2e', accentColor: '#f43f5e', backgroundColor: '#0f172a', fontFamily: 'font-lcd-italic', texture: 'hex-grid', gaugeType: 'quantum-flux', showDetails: true, glowEffect: false },

  // 25. Neon Grid
  { id: 'neon-grid', name: 'GRID RUNNER', style: 'futuristic', layout: 'focused', primaryColor: '#6d28d9', secondaryColor: '#0A0A0E', accentColor: '#f59e0b', backgroundColor: '#000000', fontFamily: 'font-tech', texture: 'circuit', gaugeType: 'neon-grid', showDetails: true, glowEffect: false },

  // 26. Pure Racing V8
  { id: 'pure-racing-v8', name: 'PURE_RACING_V8', style: 'performance', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#000510', accentColor: '#38bdf8', backgroundColor: '#000000', fontFamily: 'font-inter', texture: 'carbon', gaugeType: 'universal-jdm-legend', showDetails: true, glowEffect: false },
  
  // 27. Synthwave Sunset
  { id: 'synthwave-sunset', name: 'MIAMI_SUNSET_1984', style: 'retro', layout: 'ultrawide', primaryColor: '#6366f1', secondaryColor: '#111111', accentColor: '#d946ef', backgroundColor: '#11001c', fontFamily: 'font-lcd-italic', texture: 'hex-grid', gaugeType: 'neon-synthwave-1984', showDetails: true, glowEffect: false },
  
  // 28. Rally Group B
  { id: 'rally-group-b', name: 'RALLY_GROUP_B', style: 'performance', layout: 'standard', primaryColor: '#6d28d9', secondaryColor: '#1e0729', accentColor: '#0ea5e9', backgroundColor: '#000000', fontFamily: 'font-bebas', texture: 'machined', gaugeType: 'forged-rs-elite', showDetails: true, glowEffect: false },
  
  // 29. LFA Concept
  { id: 'lfa-concept', name: 'APEX_V10_PRO', style: 'luxury', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#000000', fontFamily: 'font-orbitron', texture: 'forged-carbon', gaugeType: 'luxury-alcantara-v2', showDetails: true, glowEffect: false },

  // QUASAR GAUGE CLUSTERS
  { id: 'quasar-drive', name: 'QUASAR_DRIVE', style: 'futuristic', layout: 'ultrawide', primaryColor: '#6d28d9', secondaryColor: '#050505', accentColor: '#10b981', backgroundColor: '#040d1a', fontFamily: 'font-tech', texture: 'none', gaugeType: 'quasar', showDetails: true, glowEffect: false },
  
  { id: 'quasar-sport', name: 'QUASAR_SPORT', style: 'performance', layout: 'ultrawide', primaryColor: '#7c3aed', secondaryColor: '#1a0b2e', accentColor: '#f43f5e', backgroundColor: '#0a0014', fontFamily: 'font-tech', texture: 'none', gaugeType: 'quasar', showDetails: true, glowEffect: false },
  
  { id: 'quasar-race', name: 'QUASAR_RACE', style: 'performance', layout: 'ultrawide', primaryColor: '#6d28d9', secondaryColor: '#0A0A0E', accentColor: '#f59e0b', backgroundColor: '#0f0214', fontFamily: 'font-tech', texture: 'none', gaugeType: 'quasar', showDetails: true, glowEffect: false },
  
  // 30. Track Day RS
  { id: 'track-day-rs', name: 'TRACK_DAY_RS', style: 'performance', layout: 'focused', primaryColor: '#7c3aed', secondaryColor: '#000510', accentColor: '#38bdf8', backgroundColor: '#111111', fontFamily: 'font-tech', texture: 'carbon', gaugeType: 'neon-racer', showDetails: true, glowEffect: false },

  // 31. Deep Sea Diver
  { id: 'deep-sea-diver', name: 'MARIANA_TRENCH', style: 'minimalist', layout: 'standard', primaryColor: '#6366f1', secondaryColor: '#111111', accentColor: '#d946ef', backgroundColor: '#000000', fontFamily: 'font-tech', texture: 'brushed-aluminum', gaugeType: 'deep-space', showDetails: true, glowEffect: false },

  // 32. Aero Flow
  { id: 'aero-flow', name: 'AERO_FLOW_METRICS', style: 'futuristic', layout: 'focused', primaryColor: '#6d28d9', secondaryColor: '#1e0729', accentColor: '#0ea5e9', backgroundColor: '#000000', fontFamily: 'font-michroma', texture: 'none', gaugeType: 'futuristic-hud', showDetails: true, glowEffect: false },

  // 33. Classic Muscle
  { id: 'classic-muscle', name: 'DETROIT_IRON', style: 'retro', layout: 'ultrawide', primaryColor: '#7c3aed', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#0a0a0a', fontFamily: 'font-serif', texture: 'machined', gaugeType: 'muscle-car', showDetails: true, glowEffect: false },

  // 34. Cyber Drone
  { id: 'cyber-drone', name: 'PREDATOR_DRONE', style: 'futuristic', layout: 'grid', primaryColor: '#39FF14', secondaryColor: '#050505', accentColor: '#10b981', backgroundColor: '#000000', fontFamily: 'font-tech', texture: 'circuit', gaugeType: 'cyberpunk-2077', showDetails: true, glowEffect: false },

  // 35. Precision Machined
  { id: 'precision-machined', name: 'CNC_MASTER', style: 'performance', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#1a0b2e', accentColor: '#f43f5e', backgroundColor: '#000000', fontFamily: 'font-bebas', texture: 'machined', gaugeType: 'tactical-ops', showDetails: true, glowEffect: false },

  // 36. Stealth Bomber
  { id: 'stealth-bomber', name: 'B2_STEALTH', style: 'minimalist', layout: 'focused', primaryColor: '#6d28d9', secondaryColor: '#0A0A0E', accentColor: '#f59e0b', backgroundColor: '#020617', fontFamily: 'font-inter', texture: 'piano-black', gaugeType: 'stealth-ghost', showDetails: true, glowEffect: false },

  // 37. Warp Speed
  { id: 'warp-speed', name: 'LIGHTSPEED_V9', style: 'futuristic', layout: 'ultrawide', primaryColor: '#7c3aed', secondaryColor: '#000510', accentColor: '#38bdf8', backgroundColor: '#020617', fontFamily: 'font-lcd-italic', texture: 'stardust', gaugeType: 'perspective-tunnel', showDetails: true, glowEffect: false },

  // 38. Offroad Baja
  { id: 'offroad-baja', name: 'BAJA_TROPHY_TRUCK', style: 'performance', layout: 'standard', primaryColor: '#6366f1', secondaryColor: '#111111', accentColor: '#d946ef', backgroundColor: '#000000', fontFamily: 'font-bebas', texture: 'carbon', gaugeType: 'mech-warrior', showDetails: true, glowEffect: false },

  // 39. Neon Tokyo
  { id: 'neon-tokyo', name: 'TOKYO_DRIFT_OS', style: 'futuristic', layout: 'grid', primaryColor: '#6d28d9', secondaryColor: '#1e0729', accentColor: '#0ea5e9', backgroundColor: '#000000', fontFamily: 'font-orbitron', texture: 'hex-grid', gaugeType: 'neon-grid', showDetails: true, glowEffect: false },

  // 40. Hypercar Vision
  { id: 'hypercar-vision', name: 'HYPER_VISION_X', style: 'luxury', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#000000', fontFamily: 'font-michroma', texture: 'forged-carbon', gaugeType: 'forged-rs-elite', showDetails: true, glowEffect: false },

  // 41. Quantum Computer
  { id: 'quantum-computer', name: 'Q_BIT_DATA', style: 'futuristic', layout: 'focused', primaryColor: '#6d28d9', secondaryColor: '#050505', accentColor: '#10b981', backgroundColor: '#020005', fontFamily: 'font-tech', texture: 'circuit', gaugeType: 'quantum-flux', showDetails: true, glowEffect: false },

  // 42. F1 Data Center
  { id: 'f1-data-center', name: 'FORMULA_TELEMETRY', style: 'performance', layout: 'ultrawide', primaryColor: '#7c3aed', secondaryColor: '#1a0b2e', accentColor: '#f43f5e', backgroundColor: '#0a0a0a', fontFamily: 'font-lcd', texture: 'carbon', gaugeType: 'gravity-master', showDetails: true, glowEffect: false },

  // 43. Bio-Luminescence
  { id: 'bio-luminescence', name: 'ABYSS_GLOW', style: 'futuristic', layout: 'standard', primaryColor: '#6d28d9', secondaryColor: '#0A0A0E', accentColor: '#f59e0b', backgroundColor: '#000000', fontFamily: 'font-serif', texture: 'none', gaugeType: 'alien-tech', showDetails: true, glowEffect: false },

  // 44. Retro VHS
  { id: 'retro-vhs', name: 'ANALOG_VHS_1992', style: 'retro', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#000510', accentColor: '#38bdf8', backgroundColor: '#111111', fontFamily: 'font-digital', texture: 'piano-black', gaugeType: 'retro-arcade', showDetails: true, glowEffect: false },

  // 45. Cold Fusion
  { id: 'cold-fusion', name: 'COLD_FUSION_CORE', style: 'futuristic', layout: 'standard', primaryColor: '#6366f1', secondaryColor: '#111111', accentColor: '#d946ef', backgroundColor: '#000000', fontFamily: 'font-tech', texture: 'hex-grid', gaugeType: 'holographic-proj', showDetails: true, glowEffect: false },

  // 46. Superbike V4
  { id: 'superbike-v4', name: 'DESMO_V4_RACE', style: 'performance', layout: 'focused', primaryColor: '#6d28d9', secondaryColor: '#1e0729', accentColor: '#0ea5e9', backgroundColor: '#000000', fontFamily: 'font-bebas', texture: 'machined', gaugeType: 'neon-racer', showDetails: true, glowEffect: false },

  // 47. Gold Plated
  { id: 'gold-plated', name: 'ROYAL_OAK_EDITION', style: 'luxury', layout: 'standard', primaryColor: '#7c3aed', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#111111', fontFamily: 'font-serif', texture: 'brushed-aluminum', gaugeType: 'steampunk-gears', showDetails: true, glowEffect: false },

  // 48. Blueprint Dark
  { id: 'blueprint-dark', name: 'DARKSIDE_BLUEPRINT', style: 'minimalist', layout: 'grid', primaryColor: '#39FF14', secondaryColor: '#050505', accentColor: '#10b981', backgroundColor: '#050510', fontFamily: 'font-tech', texture: 'blueprint', gaugeType: 'blueprint-v4-master', showDetails: true, glowEffect: false },

  // 49. Cybernetic Organism
  { id: 'cybernetic-organism', name: 'CYBER_ORG_V1', style: 'futuristic', layout: 'ultrawide', primaryColor: '#7c3aed', secondaryColor: '#1a0b2e', accentColor: '#f43f5e', backgroundColor: '#000000', fontFamily: 'font-lcd-italic', texture: 'circuit', gaugeType: 'cyber-neon-2088', showDetails: true, glowEffect: false },

  // 50. Final Form
  { id: 'final-form', name: 'FINAL_FORM_OMEGA', style: 'performance', layout: 'ultrawide', primaryColor: '#6d28d9', secondaryColor: '#0A0A0E', accentColor: '#f59e0b', backgroundColor: '#000000', fontFamily: 'font-orbitron', texture: 'forged-carbon', gaugeType: 'perspective-tunnel', showDetails: true, glowEffect: false },
];

export const MOCK_CONTACTS: any[] = [
  { id: 'c1', name: 'SARAH_CONNOR', number: '555-0199', avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { id: 'c2', name: 'JOHN_WICK', number: '555-0045', avatar: 'https://picsum.photos/seed/john/100/100' },
  { id: 'c3', name: 'TONY_STARK', number: '555-3000', avatar: 'https://picsum.photos/seed/tony/100/100' },
  { id: 'c4', name: 'BRUCE_WAYNE', number: '555-1939', avatar: 'https://picsum.photos/seed/bruce/100/100' },
  { id: 'c5', name: 'ELLEN_RIPLEY', number: '555-2122', avatar: 'https://picsum.photos/seed/ellen/100/100' },
];

export const MOCK_MESSAGES: any[] = [
  { id: 'm1', contactId: 'c1', text: 'THE_MACHINES_ARE_COMING. WHERE_ARE_YOU?', timestamp: Date.now() - 3600000, isIncoming: true },
  { id: 'm2', contactId: 'c2', text: 'I_NEED_A_RESERVATION. FOR_TWELVE.', timestamp: Date.now() - 1800000, isIncoming: true },
  { id: 'm3', contactId: 'c3', text: 'JARVIS_SAYS_THE_DASHBOARD_LOOKS_GOOD.', timestamp: Date.now() - 600000, isIncoming: true },
  { id: 'm4', contactId: 'c4', text: 'MEET_AT_THE_SIGNAL.', timestamp: Date.now() - 300000, isIncoming: true },
];

const DSP_PROFILES: AudioProfile[] = [
  'STUDIO_FLAT', 'PUNCHY_90S', 'DYNAMIC_LOUDNESS', 'VINTAGE_WARM', 'CRISP_HI_FI',
  'ANALOG_CLASSIC', 'DEEP_BASS_ELITE', 'CLEAR_VOCAL_GOLD', 'TUBE_AMPLIFIER', 'CONCERT_HALL'
];

const NEON_GREEN = '#39FF14';
const NEON_RED = '#FF0000';
const NEON_ORANGE = '#FF8C00';
const DIGITAL_BLUE = '#00FFFF';

const RAW_90S_DATA = [
  { name: 'WINAMP CLASSIC', style: 'segment-lcd', color: '#00FF00', perf: true, grad: true, hardware: 'winamp' },
  { name: 'NAKAMICHI DRAGON-K', style: 'vfd-80s', color: '#FF7700', perf: true, hardware: 'nakamichi' },
  { name: 'MCINTOSH REF 100', style: 'hi-fi-90s', color: '#00D5FF', perf: true, hardware: 'mcintosh' },
  { name: 'ALPINE F1 STATUS', style: 'dot-matrix', color: '#00FFFF', perf: true, hardware: 'alpine' },
  { name: 'PIONEER ODR MASTER', style: 'segment-lcd', color: '#33FF66', perf: true, hardware: 'pioneer' },
  { name: 'DENON DCT-Z1 LEGACY', style: 'vfd-80s', color: '#FFCC00', perf: true, hardware: 'denon' },
  { name: 'SONY XES MASTER', style: 'segment-lcd', color: '#FF3300', perf: true, hardware: 'sony' },
  { name: 'CLARION HX-D2 REF', style: 'vfd-80s', color: '#00FFCC', perf: true, hardware: 'clarion' },
  { name: 'KENWOOD EXCELON Z', style: 'dot-matrix', color: '#4D88FF', perf: true, hardware: 'kenwood' },
  { name: 'MCINTOSH REF 200', style: 'hi-fi-90s', color: '#00FF00', perf: true, hardware: 'mcintosh' },
  { name: 'MCINTOSH REF 300', style: 'hi-fi-90s', color: '#FF0000', perf: true, hardware: 'mcintosh' },
  { name: 'MCINTOSH REF 400', style: 'hi-fi-90s', color: '#FFFF00', perf: true, hardware: 'mcintosh' },
  { name: 'MCINTOSH REF 500', style: 'hi-fi-90s', color: '#FF00FF', perf: true, hardware: 'mcintosh' },
  { name: 'MCINTOSH REF 600', style: 'hi-fi-90s', color: '#00FFFF', perf: true, hardware: 'mcintosh' },
  { name: 'MARK LEVINSON NO.53', style: 'hi-fi-90s', color: '#FF3300', perf: true, hardware: 'mcintosh' },
  { name: 'BURMESTER HIGH-END', style: 'hi-fi-90s', color: '#C0C0C0', perf: true, hardware: 'mcintosh' },
  { name: 'BOWERS & WILKINS DIAMOND', style: 'hi-fi-90s', color: '#FFD700', perf: true, hardware: 'mcintosh' },
  { name: 'BANG & OLUFSEN BEOSOUND', style: 'hi-fi-90s', color: '#00FFCC', perf: true, hardware: 'mcintosh' },
  { name: 'MERIDIAN REFERENCE', style: 'hi-fi-90s', color: '#FF00A0', perf: true, hardware: 'mcintosh' },
  { name: 'NAIM AUDIO STATEMENT', style: 'hi-fi-90s', color: '#33FF00', perf: true, hardware: 'mcintosh' },
  { name: 'HARMAN KARDON LOGIC7', style: 'hi-fi-90s', color: '#00aaff', perf: true, hardware: 'mcintosh' },
  { name: 'LEXICON SURROUND', style: 'hi-fi-90s', color: '#ff6600', perf: true, hardware: 'mcintosh' },
  { name: 'BOSE PANARAY', style: 'hi-fi-90s', color: '#ffffff', perf: true, hardware: 'mcintosh' },
  { name: 'DYNAUDIO EVIDENCE', style: 'hi-fi-90s', color: '#8A2BE2', perf: true, hardware: 'mcintosh' },
  { name: 'ALPINE 7909 JUBILEE', style: 'segment-lcd', color: '#00FFCC', perf: true, grad: true, hardware: 'alpine' },
  { name: 'ECLIPSE CD8053', style: 'vfd-80s', color: '#00ccff', perf: true, hardware: 'generic-vfd' },
  { name: 'PIONEER DEH-P88RS', style: 'dot-matrix', color: '#FFFFFF', perf: true, hardware: 'pioneer' },
  { name: 'PANASONIC CQ-TX5500W', style: 'hi-fi-90s', color: '#FF9900', perf: true, hardware: 'generic-vfd' },
  { name: 'BECKER MEXICO 7948', style: 'segment-lcd', color: '#FFcc00', perf: true, hardware: 'generic-lcd' },
  { name: 'BLAUPUNKT BREMEN SQR 46', style: 'vfd-80s', color: '#ff3300', perf: true, hardware: 'generic-vfd' },
  { name: 'CLARION DRX9255', style: 'segment-lcd', color: '#00FF00', perf: true, hardware: 'clarion' },
  { name: 'SONY CDX-C90', style: 'dot-matrix', color: '#FF3399', perf: true, hardware: 'sony' },
  { name: 'KENWOOD KDC-X911', style: 'segment-lcd', color: '#3399FF', perf: true, hardware: 'kenwood' },
  { name: 'JVC KD-SH99', style: 'vfd-80s', color: '#EEEEEE', perf: true, hardware: 'generic-vfd' },
  { name: 'ROCKFORD FOSGATE RFX8250', style: 'segment-lcd', color: '#FF0000', perf: true, hardware: 'generic-lcd' },
  { name: 'MCINTOSH MX406', style: 'hi-fi-90s', color: '#00FF66', perf: true, hardware: 'mcintosh' },
  { name: 'NAKAMICHI CD-700II', style: 'vfd-80s', color: '#FF8800', perf: true, hardware: 'nakamichi' },
  { name: 'DENON DCT-A1', style: 'hi-fi-90s', color: '#FFD700', perf: true, hardware: 'denon' },
  { name: 'ALPINE CDA-7939', style: 'segment-lcd', color: '#00FFAA', perf: true, hardware: 'alpine' },
  { name: 'PIONEER DEX-P99RS', style: 'dot-matrix', color: '#E0E0E0', perf: true, hardware: 'pioneer' },
  { name: 'SONY RSX-GS9', style: 'hi-fi-90s', color: '#FFFFFF', perf: true, hardware: 'sony' },
  { name: 'CLARION MAX667', style: 'vfd-80s', color: '#00BFFF', perf: true, hardware: 'clarion' },
  { name: 'KENWOOD XXV-01D', style: 'segment-lcd', color: '#4169E1', perf: true, hardware: 'kenwood' },
  { name: 'JVC EL CAMALEON LX', style: 'vfd-80s', color: '#00FF00', perf: true, hardware: 'generic-vfd' },
  { name: 'PIONEER DEH-P600 DOLPHIN', style: 'dot-matrix', color: '#00DDFF', perf: true, hardware: 'pioneer' },
  { name: 'ALPINE 3D SHUTTLE', style: 'segment-lcd', color: '#32CD32', perf: true, hardware: 'alpine' },
  { name: 'SONY XPLOD ES', style: 'dot-matrix', color: '#FF0033', perf: true, hardware: 'sony' },
  { name: 'CLARION PROAUDIO', style: 'vfd-80s', color: '#00FA9A', perf: true, hardware: 'clarion' },
  { name: 'KENWOOD MASK REVOLVER', style: 'segment-lcd', color: '#1E90FF', perf: true, hardware: 'kenwood' },
  { name: 'ECLIPSE FUJITSU TEN', style: 'vfd-80s', color: '#FFD700', perf: true, hardware: 'generic-vfd' },
  { name: 'NAKAMICHI MB-100', style: 'hi-fi-90s', color: '#FF8C00', perf: true, hardware: 'nakamichi' },
  { name: 'DENON ALPHA', style: 'hi-fi-90s', color: '#FFB6C1', perf: true, hardware: 'denon' },
  { name: 'ROCKFORD FOSGATE PUNCH', style: 'segment-lcd', color: '#DC143C', perf: true, hardware: 'generic-lcd' },
];

export const STEREO_THEMES: StereoTheme[] = RAW_90S_DATA.map((brand, i) => {
  const isWinamp = brand.hardware === 'winamp';
  const isMcintosh = brand.hardware === 'mcintosh';
  const isNakamichi = brand.hardware === 'nakamichi';
  
  return {
    id: `stereo-90s-${i}`,
    name: brand.name,
    style: brand.style as any,
    hardwareStyle: brand.hardware as any,
    barColor: brand.color,
    peakColor: isWinamp ? '#FFFFFF' : (brand.color === '#00FF00' ? '#FFFF00' : '#FFFFFF'),
    bgColor: '#000000',
    segmentCount: isWinamp ? 16 : (isMcintosh || isNakamichi ? 0 : 10 + (i % 6)),
    glowIntensity: isMcintosh ? 1.5 : (0.8 + (i % 4) * 0.15),
    scanlineEffect: isWinamp ? false : (i % 3 === 0),
    dspProfile: DSP_PROFILES[i % DSP_PROFILES.length],
    isPerformance: brand.perf || false,
    useGradient: brand.grad || false,
    doubleBars: isWinamp ? false : (isMcintosh || isNakamichi ? false : (i % 3 === 1))
  };
});
