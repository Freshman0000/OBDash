import React from 'react';
import { GaugeProps, WarningLights } from './Gauge';
import { Ticker } from './Ticker';

export const DigitalDashRetro: React.FC<GaugeProps> = ({ value, speed, gear, data, navState, theme }) => {
  const currentRpm = data?.rpm ?? (value * 1000);
  const rpmPercent = Math.min(100, (currentRpm / 8000) * 100);
  const speedVal = Math.round(speed || 0);
  
  const isBlueGreen = theme.id === 'digital-retro-blue-green';
  const primary = theme.primaryColor || (isBlueGreen ? '#39ff14' : '#ff9900');
  const secondary = theme.secondaryColor || (isBlueGreen ? '#002200' : '#221100');
  
  const mainFontClass = "font-lcd italic";
  const pidFontClass = "font-tech tracking-wider";

  // Render a segmented bar
  const renderSegmentedBar = (percent: number, segments: number = 40) => {
    return (
      <div className="flex gap-[0.5cqw] w-full h-full">
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = (i / segments) * 100 < percent;
          return (
            <div 
              key={i} 
              className="flex-1 h-full skew-x-[-15deg] transition-none"
              style={{ 
                backgroundColor: isActive ? primary : secondary,
                boxShadow: isActive ? `0 0 15px ${primary}80` : 'none',
                opacity: isActive ? 1 : 0.3
              }}
            />
          );
        })}
      </div>
    );
  };

  const pids = [
    { label: 'TEMP', val: Math.round(data?.coolantTemp || 0), unit: '°F', color: primary },
    { label: 'OIL_P', val: Math.round(data?.oilPressure || 0), unit: 'PSI', color: primary },
    { label: 'BOOST', val: (data?.boost || 0.0).toFixed(1), unit: 'PSI', color: primary },
    { label: 'FUEL', val: Math.round(data?.fuelLevel || 0), unit: '%', color: primary },
    { label: 'BATT', val: (data?.batteryVolts || 12.4).toFixed(1), unit: 'V', color: primary },
    { label: 'LOAD', val: Math.round(data?.engineLoad || 0), unit: '%', color: primary },
  ];

  return (
    <div className={`w-full h-full p-[2cqh] relative overflow-hidden bg-black flex flex-col items-stretch ${theme.fontFamily || 'font-tech'}`} style={{ containerType: 'size' }}>
      {/* CRT Aperture Grille & Shadow Mask simulation for extreme cathode depth */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_3px,9px_100%] pointer-events-none z-30 mix-blend-screen opacity-70" />
      
      {/* Dynamic ambient cathode glow wash */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.12]" style={{ background: `radial-gradient(circle at center, ${primary} 0%, transparent 65%)` }} />
      
      {/* Luxurious slanted glass face glare */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-white/0 to-white/1 opacity-50 z-30 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 75%)' }} />

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* TOP: RPM BAR */}
      <div className="h-[15cqh] w-full flex flex-col mb-[2cqh]">
        <div className="flex justify-between items-end mb-1 px-[1cqw]">
          <span className={`text-[2.5cqh] font-black italic tracking-[1em]`} style={{ color: primary }}>RPM x1000</span>
          <div className="flex gap-[4cqw] text-[2cqh] font-black italic text-white/40">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <span key={num} style={{ color: currentRpm > num * 1000 ? primary : undefined }}>{num}</span>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-black border-2 border-white/10 p-[0.5cqh] rounded-sm">
          {renderSegmentedBar(rpmPercent)}
        </div>
      </div>

      {/* MIDDLE: SPEED & GEAR */}
      <div className="flex-1 flex items-center justify-between gap-[4cqw]">
        {/* Left PIDs */}
        <div className="w-[20cqw] flex flex-col gap-[1.5cqh]">
          {pids.slice(0, 3).map((pid, i) => (
            <div key={i} className="bg-black/40 border-l-4 border-white/10 p-[1.2cqw] flex flex-col items-start" style={{ borderColor: primary }}>
              <span className={`text-[1.5cqh] ${pidFontClass} text-white/50 mb-0.5 uppercase tracking-widest`}>{pid.label}</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-[4.5cqh] ${mainFontClass} tabular-nums leading-none`} style={{ color: primary, textShadow: `0 0 10px ${primary}80` }}>{pid.val}</span>
                <span className="text-[1.8cqh] font-black text-white/30 uppercase">{pid.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center: BIG SPEED */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" style={{ color: primary }} />
          <div className="flex flex-col items-center">
            <span className={`text-[2cqh] font-black italic tracking-[0.5em] text-white/40 mb-[-2cqh] uppercase`}>Digital Velocity</span>
            <span className={`text-[28cqh] ${mainFontClass} tabular-nums leading-none min-w-[3ch] text-center`} style={{ color: primary, textShadow: `0 0 30px ${primary}` }}>
              {speedVal.toString().padStart(3, '\u00a0')}
            </span>
            <span className={`text-[4cqh] font-black italic tracking-[0.2em] text-white/60 mt-[-2cqh]`}>MPH</span>
          </div>
        </div>

        {/* Right Gear & PIDs */}
        <div className="w-[18cqw] flex flex-col gap-[1.5cqh] items-end">
          <div className="bg-black/40 border-r-4 border-white/10 p-[0.3cqw] flex flex-col items-center w-[75%] self-end" style={{ borderColor: primary }}>
            <span className={`text-[0.8cqh] ${pidFontClass} text-white/50 mb-0.5 uppercase tracking-widest`}>GEAR</span>
            <span className={`text-[2.2cqh] ${mainFontClass} leading-none`} style={{ color: primary, textShadow: `0 0 10px ${primary}` }}>{gear || 'N'}</span>
          </div>
          {pids.slice(3, 6).map((pid, i) => (
            <div key={i} className="bg-black/40 border-r-4 border-white/10 p-[1.2cqw] flex flex-col items-end w-full" style={{ borderColor: primary }}>
              <span className={`text-[1.5cqh] ${pidFontClass} text-white/50 mb-0.5 uppercase tracking-widest`}>{pid.label}</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-[4.5cqh] ${mainFontClass} tabular-nums leading-none`} style={{ color: primary, textShadow: `0 0 10px ${primary}80` }}>{pid.val}</span>
                <span className="text-[1.8cqh] font-black text-white/30 uppercase">{pid.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM: WARNINGS & TICKER */}
      <div className="h-[12cqh] w-full flex items-center justify-between border-t-2 border-white/10 mt-[2cqh] pt-[1cqh]">
        <div className="flex gap-[2cqw] items-center">
          <WarningLights lights={data?.warningLights || {}} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[1.5cqh] font-black text-white/40 tracking-widest uppercase mb-1">System Diagnostics</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-4 h-1 rounded-full" style={{ backgroundColor: primary, opacity: 0.1 + (i * 0.1) }} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[100] h-[3cqh]">
        <Ticker data={data} navState={navState} theme={theme} className="w-full h-full" />
      </div>
    </div>
  );
};
