import React from "react";
import { GaugeProps, ResponsiveValue, PidBox, WarningLights } from "./Gauge";
import { Battery, Zap, Navigation as NavIcon, Wind, Compass, MapPin } from "lucide-react";

export const ModernEVGauge: React.FC<GaugeProps> = ({ value, speed, gear, data, navState, theme }) => {
  const speedVal = Math.round(speed || 0);
  // Using RPM to fake Power / Regen % for EV
  const powerVal = Math.min(100, Math.max(-100, (value / 9) * 100 - 15)); // -15 to +85 power bounds
  const isRegen = powerVal < 0;
  
  const soc = Math.min(100, Math.max(0, (((data?.batteryVolts || 12) - 10) / 4) * 100)); // Fake SoC from voltage
  const range = Math.round((soc / 100) * 320); // 320 max range

  const primary = theme.primaryColor || "#38bdf8";
  const secondary = theme.secondaryColor || "#1e293b";
  const accent = theme.accentColor || "#a78bfa";
  const bg = theme.backgroundColor || "#0f172a";
  const isGlow = theme.glowEffect;

  const powerColor = isRegen ? "#10b981" : primary;
  const powerRadius = 250;
  const powerCircumference = 2 * Math.PI * powerRadius;
  const powerOffset = powerCircumference - (Math.abs(powerVal) / 100) * (powerCircumference * 0.7);

  return (
    <div
      className={`relative w-full h-full p-4 overflow-hidden rounded-[2cqh] ${theme.texture ? `texture-${theme.texture}` : ""}`}
      style={{
        backgroundColor: bg,
        fontFamily: theme.fontFamily || "sans-serif",
        boxShadow: isGlow ? `inset 0 0 100px ${primary}33` : "none",
        color: "#ffffff"
      }}
    >
      {/* Background soft lighting */}
      {isGlow && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full mix-blend-screen opacity-20 blur-[100px]" style={{ backgroundColor: primary }}></div>
        </div>
      )}

      {/* Top Bar: Nav Next Action & Warning Lights */}
      <div className="absolute top-[5cqh] left-[5cqw] right-[5cqw] flex justify-between items-start z-20">
        <div className="flex items-center gap-[2cqw] bg-black/40 backdrop-blur-md px-[2cqw] py-[1cqh] rounded-[1cqh] border border-white/5">
          <NavIcon size={24} className="text-white/70" />
          <div className="flex flex-col">
            <span className="text-[1.2cqh] font-medium text-white/50 tracking-wider">NAV NEXT</span>
            <span className="text-[2cqh] font-bold tracking-wide">{navState?.nextInstruction || "Head North"}</span>
          </div>
          <span className="text-[2.5cqh] font-black text-white/90 ml-[2cqw]">
            {navState?.distanceToNext || "1.2 mi"}
          </span>
        </div>
        <WarningLights data={data} className="scale-75 origin-top-right bg-transparent border-none" />
      </div>

      {/* Left Panel: Battery Info */}
      <div className="absolute top-1/2 left-[5cqw] -translate-y-1/2 flex flex-col gap-[3cqh] z-20">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2cqh] p-[2cqh] flex flex-col items-center w-[15cqw]">
          <Battery size={32} color={soc < 20 ? "#ef4444" : primary} className="mb-[1cqh]" />
          <span className="text-[1.5cqh] text-white/50 font-bold tracking-widest">STATE OF CHARGE</span>
          <span className="text-[4cqh] font-black" style={{ color: soc < 20 ? "#ef4444" : "#ffffff" }}>
            {Math.round(soc)}%
          </span>
          {/* Visual Battery Bar */}
          <div className="w-full h-[1cqh] bg-black/50 rounded-full mt-[2cqh] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${soc}%`, backgroundColor: soc < 20 ? "#ef4444" : primary }} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2cqh] p-[2cqh] flex pl-[3cqw] flex-col justify-center w-[15cqw]">
          <span className="text-[1.5cqh] text-white/50 font-bold tracking-widest">EST RANGE</span>
          <span className="text-[3.5cqh] font-black">{range} <span className="text-[1.5cqh] text-white/50">mi</span></span>
          <span className="text-[1.2cqh] text-white/40 mt-[1cqh]">Avg {powerVal > 0 ? "312 Wh/mi" : "-10 Wh/mi"}</span>
        </div>
      </div>

      {/* Right Panel: EV PIDs */}
      <div className="absolute top-1/2 right-[5cqw] -translate-y-1/2 flex flex-col gap-[2cqh] z-20 w-[15cqw]">
         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2cqh] p-[1.5cqh] flex gap-[2cqw] items-center">
            <Zap size={24} color={accent} opacity={0.7} />
            <div className="flex flex-col">
              <span className="text-[1.2cqh] font-bold text-white/50 tracking-wider">MOTOR TEMP</span>
              <span className="text-[2.2cqh] font-bold">{Math.round(data?.coolantTemp || 110)} °F</span>
            </div>
         </div>
         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2cqh] p-[1.5cqh] flex gap-[2cqw] items-center">
            <Wind size={24} color={accent} opacity={0.7} />
            <div className="flex flex-col">
              <span className="text-[1.2cqh] font-bold text-white/50 tracking-wider">BATTERY TEMP</span>
              <span className="text-[2.2cqh] font-bold">{Math.round(data?.intakeAirTemp || 85)} °F</span>
            </div>
         </div>
         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2cqh] p-[1.5cqh] flex gap-[2cqw] items-center">
            <MapPin size={24} color={accent} opacity={0.7} />
            <div className="flex flex-col">
              <span className="text-[1.2cqh] font-bold text-white/50 tracking-wider">EFFICIENCY</span>
              <span className="text-[2.2cqh] font-bold">{(4.2 - (data?.engineLoad ? (data.engineLoad - 30) / 70 : 0) + (speed > 60 ? -0.5 : 0.2)).toFixed(1)} mi/kWh</span>
            </div>
         </div>
      </div>

      {/* Central Speed / Power Cluster */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10">
        {/* SVG Power Sweep */}
        <div className="absolute w-[80cqh] h-[80cqh]">
          <svg viewBox="0 0 600 600" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id="powerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={powerColor} stopOpacity={1} />
                <stop offset="100%" stopColor={accent} stopOpacity={1} />
              </linearGradient>
            </defs>
            {/* Background Arc */}
            <circle
              cx="300"
              cy="300"
              r={powerRadius}
              fill="none"
              stroke={secondary}
              strokeWidth="6"
              strokeDasharray={powerCircumference}
              strokeDashoffset={powerCircumference * 0.3}
              transform="rotate(144, 300, 300)"
              className="opacity-40"
            />
            {/* Foreground Arc */}
            <circle
              cx="300"
              cy="300"
              r={powerRadius}
              fill="none"
              stroke="url(#powerGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={powerCircumference}
              strokeDashoffset={powerOffset}
              transform={isRegen ? "rotate(144, 300, 300) scale(1, -1) translate(0, -600)" : "rotate(144, 300, 300)"}
              className="transition-all duration-300 ease-out"
              style={{
                 filter: isGlow ? `drop-shadow(0 0 10px ${powerColor})` : "none"
              }}
            />
            {/* Tick Marks */}
            {Array.from({ length: 41 }).map((_, i) => {
              const angle = 144 + i * (252 / 40); // 132 to 384 degrees
              const x1 = 300 + (powerRadius - 20) * Math.cos((angle * Math.PI) / 180);
              const y1 = 300 + (powerRadius - 20) * Math.sin((angle * Math.PI) / 180);
              const x2 = 300 + powerRadius * Math.cos((angle * Math.PI) / 180);
              const y2 = 300 + powerRadius * Math.sin((angle * Math.PI) / 180);
              const isMajor = i % 10 === 0;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? "#ffffff" : "#ffffff40"}
                  strokeWidth={isMajor ? "4" : "2"}
                />
              );
            })}
          </svg>
        </div>

        {/* Speed Digital Readout */}
        <div className="flex flex-col items-center mt-[4cqh] pointer-events-auto">
          <span className="text-[2.5cqh] font-bold text-white/50 tracking-[0.3em] uppercase mb-[1cqh]">SPEED</span>
          <div className="text-[16cqh] leading-none font-black tracking-tighter" style={{ textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <ResponsiveValue value={speedVal} theme={theme} />
          </div>
          <span className="text-[3cqh] font-bold text-white/50 mt-[1cqh]">MPH</span>
          
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-[3cqw] py-[1cqh] mt-[4cqh] flex items-center gap-[2cqw]">
             <span className="text-[1.8cqh] font-black uppercase text-white/50 tracking-wider">POWER</span>
             <span className="text-[2.2cqh] font-black" style={{ color: powerColor }}>{Math.abs(Math.round(powerVal))} %</span>
          </div>
        </div>
      </div>

      {/* Bottom Center: Gear Indicator */}
      <div className="absolute bottom-[8cqh] left-1/2 -translate-x-1/2 flex gap-[2cqw] bg-black/40 backdrop-blur-md rounded-full px-[3cqw] py-[1cqh] border border-white/10">
        {["P", "R", "N", "D"].map((g, i) => {
          const isActive = 
            (gear === 0 && g === "P") ||
            (gear === -1 && g === "R") ||
            (gear === 1 && g === "N") ||
            (gear > 1 && g === "D");
          return (
            <div
              key={g}
              className={`text-[3cqh] font-black w-[4cqh] h-[4cqh] flex items-center justify-center rounded-full transition-all ${isActive ? "bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "text-white/30"}`}
            >
              {g}
            </div>
          );
        })}
      </div>
    </div>
  );
};
