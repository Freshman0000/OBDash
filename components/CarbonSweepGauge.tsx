import { Ticker } from "./Ticker";
import React, { useMemo } from "react";
import { GaugeProps, ResponsiveValue } from "./Gauge";
import {
  Thermometer,
  Droplets,
  Battery,
  Activity,
  Zap,
  Shield,
  Compass,
  Disc,
  Cpu,
} from "lucide-react";
import { WarningLights } from "../App";

export const CarbonSweepGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, navState, theme }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);
    const speedPercent = Math.min(100, ((speed || 0) / 160) * 100); // Scale to 160 MPH

    const primary = theme.primaryColor || "#0ea5e9";
    const accent = theme.accentColor || "#ff0055";
    const bg = theme.backgroundColor || "#04060a";

    // Math variables for Gauges
    const speedVal = Math.round(speed || 0);
    const rpmVal = Math.min(9999, Math.round(data?.rpm ?? value * 1000));

    const getBgClass = () => {
      switch (theme.texture) {
        case "carbon-forged":
        case "carbon-weave":
          return "texture-carbon";
        case "hex-grid":
          return "texture-hex";
        case "brushed":
          return "texture-brushed";
        case "machined":
          return "bg-[repeating-radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_2px,transparent_2px,transparent_6px)]";
        case "piano-black":
          return "bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_50%)]";
        default:
          return "texture-carbon";
      }
    };

    return (
      <div
        className={`w-full h-full relative overflow-hidden flex flex-col justify-between p-[1.5cqh] ${theme.fontFamily || "font-tech"} text-white select-none ${theme.overlay ? "brightness-110 saturate-125" : ""}`}
        style={{ backgroundColor: bg, containerType: "size" }}
      >
        {/* 1. LAYERED BACKGROUNDS FOR DEPTH PART 1 */}
        <div
          className={`absolute inset-0 mix-blend-screen opacity-30 z-0 ${getBgClass()}`}
        />

        {/* 3D Vignette Framing */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.9)_100%)] z-1 pointer-events-none" />

        {/* Sliding HUD ambient line for micro-movement */}
        <div className="absolute inset-0 z-1 pointer-events-none opacity-20 overflow-hidden">
          <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4cqw_4cqh] transform rotate-12" />
          <div className="w-full h-[1cqh] bg-white/15 blur-[3cqh] absolute top-0 left-0 animate-[scan_8s_linear_infinite]" />
        </div>

        {/* Extreme border markings (mounting plates / luxury bezels) */}
        <div
          className="absolute top-2 left-2 w-4 h-4 border-t border-l opacity-20 pointer-events-none z-10"
          style={{ borderColor: primary }}
        />
        <div
          className="absolute top-2 right-2 w-4 h-4 border-t border-r opacity-20 pointer-events-none z-10"
          style={{ borderColor: primary }}
        />
        <div
          className="absolute bottom-2 left-2 w-4 h-4 border-b border-l opacity-20 pointer-events-none z-10"
          style={{ borderColor: primary }}
        />
        <div
          className="absolute bottom-2 right-2 w-4 h-4 border-b border-r opacity-20 pointer-events-none z-10"
          style={{ borderColor: primary }}
        />

        {/* Decorative mechanical corner screws */}
        {[
          { top: "1.5cqh", left: "1.5cqw" },
          { top: "1.5cqh", right: "1.5cqw" },
          { bottom: "1.5cqh", left: "1.5cqw" },
          { bottom: "1.5cqh", right: "1.5cqw" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-[1.2cqh] h-[1.2cqh] rounded-full bg-gradient-to-br from-gray-500 to-gray-800 border border-black shadow-[0_1px_3px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.4)] z-20 flex items-center justify-center pointer-events-none opacity-30"
            style={pos}
          >
            <div className="w-[60%] h-[15%] bg-black/60 rotate-[40deg] rounded-sm" />
          </div>
        ))}

        {/* 2. TOP BANNER HEADER */}
        <div className="h-[7cqh] flex items-center justify-between px-[3cqw] border-b border-white/5 relative z-40 bg-black/40 backdrop-blur-md shrink-0 rounded-t-lg">
          <div className="flex items-center gap-[1cqw]">
            <Cpu
              size="1.8cqh"
              className="animate-pulse"
              style={{ color: primary }}
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-[1.5cqh] tracking-[0.3em] text-white">
                DUAL CIRCULAR TELEMETRY COCKPIT
              </span>
              <span className="text-[0.9cqh] tracking-[0.1em] text-slate-400">
                ENGINE OS: v9.2 // BUS STATE: SECURE_120HZ
              </span>
            </div>
          </div>

          <div className="flex gap-[3cqw] items-center text-[1.2cqh] font-bold tracking-[0.15em] text-slate-400">
            <span>
              FUEL RANGE:{" "}
              <b style={{ color: primary }}>
                {Math.round(data?.fuelLevel || 0)}%
              </b>
            </span>
            <span>
              INTAKE TEMP:{" "}
              <b className="text-white">
                {Math.round(data?.intakeAirTemp || 24)}°C
              </b>
            </span>
            <span>
              SYSTEM: <b className="text-emerald-400">ACTIVE</b>
            </span>
          </div>
        </div>
        {/* 3. CORE DUAL CIRCULAR DIALS CONTAINER */}
        <div className="flex-1 w-full flex items-center justify-center relative z-20 px-[2cqw] py-[1cqh] min-h-0 gap-[4cqw]">
          {/* ==================== LEFT DIAL: TACHOMETER (RPM + PID GROUP) ==================== */}
          <div className="flex-1 max-w-[44cqw] aspect-square relative flex items-center justify-center p-[2.5cqw] rounded-full bg-gradient-to-b from-[#090b11]/85 to-[#000205]/95 border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_4px_12px_rgba(255,255,255,0.05)] backdrop-blur-xl group/left hover:scale-[1.01] transition-transform duration-500">
            {/* Outer Circular Glow Accent Rim */}
            <div
              className="absolute inset-[-4px] rounded-full border border-dashed opacity-25 pointer-events-none group-hover/left:opacity-40 transition-opacity"
              style={{ borderColor: primary }}
            />
            {/* Dial Bezel Glare glass reflection */}
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.02)_100%)] pointer-events-none z-30" />

            {/* SVG Arc Sweep - RPM Scale */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full p-2 -rotate-90 pointer-events-none z-20"
            >
              {/* Background Track Circle Arc */}
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="8"
                strokeDasharray="527.7"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="6"
              />

              {/* Active Sweeping Circular Path (Vibrant Primary Gradient) */}
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke={primary}
                strokeWidth="6"
                strokeDasharray="527.7"
                strokeDashoffset={527.7 * (1 - (rpmPercent * 0.7) / 100)}
                strokeLinecap="round"
                className="transition-all duration-300 drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]"
                style={{
                  transformOrigin: "center",
                  transform: "rotate(-44deg)",
                }}
              />

              {/* Tachometer markings & tick rings */}
              {Array.from({ length: 37 }).map((_, i) => {
                const angle = (i / 36) * 250 - 35; // 250 degree arc
                const rad = (angle * Math.PI) / 180;
                const isMajor = i % 4 === 0;
                const x1 = 100 + Math.cos(rad) * 78;
                const y1 = 100 + Math.sin(rad) * 78;
                const x2 = 100 + Math.cos(rad) * (isMajor ? 70 : 74);
                const y2 = 100 + Math.sin(rad) * (isMajor ? 70 : 74);
                const activeClass = (i / 36) * 100 <= rpmPercent;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={activeClass ? primary : "rgba(255,255,255,0.15)"}
                    strokeWidth={isMajor ? 1.5 : 0.8}
                  />
                );
              })}
            </svg>

            {/* INTEGRATED DIAL CORE INFO - Symmetrical Porsche-style luxury Cockpit layout */}
            <div className="absolute inset-[11%] rounded-full bg-gradient-to-b from-[#0b0e14] to-[#010306] z-10 border border-white/10 shadow-[inset_0_4px_24px_rgba(0,0,0,0.85)] relative overflow-hidden">
              {/* Top RPM text heading */}
              <div className="absolute top-[10%] inset-x-0 flex flex-col items-center">
                <span className="text-[0.8cqh] tracking-[0.3em] uppercase text-slate-500 font-extrabold">
                  TACHOMETER
                </span>
                <span
                  className="text-[2.2cqh] font-extrabold leading-none text-white tabular-nums tracking-wider mt-0.5"
                  style={{ textShadow: `0 0 10px ${primary}` }}
                >
                  {rpmVal} <b className="text-[1cqh] opacity-65 font-bold">RPM</b>
                </span>
              </div>

              {/* Upper-Left Widget (COOLANT) */}
              <div className="absolute top-[21%] left-[13%] flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-[4.2cqh] h-[4.2cqh] -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      fill="none"
                      stroke={primary}
                      strokeWidth="2.5"
                      strokeDasharray="81.6"
                      strokeDashoffset={81.6 - (81.6 * Math.min(120, Math.round(data?.coolantTemp || 92))) / 120}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Thermometer size="1.4cqh" style={{ color: primary }} />
                  </div>
                </div>
                <span className="text-[0.7cqh] text-slate-500 font-extrabold tracking-wider uppercase mt-1">H2O</span>
                <span className="text-[1.2cqh] font-black text-white tabular-nums">{Math.round(data?.coolantTemp || 92)}°C</span>
              </div>

              {/* Upper-Right Widget (OIL TEMP) */}
              <div className="absolute top-[21%] right-[13%] flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-[4.2cqh] h-[4.2cqh] -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      fill="none"
                      stroke={primary}
                      strokeWidth="2.5"
                      strokeDasharray="81.6"
                      strokeDashoffset={81.6 - (81.6 * Math.min(150, Math.round(data?.oilTemp || 98))) / 150}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets size="1.4cqh" style={{ color: primary }} />
                  </div>
                </div>
                <span className="text-[0.7cqh] text-slate-500 font-extrabold tracking-wider uppercase mt-1">OIL TEMP</span>
                <span className="text-[1.2cqh] font-black text-white tabular-nums">{Math.round(data?.oilTemp || 98)}°C</span>
              </div>

              {/* Center Gear Selector - ENLARGED DRIVER CENTRAL FOCUS */}
              <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-[8.2cqh] h-[8.2cqh] rounded-full border border-dashed opacity-15 border-white animate-[spin_12s_linear_infinite]" />
                  <div className="absolute w-[9.2cqh] h-[9.2cqh] rounded-full border border-white/5" />
                  <div className="w-[7.2cqh] h-[7.2cqh] rounded-full flex flex-col items-center justify-center bg-black/60 border border-white/10 shadow-lg">
                    <span className="text-[4.2cqh] font-black italic text-white leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                      {gear || "N"}
                    </span>
                    <span className="text-[0.7cqh] font-black text-slate-400 tracking-[0.12em] uppercase -mt-0.5">
                      GEAR
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Widget (ENGINE LOAD - Curved linear fit at bottom center) */}
              <div className="absolute bottom-[8%] inset-x-0 flex flex-col items-center">
                <span className="text-[0.75cqh] text-slate-500 font-extrabold tracking-widest uppercase mb-1">
                  ENGINE LOAD
                </span>
                <div className="w-[11cqw] h-[0.7cqh] bg-white/5 border border-white/10 rounded-full overflow-hidden p-[1px] relative flex">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(data?.engineLoad || 22)}%`,
                      backgroundColor: primary,
                      boxShadow: `0 0 6px ${primary}`,
                    }}
                  />
                </div>
                <span className="text-[1.1cqh] font-extrabold text-slate-300 mt-1 tabular-nums">
                  {Math.round(data?.engineLoad || 22)}%
                </span>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT DIAL: SPEEDOMETER (SPEED + PID GROUP) ==================== */}
          <div className="flex-1 max-w-[44cqw] aspect-square relative flex items-center justify-center p-[2.5cqw] rounded-full bg-gradient-to-b from-[#090b11]/85 to-[#000205]/95 border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_4px_12px_rgba(255,255,255,0.05)] backdrop-blur-xl group/right hover:scale-[1.01] transition-transform duration-500">
            {/* Outer Circular Glow Accent Rim */}
            <div
              className="absolute inset-[-4px] rounded-full border border-dashed opacity-25 pointer-events-none group-hover/right:opacity-40 transition-opacity"
              style={{ borderColor: accent }}
            />
            {/* Dial Bezel Glare glass reflection */}
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.02)_100%)] pointer-events-none z-30" />

            {/* SVG Arc Sweep - Speed Scale */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full p-2 -rotate-90 pointer-events-none z-20"
            >
              {/* Background Track Circle Arc */}
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="8"
                strokeDasharray="527.7"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="6"
              />

              {/* Active Sweeping Circular Path (Vibrant Accent Gradient) */}
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke={accent}
                strokeWidth="6"
                strokeDasharray="527.7"
                strokeDashoffset={527.7 * (1 - (speedPercent * 0.7) / 100)}
                strokeLinecap="round"
                className="transition-all duration-300 drop-shadow-[0_0_12px_rgba(255,0,85,0.8)]"
                style={{
                  transformOrigin: "center",
                  transform: "rotate(-44deg)",
                }}
              />

              {/* Speedometer markings & tick rings */}
              {Array.from({ length: 17 }).map((_, i) => {
                const angle = (i / 16) * 250 - 35; // 250 degree arc
                const rad = (angle * Math.PI) / 180;
                const isMajor = i % 2 === 0;
                const x1 = 100 + Math.cos(rad) * 78;
                const y1 = 100 + Math.sin(rad) * 78;
                const x2 = 100 + Math.cos(rad) * (isMajor ? 70 : 74);
                const y2 = 100 + Math.sin(rad) * (isMajor ? 70 : 74);
                const activeClass = (i / 16) * 100 <= speedPercent;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={activeClass ? accent : "rgba(255,255,255,0.15)"}
                    strokeWidth={isMajor ? 1.5 : 0.8}
                  />
                );
              })}
            </svg>

            {/* INTEGRATED DIAL CORE INFO - Symmetrical Speedometer Cockpit layout */}
            <div className="absolute inset-[11%] rounded-full bg-gradient-to-b from-[#0b0e14] to-[#010306] z-10 border border-white/10 shadow-[inset_0_4px_24px_rgba(0,0,0,0.85)] relative overflow-hidden">
              {/* Top Speed heading */}
              <div className="absolute top-[10%] inset-x-0 flex flex-col items-center">
                <span className="text-[0.8cqh] tracking-[0.3em] uppercase text-slate-500 font-extrabold">
                  SPEEDOMETER
                </span>
                <span className="text-[1.8cqh] font-extrabold text-slate-300 tracking-widest mt-0.5 truncate max-w-[80%] text-center">
                  {(speedVal * 2.1 + 95).toFixed(0)}° N
                </span>
              </div>

              {/* Upper-Left Widget (BATTERY) */}
              <div className="absolute top-[21%] left-[13%] flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-[4.2cqh] h-[4.2cqh] -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      fill="none"
                      stroke={accent}
                      strokeWidth="2.5"
                      strokeDasharray="81.6"
                      strokeDashoffset={81.6 - (81.6 * Math.min(16, data?.voltage || data?.batteryVolts || 13.8)) / 16}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Battery size="1.4cqh" style={{ color: accent }} />
                  </div>
                </div>
                <span className="text-[0.7cqh] text-slate-500 font-extrabold tracking-wider uppercase mt-1">SYSTEM V</span>
                <span className="text-[1.2cqh] font-black text-white tabular-nums">{(data?.voltage || data?.batteryVolts || 13.8).toFixed(1)}V</span>
              </div>

              {/* Upper-Right Widget (OIL PRESSURE) */}
              <div className="absolute top-[21%] right-[13%] flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-[4.2cqh] h-[4.2cqh] -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      fill="none"
                      stroke={accent}
                      strokeWidth="2.5"
                      strokeDasharray="81.6"
                      strokeDashoffset={81.6 - (81.6 * Math.min(100, Math.round(data?.oilPressure || 45))) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity size="1.4cqh" style={{ color: accent }} />
                  </div>
                </div>
                <span className="text-[0.7cqh] text-slate-500 font-extrabold tracking-wider uppercase mt-1">OIL PSI</span>
                <span className="text-[1.2cqh] font-black text-white tabular-nums">{Math.round(data?.oilPressure || 45)} PSI</span>
              </div>

              {/* Center Speed Value - ENLARGED TO THE MAXIMUM FOR SUPREME LEGIBILITY */}
              <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-[9.5cqh] h-[9.5cqh] rounded-full border border-dashed opacity-15 border-red-500 animate-[spin_16s_linear_infinite]" />
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className="text-[6.8cqh] font-black italic leading-none text-white tabular-nums"
                      style={{ textShadow: `0 0 15px ${accent}60` }}
                    >
                      <ResponsiveValue value={speedVal} theme={theme} />
                    </span>
                    <span className="text-[1.1cqh] font-black text-red-500 tracking-[0.22em] -mt-1 uppercase animate-pulse">
                      MPH
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Widget (BOOST PRESSURE) */}
              <div className="absolute bottom-[8%] inset-x-0 flex flex-col items-center">
                <span className="text-[0.75cqh] text-slate-500 font-extrabold tracking-widest uppercase mb-1">
                  BOOST PRESSURE
                </span>
                <div className="w-[11cqw] h-[0.7cqh] bg-white/5 border border-white/10 rounded-full overflow-hidden p-[1px] relative flex">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((data?.boost || 0.0) / 25) * 100)}%`,
                      backgroundColor: accent,
                      boxShadow: `0 0 6px ${accent}`,
                    }}
                  />
                </div>
                <span className="text-[1.1cqh] font-extrabold text-[#f43f5e] mt-1 tabular-nums">
                  {(data?.boost || 0.0).toFixed(1)} PSI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. REFINED BOTTOM TELEMETRY BAR */}
        <div className="h-[9cqh] flex items-center justify-between px-[3cqw] border-t border-white/5 bg-black/40 backdrop-blur-md shrink-0 rounded-b-lg">
          <div className="flex items-center gap-[3.5cqw] text-[1.4cqh] font-bold">
            <span className="flex items-center gap-2 text-slate-400">
              <Compass size="1.6cqh" style={{ color: primary }} />
              HEADING:{" "}
              <b className="text-white">
                {(speedVal * 2.1 + 95).toFixed(0)}° N
              </b>
            </span>
            <span className="flex items-center gap-2 text-slate-400">
              <Shield size="1.6cqh" style={{ color: accent }} />
              DRAG STRIP STATUS:{" "}
              <b className="text-emerald-400 animate-pulse">OPTIMIZED</b>
            </span>
          </div>

          {/* Warning lights embedded */}
          <div className="scale-90">
            <WarningLights data={data} />
          </div>

          <div className="flex items-baseline gap-[1cqw] text-right">
            <span className="text-[1.1cqh] tracking-widest text-slate-400 uppercase font-black">
              TOTAL ODO
            </span>
            <span className="text-[2.2cqh] font-black text-white tabular-nums tracking-wide">
              288,045{" "}
              <b className="text-[1.2cqh] font-bold text-slate-400 font-mono">
                MI
              </b>
            </span>
          </div>
        </div>

        {/* 5. SLIDING SUB-INFOBUS TICKER */}
        <div className="absolute inset-x-0 bottom-0 z-[100] h-[3cqh]">
          <Ticker
            data={data}
            navState={navState}
            theme={theme}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  },
);
