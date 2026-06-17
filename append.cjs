const fs = require('fs');

const moreThemes = `
  // 26. Pure Racing V8
  { id: 'pure-racing-v8', name: 'PURE_RACING_V8', style: 'performance', layout: 'standard', primaryColor: '#ff0000', secondaryColor: '#1a1a1a', accentColor: '#ffffff', backgroundColor: '#000000', fontFamily: 'font-inter', texture: 'carbon', gaugeType: 'universal-jdm-legend', showDetails: true, glowEffect: true },
  
  // 27. Synthwave Sunset
  { id: 'synthwave-sunset', name: 'MIAMI_SUNSET_1984', style: 'retro', layout: 'ultrawide', primaryColor: '#ff7700', secondaryColor: '#2b003b', accentColor: '#ff00ff', backgroundColor: '#11001c', fontFamily: 'font-lcd-italic', texture: 'hex-grid', gaugeType: 'neon-synthwave-1984', showDetails: true, glowEffect: true },
  
  // 28. Rally Group B
  { id: 'rally-group-b', name: 'RALLY_GROUP_B', style: 'performance', layout: 'standard', primaryColor: '#eab308', secondaryColor: '#1c1917', accentColor: '#ef4444', backgroundColor: '#000000', fontFamily: 'font-bebas', texture: 'machined', gaugeType: 'forged-rs-elite', showDetails: true, glowEffect: false },
  
  // 29. LFA Concept
  { id: 'lfa-concept', name: 'APEX_V10_PRO', style: 'luxury', layout: 'standard', primaryColor: '#ffffff', secondaryColor: '#111111', accentColor: '#ef4444', backgroundColor: '#000000', fontFamily: 'font-orbitron', texture: 'forged-carbon', gaugeType: 'luxury-alcantara-v2', showDetails: true, glowEffect: true },
  
  // 30. Track Day RS
  { id: 'track-day-rs', name: 'TRACK_DAY_RS', style: 'performance', layout: 'focused', primaryColor: '#38bdf8', secondaryColor: '#000000', accentColor: '#f43f5e', backgroundColor: '#111111', fontFamily: 'font-tech', texture: 'carbon', gaugeType: 'neon-racer', showDetails: true, glowEffect: true },

  // 31. Deep Sea Diver
  { id: 'deep-sea-diver', name: 'MARIANA_TRENCH', style: 'minimalist', layout: 'standard', primaryColor: '#06b6d4', secondaryColor: '#083344', accentColor: '#bfdbfe', backgroundColor: '#000000', fontFamily: 'font-tech', texture: 'brushed-aluminum', gaugeType: 'deep-space', showDetails: true, glowEffect: true },

  // 32. Aero Flow
  { id: 'aero-flow', name: 'AERO_FLOW_METRICS', style: 'futuristic', layout: 'focused', primaryColor: '#10b981', secondaryColor: '#022c22', accentColor: '#6ee7b7', backgroundColor: '#000000', fontFamily: 'font-michroma', texture: 'none', gaugeType: 'futuristic-hud', showDetails: true, glowEffect: true },

  // 33. Classic Muscle
  { id: 'classic-muscle', name: 'DETROIT_IRON', style: 'retro', layout: 'ultrawide', primaryColor: '#ea580c', secondaryColor: '#171717', accentColor: '#ffffff', backgroundColor: '#0a0a0a', fontFamily: 'font-serif', texture: 'machined', gaugeType: 'muscle-car', showDetails: true, glowEffect: false },

  // 34. Cyber Drone
  { id: 'cyber-drone', name: 'PREDATOR_DRONE', style: 'futuristic', layout: 'grid', primaryColor: '#9333ea', secondaryColor: '#1a0b2e', accentColor: '#f0abfc', backgroundColor: '#000000', fontFamily: 'font-tech', texture: 'circuit', gaugeType: 'cyberpunk-2077', showDetails: true, glowEffect: true },

  // 35. Precision Machined
  { id: 'precision-machined', name: 'CNC_MASTER', style: 'performance', layout: 'standard', primaryColor: '#d4d4d8', secondaryColor: '#18181b', accentColor: '#fbbf24', backgroundColor: '#000000', fontFamily: 'font-bebas', texture: 'machined', gaugeType: 'tactical-ops', showDetails: true, glowEffect: false },

  // 36. Stealth Bomber
  { id: 'stealth-bomber', name: 'B2_STEALTH', style: 'minimalist', layout: 'focused', primaryColor: '#64748b', secondaryColor: '#0f172a', accentColor: '#ef4444', backgroundColor: '#020617', fontFamily: 'font-inter', texture: 'piano-black', gaugeType: 'stealth-ghost', showDetails: true, glowEffect: false },

  // 37. Warp Speed
  { id: 'warp-speed', name: 'LIGHTSPEED_V9', style: 'futuristic', layout: 'ultrawide', primaryColor: '#3b82f6', secondaryColor: '#000000', accentColor: '#ffffff', backgroundColor: '#020617', fontFamily: 'font-lcd-italic', texture: 'stardust', gaugeType: 'perspective-tunnel', showDetails: true, glowEffect: true },

  // 38. Offroad Baja
  { id: 'offroad-baja', name: 'BAJA_TROPHY_TRUCK', style: 'performance', layout: 'standard', primaryColor: '#f97316', secondaryColor: '#27272a', accentColor: '#eab308', backgroundColor: '#000000', fontFamily: 'font-bebas', texture: 'carbon', gaugeType: 'mech-warrior', showDetails: true, glowEffect: false },

  // 39. Neon Tokyo
  { id: 'neon-tokyo', name: 'TOKYO_DRIFT_OS', style: 'futuristic', layout: 'grid', primaryColor: '#ff00a0', secondaryColor: '#090011', accentColor: '#00d0ff', backgroundColor: '#000000', fontFamily: 'font-orbitron', texture: 'hex-grid', gaugeType: 'neon-grid', showDetails: true, glowEffect: true },

  // 40. Hypercar Vision
  { id: 'hypercar-vision', name: 'HYPER_VISION_X', style: 'luxury', layout: 'standard', primaryColor: '#fbbf24', secondaryColor: '#111111', accentColor: '#ffffff', backgroundColor: '#000000', fontFamily: 'font-michroma', texture: 'forged-carbon', gaugeType: 'forged-rs-elite', showDetails: true, glowEffect: true },

  // 41. Quantum Computer
  { id: 'quantum-computer', name: 'Q_BIT_DATA', style: 'futuristic', layout: 'focused', primaryColor: '#a855f7', secondaryColor: '#000000', accentColor: '#60a5fa', backgroundColor: '#020005', fontFamily: 'font-tech', texture: 'circuit', gaugeType: 'quantum-flux', showDetails: true, glowEffect: true },

  // 42. F1 Data Center
  { id: 'f1-data-center', name: 'FORMULA_TELEMETRY', style: 'performance', layout: 'ultrawide', primaryColor: '#ef4444', secondaryColor: '#000000', accentColor: '#eab308', backgroundColor: '#0a0a0a', fontFamily: 'font-lcd', texture: 'carbon', gaugeType: 'gravity-master', showDetails: true, glowEffect: false },

  // 43. Bio-Luminescence
  { id: 'bio-luminescence', name: 'ABYSS_GLOW', style: 'futuristic', layout: 'standard', primaryColor: '#34d399', secondaryColor: '#022c22', accentColor: '#10b981', backgroundColor: '#000000', fontFamily: 'font-serif', texture: 'none', gaugeType: 'alien-tech', showDetails: true, glowEffect: true },

  // 44. Retro VHS
  { id: 'retro-vhs', name: 'ANALOG_VHS_1992', style: 'retro', layout: 'standard', primaryColor: '#facc15', secondaryColor: '#000000', accentColor: '#2dd4bf', backgroundColor: '#111111', fontFamily: 'font-digital', texture: 'piano-black', gaugeType: 'retro-arcade', showDetails: true, glowEffect: false },

  // 45. Cold Fusion
  { id: 'cold-fusion', name: 'COLD_FUSION_CORE', style: 'futuristic', layout: 'standard', primaryColor: '#60a5fa', secondaryColor: '#0f172a', accentColor: '#c084fc', backgroundColor: '#000000', fontFamily: 'font-tech', texture: 'hex-grid', gaugeType: 'holographic-proj', showDetails: true, glowEffect: true },

  // 46. Superbike V4
  { id: 'superbike-v4', name: 'DESMO_V4_RACE', style: 'performance', layout: 'focused', primaryColor: '#ef4444', secondaryColor: '#000000', accentColor: '#ffffff', backgroundColor: '#000000', fontFamily: 'font-bebas', texture: 'machined', gaugeType: 'neon-racer', showDetails: true, glowEffect: true },

  // 47. Gold Plated
  { id: 'gold-plated', name: 'ROYAL_OAK_EDITION', style: 'luxury', layout: 'standard', primaryColor: '#fbbf24', secondaryColor: '#451a03', accentColor: '#fde047', backgroundColor: '#111111', fontFamily: 'font-serif', texture: 'brushed-aluminum', gaugeType: 'steampunk-gears', showDetails: true, glowEffect: true },

  // 48. Blueprint Dark
  { id: 'blueprint-dark', name: 'DARKSIDE_BLUEPRINT', style: 'minimalist', layout: 'grid', primaryColor: '#6366f1', secondaryColor: '#000000', accentColor: '#ec4899', backgroundColor: '#050510', fontFamily: 'font-tech', texture: 'blueprint', gaugeType: 'blueprint-v4-master', showDetails: true, glowEffect: true },

  // 49. Cybernetic Organism
  { id: 'cybernetic-organism', name: 'CYBER_ORG_V1', style: 'futuristic', layout: 'ultrawide', primaryColor: '#f43f5e', secondaryColor: '#000000', accentColor: '#fbbf24', backgroundColor: '#000000', fontFamily: 'font-lcd-italic', texture: 'circuit', gaugeType: 'cyber-neon-2088', showDetails: true, glowEffect: true },

  // 50. Final Form
  { id: 'final-form', name: 'FINAL_FORM_OMEGA', style: 'performance', layout: 'ultrawide', primaryColor: '#ffffff', secondaryColor: '#000000', accentColor: '#ff0000', backgroundColor: '#000000', fontFamily: 'font-orbitron', texture: 'forged-carbon', gaugeType: 'perspective-tunnel', showDetails: true, glowEffect: true },
`;

let content = fs.readFileSync('constants.ts', 'utf8');
content = content.replace(/(  \{ id: 'neon-grid'.+?\n)\];/s, "$1" + moreThemes + "];");

fs.writeFileSync('constants.ts', content);
