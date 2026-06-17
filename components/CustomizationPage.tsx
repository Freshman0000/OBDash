import React, { useState, useEffect } from 'react';
import { Palette, Baseline, Monitor, Check, Speaker, Layers } from 'lucide-react';
import { ThemeConfig } from '../types';

interface CustomizationPageProps {
  themeOverrides: Partial<ThemeConfig>;
  setThemeOverrides: (overrides: Partial<ThemeConfig>) => void;
  uiScale: number;
  setUiScale: (scale: number) => void;
  vehicleName: string;
  setVehicleName: (name: string) => void;
  audioInputSource: 'microphone' | 'aux' | 'media' | 'simulated';
  setAudioInputSource: (source: 'microphone' | 'aux' | 'media' | 'simulated') => void;
  onClose: () => void;
}

export const CustomizationPage: React.FC<CustomizationPageProps> = ({ 
  themeOverrides, setThemeOverrides, uiScale, setUiScale, vehicleName, setVehicleName, 
  audioInputSource, setAudioInputSource, onClose 
}) => {
  const [localOverrides, setLocalOverrides] = useState<Partial<ThemeConfig>>(themeOverrides);
  const [localScale, setLocalScale] = useState(uiScale);
  const [localName, setLocalName] = useState(vehicleName);
  const [localAudioInput, setLocalAudioInput] = useState(audioInputSource);

  useEffect(() => {
     setLocalOverrides(themeOverrides);
     setLocalScale(uiScale);
     setLocalName(vehicleName);
     setLocalAudioInput(audioInputSource);
  }, [themeOverrides, uiScale, vehicleName, audioInputSource]);

  const updateOverride = (key: keyof ThemeConfig, value: any) => {
    setLocalOverrides({ ...localOverrides, [key]: value });
  };

  const handleApply = () => {
     setThemeOverrides(localOverrides);
     setUiScale(localScale);
     setVehicleName(localName.toUpperCase());
     setAudioInputSource(localAudioInput);
     localStorage.setItem('vehicleName', localName.toUpperCase());
     localStorage.setItem('themeOverrides', JSON.stringify(localOverrides));
     localStorage.setItem('uiScale', localScale.toString());
     localStorage.setItem('audioInputSource', localAudioInput);
     onClose();
  };

  return (
    <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto bg-[#0a0a0a] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] shadow-4xl h-full relative">
       <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30"><Palette size={28}/></div>
             <h2 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase text-white">CUSTOMIZATION_HUB</h2>
          </div>
          <button onClick={handleApply} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(14,165,233,0.4)]">
             <Check size={20} /> APPLY SETTINGS
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full pb-20">
          {/* Colors */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
             <h3 className="text-xl font-bold uppercase tracking-widest text-white/50 flex items-center gap-3"><Palette size={18}/> Theme Colors</h3>
             
             <div className="flex flex-col gap-4">
                <label className="flex justify-between items-center bg-black/40 p-4 rounded-xl">
                   <span className="text-sm font-bold uppercase text-white/70">Accent Color</span>
                   <input type="color" value={localOverrides.primaryColor || '#ff0000'} onChange={(e) => updateOverride('primaryColor', e.target.value)} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0" />
                </label>
                <label className="flex justify-between items-center bg-black/40 p-4 rounded-xl">
                   <span className="text-sm font-bold uppercase text-white/70">Secondary Color</span>
                   <input type="color" value={localOverrides.accentColor || '#ffffff'} onChange={(e) => updateOverride('accentColor', e.target.value)} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0" />
                </label>
                <label className="flex justify-between items-center bg-black/40 p-4 rounded-xl">
                   <span className="text-sm font-bold uppercase text-white/70">Background Tint</span>
                   <input type="color" value={localOverrides.backgroundColor || '#000000'} onChange={(e) => updateOverride('backgroundColor', e.target.value)} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0" />
                </label>
             </div>
             
             <button onClick={() => setLocalOverrides({})} className="bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl font-bold uppercase hover:bg-red-500/30 transition-colors mt-auto">
                Reset Colors
             </button>
          </div>

          {/* Typography & Display */}
          <div className="flex flex-col gap-8">
             <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white/50 flex items-center gap-3"><Baseline size={18}/> Typography & Identity</h3>
                <div className="flex flex-col gap-4">
                   <label className="flex flex-col gap-2">
                       <span className="text-sm font-bold uppercase text-white/70">Vehicle Name</span>
                       <input 
                         type="text" 
                         value={localName} 
                         onChange={(e) => setLocalName(e.target.value)} 
                         className="bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-sky-500/50 font-bold tracking-widest uppercase mb-2"
                         placeholder="e.g. GT500 SPEC"
                       />
                   </label>
                   <label className="flex flex-col gap-2">
                       <span className="text-sm font-bold uppercase text-white/70">Global Font Family</span>
                       <select value={localOverrides.fontFamily || ''} onChange={(e) => updateOverride('fontFamily', e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-sky-500/50">
                          <option value="">Theme Default</option>
                          <option value="font-tech">Audi RS (Orbitron)</option>
                          <option value="font-michroma">Audi RS 2 (Michroma)</option>
                          <option value="font-bebas">BMW M (Teko)</option>
                          <option value="font-inter">BMW M 2 (Inter)</option>
                          <option value="font-serif">Mercedes AMG (Chakra Petch)</option>
                          <option value="font-lcd">Segmented LCD</option>
                          <option value="font-lcd-italic">LCD Italic</option>
                          <option value="font-share-tech">Share Tech Mono</option>
                          <option value="font-digital">7-Segment Digital</option>
                          <option value="font-mxsquad">Black Ops</option>
                       </select>
                   </label>
                </div>
             </div>

             <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white/50 flex items-center gap-3"><Speaker size={18}/> Audio DSP Input</h3>
                <div className="flex flex-col gap-2">
                   <select value={localAudioInput} onChange={(e) => setLocalAudioInput(e.target.value as any)} className="bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-sky-500/50 uppercase font-black tracking-widest">
                      <option value="microphone">PRIMARY_MICROPHONE</option>
                      <option value="aux">AUX_LINE_IN</option>
                      <option value="media">SYSTEM_MEDIA_TAP</option>
                      <option value="simulated">SIMULATED_NO_INPUT</option>
                   </select>
                </div>
             </div>
          </div>

          {/* Advanced Tweaks */}
          <div className="flex flex-col gap-8">
             <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white/50 flex items-center gap-3"><Monitor size={18}/> UI Scaling & Effects</h3>
                <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-2 bg-black/40 p-4 rounded-xl">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold uppercase text-white/70">Resolution Scale</span>
                        <span className="text-sm font-bold text-sky-400">{localScale.toFixed(2)}x</span>
                      </div>
                      <input type="range" min="0.5" max="1.5" step="0.05" value={localScale} onChange={(e) => setLocalScale(parseFloat(e.target.value))} className="w-full accent-sky-500 cursor-pointer" />
                   </div>

                   <button 
                     onClick={() => updateOverride('glowEffect', !localOverrides.glowEffect)}
                     className={`p-4 rounded-xl border flex justify-between items-center transition-all ${localOverrides.glowEffect ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'bg-black/20 border-white/10 text-white/40'}`}
                   >
                     <span className="text-xs font-black uppercase">ULTRA_GLOW_EFFECT</span>
                     <div className={`w-4 h-4 rounded-full ${localOverrides.glowEffect ? 'bg-sky-400 shadow-[0_0_10px_sky-400]' : 'bg-white/10'}`} />
                   </button>

                   <button 
                     onClick={() => updateOverride('backlitEnabled', !localOverrides.backlitEnabled)}
                     className={`p-4 rounded-xl border flex justify-between items-center transition-all ${localOverrides.backlitEnabled ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'bg-black/20 border-white/10 text-white/40'}`}
                   >
                     <span className="text-xs font-black uppercase">BACKLIT_INSTRUMENTATION</span>
                     <div className={`w-4 h-4 rounded-full ${localOverrides.backlitEnabled ? 'bg-emerald-400 shadow-[0_0_10px_emerald-400]' : 'bg-white/10'}`} />
                   </button>
                </div>
             </div>
             
             <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white/50 flex items-center gap-3"><Layers size={18}/> Material Finish</h3>
                <div className="flex flex-col gap-4">
                   <label className="flex flex-col gap-2">
                       <span className="text-sm font-bold uppercase text-white/70">Global Texture Overlays</span>
                       <select value={localOverrides.texture || ''} onChange={(e) => updateOverride('texture', e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-sky-500/50">
                          <option value="">Theme Default</option>
                          <option value="polished-carbon">Polished Carbon</option>
                          <option value="forged-carbon">Forged Carbon</option>
                          <option value="hex-grid">Hex Grid</option>
                          <option value="brushed-aluminum">Brushed Aluminum</option>
                          <option value="machined">Machined Metal</option>
                          <option value="none">None (Solid Color)</option>
                       </select>
                   </label>
                   <label className="flex flex-col gap-2">
                       <span className="text-sm font-bold uppercase text-white/70">Lens Overlay Effect</span>
                       <select value={localOverrides.overlayEffect || ''} onChange={(e) => updateOverride('overlayEffect', e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-sky-500/50">
                          <option value="">None</option>
                          <option value="plastic">Curved Plastic (Gloss)</option>
                          <option value="glass">Tempered Glass (Premium)</option>
                       </select>
                   </label>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
