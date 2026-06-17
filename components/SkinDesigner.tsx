import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../types';
import { X, Save, Palette, Eye, Maximize2, LayoutTemplate, Sliders } from 'lucide-react';
import { GaugeDispatcher } from './Gauge';

interface SkinDesignerProps {
  initialTheme: ThemeConfig;
  onSave: (theme: ThemeConfig) => void;
  onClose: () => void;
  onPreviewPreview: (theme: ThemeConfig) => void;
}

const GAUGE_TYPES = [
  'premium-circular', 'carbon-sweep', 'perspective-cluster', 
  'modern-dark', 'futuristic-graph', 'racing-horizontal',
  'elegance-minimal', 'synthwave-drive', 'mech-warrior',
  'alien-tech', 'retro-vfd', 'gravity-master', 'fighter-jet', 'cyber-neon-2088', 'tactical-ops'
];

const TEXTURES = ['polished-carbon', 'forged-carbon', 'hex-grid', 'brushed', 'machined', 'piano-black', 'carbon-weave', 'carbon-forged'];

const LAYOUTS = ['focused', 'split', 'ultrawide', 'asymmetric'];

export const SkinDesigner: React.FC<SkinDesignerProps> = ({ initialTheme, onSave, onClose, onPreviewPreview }) => {
  const [theme, setTheme] = useState<ThemeConfig>({ ...initialTheme, id: `custom-${Date.now()}`, name: 'CUSTOM_SKIN' });
  const [mockData, setMockData] = useState({
    rpm: 3500, speed: 65, coolantTemp: 195, oilTemp: 210, oilPressure: 65, 
    fuelLevel: 75, boost: 12.5, batteryVolts: 13.8, intakeAirTemp: 85,
    engineLoad: 45, throttlePos: 35, warningLights: {}
  });

  useEffect(() => {
    onPreviewPreview(theme);
  }, [theme]);

  // Simulate data jitter for realism
  useEffect(() => {
    const int = setInterval(() => {
      setMockData(p => ({
        ...p,
        rpm: p.rpm + (Math.random() * 200 - 100),
        speed: p.speed + (Math.random() * 2 - 1)
      }));
    }, 100);
    return () => clearInterval(int);
  }, []);

  const updateField = (field: keyof ThemeConfig, value: any) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col md:flex-row bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300 font-sans">
      
      {/* LIVE PREVIEW AREA */}
      <div className="flex-1 relative flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/10">
        <div className="absolute top-6 left-6 flex items-center gap-4">
           <Palette className="text-sky-400" />
           <span className="text-xl font-black uppercase tracking-widest text-white/50">SKIN_DESIGNER_V1</span>
        </div>
        <div className="absolute top-6 right-6">
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors active:scale-95 text-white">
            <X size={24} />
          </button>
        </div>

        <div className="w-full h-[60vh] md:h-[80vh] max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] ring-1 ring-white/10">
           <GaugeDispatcher 
             theme={theme}
             value={mockData.rpm / 8000}
             speed={mockData.speed}
             gear="4"
             data={mockData as any}
             backlit={true}
           />
        </div>
      </div>

      {/* CONTROLS AREA */}
      <div className="w-full md:w-[450px] bg-[#080808] h-full overflow-y-auto flex flex-col pt-8 pb-32">
         <div className="px-8 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] flex items-center gap-2"><LayoutTemplate size={14}/> SKIN_NAME</label>
              <input 
                type="text" 
                value={theme.name}
                onChange={e => updateField('name', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-mono text-xl outline-none focus:border-sky-500 transition-colors uppercase"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">GAUGE_ENGINE_TEMPLATE</label>
              <select 
                value={theme.gaugeType}
                onChange={e => updateField('gaugeType', e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-mono outline-none focus:border-sky-500 appearance-none"
              >
                {GAUGE_TYPES.map(g => <option key={g} value={g} className="bg-black text-white">{g.toUpperCase().replace(/-/g, ' ')}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">LAYOUT</label>
                 <select 
                   value={theme.layout}
                   onChange={e => updateField('layout', e.target.value)}
                   className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-mono outline-none focus:border-sky-500 appearance-none"
                 >
                   {LAYOUTS.map(l => <option key={l} value={l} className="bg-black text-white">{l.toUpperCase()}</option>)}
                 </select>
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">TEXTURE</label>
                 <select 
                   value={theme.texture || 'polished-carbon'}
                   onChange={e => updateField('texture', e.target.value)}
                   className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-mono outline-none focus:border-sky-500 appearance-none"
                 >
                   {TEXTURES.map(t => <option key={t} value={t} className="bg-black text-white">{t.toUpperCase().replace(/-/g, ' ')}</option>)}
                 </select>
               </div>
            </div>

            <div className="h-px w-full bg-white/5 my-2" />

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] flex items-center gap-2"><Palette size={14}/> COLOR DOMAINS</label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black opacity-50 uppercase">PRIMARY</span>
                  <div className="flex h-12 rounded-xl border border-white/10 overflow-hidden relative group">
                    <input type="color" value={theme.primaryColor} onChange={e => updateField('primaryColor', e.target.value)} className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer opacity-0 z-10" />
                    <div className="w-1/3 h-full" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="flex-1 bg-white/5 flex items-center justify-center font-mono text-xs uppercase group-hover:bg-white/10 transition-colors text-white">{theme.primaryColor}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black opacity-50 uppercase">SECONDARY</span>
                  <div className="flex h-12 rounded-xl border border-white/10 overflow-hidden relative group">
                    <input type="color" value={theme.secondaryColor || '#000000'} onChange={e => updateField('secondaryColor', e.target.value)} className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer opacity-0 z-10" />
                    <div className="w-1/3 h-full" style={{ backgroundColor: theme.secondaryColor || '#000' }} />
                    <div className="flex-1 bg-white/5 flex items-center justify-center font-mono text-xs uppercase group-hover:bg-white/10 transition-colors text-white">{theme.secondaryColor || '#000000'}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black opacity-50 uppercase">ACCENT (HIGHLIGHT)</span>
                  <div className="flex h-12 rounded-xl border border-white/10 overflow-hidden relative group">
                    <input type="color" value={theme.accentColor || '#ffffff'} onChange={e => updateField('accentColor', e.target.value)} className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer opacity-0 z-10" />
                    <div className="w-1/3 h-full" style={{ backgroundColor: theme.accentColor || '#fff' }} />
                    <div className="flex-1 bg-white/5 flex items-center justify-center font-mono text-xs uppercase group-hover:bg-white/10 transition-colors text-white">{theme.accentColor || '#ffffff'}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black opacity-50 uppercase">BACKGROUND</span>
                  <div className="flex h-12 rounded-xl border border-white/10 overflow-hidden relative group">
                    <input type="color" value={theme.backgroundColor || '#0a0a0a'} onChange={e => updateField('backgroundColor', e.target.value)} className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer opacity-0 z-10" />
                    <div className="w-1/3 h-full" style={{ backgroundColor: theme.backgroundColor || '#0a0a0a' }} />
                    <div className="flex-1 bg-white/5 flex items-center justify-center font-mono text-xs uppercase group-hover:bg-white/10 transition-colors text-white">{theme.backgroundColor || '#0a0a0a'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-white/5 my-2" />

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] flex items-center gap-2"><Sliders size={14}/> MODIFIERS</label>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => updateField('glowEffect', !theme.glowEffect)}
                   className={`p-4 rounded-xl border font-black text-xs tracking-widest uppercase transition-all ${theme.glowEffect ? 'bg-sky-500/20 border-sky-500/50 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                 >
                   GLOW_EFFECT
                 </button>
                 <button 
                   onClick={() => updateField('backlit', !theme.backlit)}
                   className={`p-4 rounded-xl border font-black text-xs tracking-widest uppercase transition-all ${theme.backlit ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                 >
                   BACKLIT_PANEL
                 </button>
                 <button 
                   onClick={() => updateField('overlay', !theme.overlay)}
                   className={`p-4 rounded-xl border font-black text-xs tracking-widest uppercase transition-all ${theme.overlay ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                 >
                   LENS_OVERLAY
                 </button>
              </div>
            </div>

         </div>

         <div className="absolute bottom-0 right-0 w-full md:w-[450px] p-8 bg-gradient-to-t from-black via-black to-transparent backdrop-blur-xl border-t border-white/10">
            <button 
              onClick={() => onSave(theme)}
              className="w-full py-6 rounded-2xl bg-white text-black font-black uppercase tracking-[0.3em] text-lg hover:bg-sky-400 flex items-center justify-center gap-3 transition-colors active:scale-95 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
            >
               <Save size={24} /> COMPILE_CUSTOM_SKIN
            </button>
         </div>
      </div>

    </div>
  );
};
