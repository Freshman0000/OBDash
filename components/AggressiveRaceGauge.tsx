import React from "react";
import { motion } from "motion/react";
import { GaugeProps, ResponsiveValue } from "./Gauge";
import { Ticker } from "./Ticker";
import {
  Thermometer,
  Droplets,
  Battery,
  Activity,
  Zap,
  Cpu,
} from "lucide-react";
import { WarningLights } from "../App";

export const AggressiveRaceGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, navState, theme }) => {
    const currentRpm = data?.rpm ?? value * 1000;
    const rpmPercent = Math.min(100, (currentRpm / 8000) * 100);
    const speedVal = Math.round(speed || 0);
    const speedPercent = Math.min(100, (speedVal / 160) * 100);

    const primary = theme.primaryColor || "#ef4444";
    const accent = theme.accentColor || "#fbbf24";

    // Adjusted colors for aggressive look
    const darkBg = "#050505";

    // Circumference for the side sweeps (half circles)
    const radius = 210;
    const circumference = Math.PI * radius; // Semi-circle

    // Fast transitions for high-frequency data - now refined to avoid jitter
    const ultraFastTransition = "transition-all duration-0 ease-linear"; // Already LERPed in parent
    const smoothTransition = "transition-all duration-300 ease-out";

    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-[#000] text-white ${theme.fontFamily || "font-tech"} selection:bg-red-500/30`}
        style={{ containerType: "size" }}
      >
        {/* Background Texture Layers */}
        <div className="absolute inset-0 texture-carbon opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(239,68,68,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black via-black/90 to-transparent z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_20%,rgba(0,0,0,1)_98%)]" />

        {/* High-Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

        {/* Micro-Mesh Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:4px_4px]" />

        {/* Structural Elements (Aggressive Machined Accents) */}
        <div className="absolute inset-[1.5cqh] border border-white/[0.03] rounded-[1cqh] pointer-events-none z-10" />
        <div className="absolute inset-0 border-[3cqh] border-black pointer-events-none z-50 rounded-[1cqh] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />

        {/* Racing Stripes */}
        <div className="absolute top-0 right-0 w-[40cqw] h-[200cqh] bg-red-600/[0.03] rotate-45 -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-[-50%] left-[10%] w-[10cqw] h-[200%] bg-gradient-to-r from-transparent via-red-600/[0.05] to-transparent rotate-12 pointer-events-none" />

        {/* Danger Hatch Pattern (Top corners) */}
        <div className="absolute top-0 left-0 w-[15cqw] h-[4cqh] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)] border-b border-r border-red-600/20" />
        <div className="absolute top-0 right-0 w-[15cqw] h-[4cqh] bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)] border-b border-l border-red-600/20" />

        {/* Decorative Screws for Aggressive Look */}
        {[
          { top: "3cqh", left: "3cqw" },
          { top: "3cqh", right: "3cqw" },
          { bottom: "3cqh", left: "3cqw" },
          { bottom: "3cqh", right: "3cqw" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-[1.5cqh] h-[1.5cqh] rounded-full bg-neutral-800 border border-black shadow-[0_2px_4px_black,inset_0_1px_1px_rgba(255,255,255,0.2)] z-30"
            style={pos}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[60%] h-[15%] bg-black/40 rotate-45 rounded-full" />
            </div>
          </div>
        ))}

        {/* --- CENTER SECTION: THE ENGINE BOX --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] flex flex-col items-center z-20">
          {/* No background boxes here as requested: "remove the boxes in the middle behind the engine section" */}
          <div className="relative flex flex-col items-center">
            {/* Engine Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-[-1.5cqh] z-30 bg-black/40 px-6 py-1 rounded-t-lg border-t border-x border-white/10 backdrop-blur-sm"
            >
              <Cpu size="1.8cqh" className="text-red-500" />
              <span className="text-[1.8cqh] font-black tracking-[0.6em] text-red-500 uppercase drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                ENGINE
              </span>
            </motion.div>

            {/* RPM Digital */}
            <div className="relative group">
              <div className="absolute -inset-10 bg-red-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent w-full h-full animate-[scan-slow_4s_linear_infinite] pointer-events-none z-10" />
              <ResponsiveValue
                value={Math.round(currentRpm)}
                isRpm={true}
                className="text-[22cqh] font-black font-heavy text-white tabular-nums leading-none tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              />
            </div>

            {/* Speed Digital with Gear Overlay */}
            <div className="flex flex-col items-center mt-[1cqh]">
              <div className="flex items-baseline gap-2">
                <span className="text-[12cqh] font-black italic text-white/90 tabular-nums leading-none tracking-tighter drop-shadow-[0_5px_15px_black]">
                  {speedVal}
                </span>
                <span className="text-[2.5cqh] font-black text-red-600/60 tracking-widest uppercase">
                  MPH
                </span>
              </div>
              {/* Gear Indicator - Integrated below speed */}
              <div className="w-[12cqh] h-[12cqh] bg-red-600/10 border-2 border-red-600/40 rounded-xl flex items-center justify-center mt-2 shadow-[0_0_30px_rgba(239,68,68,0.1),inset_0_0_15px_rgba(239,68,68,0.05)]">
                <span className="text-[8cqh] font-black italic text-red-500 drop-shadow-[0_0_15px_currentColor]">
                  {gear || "N"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- LEFT SIDE: HALF CIRCLE GAUGE (RPM SWEEP) + NEW CIRCULAR PID GAUGES --- */}
        <div className="absolute left-[0cqw] top-1/2 -translate-y-1/2 w-[35cqw] h-[90cqh] flex items-center z-10">
          <svg
            viewBox="0 0 240 480"
            className="w-full h-full overflow-visible drop-shadow-[0_10px_30px_rgba(0,0,0,1)] px-4"
          >
            <defs>
              <linearGradient
                id="rpmGradAggressive"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="80%" stopColor="#ef4444" stopOpacity="1" />
                <stop offset="100%" stopColor="#ea3e3e" stopOpacity="1" />
              </linearGradient>
              <filter id="whiteGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* RPM Path (Half Circle) */}
            <path
              d="M 220 450 A 210 210 0 0 1 220 30"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="30"
            />
            {/* Inner Glow Background */}
            <path
              d="M 220 450 A 210 210 0 0 1 220 30"
              fill="none"
              stroke={primary}
              strokeWidth="40"
              className="opacity-[0.03] blur-[10px]"
            />
            <path
              d="M 220 450 A 210 210 0 0 1 220 30"
              fill="none"
              stroke="url(#rpmGradAggressive)"
              strokeWidth="24"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - rpmPercent / 100)}
              strokeLinecap="butt"
              className={ultraFastTransition}
              style={{ filter: "drop-shadow(0 0 12px rgba(239, 68, 68, 0.6))" }}
            />

            {/* Ticks & Numbers */}
            {Array.from({ length: 9 }).map((_, i) => {
              const angle = Math.PI / 2 + (i / 8) * Math.PI;
              const x1 = 220 - Math.cos(angle) * 195;
              const y1 = 240 + Math.sin(angle) * 195;
              const x2 = 220 - Math.cos(angle) * 220;
              const y2 = 240 + Math.sin(angle) * 220;
              return (
                <g key={i}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={i >= 7 ? "#ef4444" : "rgba(255,255,255,0.4)"}
                    strokeWidth="3"
                  />
                  <text
                    x={220 - Math.cos(angle) * 170}
                    y={240 + Math.sin(angle) * 170}
                    fill={i >= 7 ? "#ef4444" : "white"}
                    fontSize="24"
                    fontWeight="900"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="opacity-60"
                  >
                    {i}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* CIRCULAR GAUGES ON THE LEFT */}
          <div className="absolute left-[6cqw] top-1/2 -translate-y-1/2 flex flex-col gap-[3cqh] z-20">
            <CircularMiniGauge
              label="TEMP"
              value={Math.round(data?.coolantTemp || 0)}
              max={250}
              unit="°F"
              color={primary}
              icon={<Thermometer size={14} />}
              transitionClass={ultraFastTransition}
            />
            <CircularMiniGauge
              label="OIL"
              value={Math.round(data?.oilPressure || 40)}
              max={100}
              unit="PSI"
              color={accent}
              icon={<Activity size={14} />}
              transitionClass={ultraFastTransition}
            />
            <CircularMiniGauge
              label="BATT"
              value={(data?.voltage || 12.4).toFixed(1)}
              max={16}
              unit="V"
              color="#38bdf8"
              icon={<Zap size={14} />}
              transitionClass={ultraFastTransition}
            />
          </div>
        </div>

        {/* --- RIGHT SIDE: HALF CIRCLE GAUGE (SPEED SWEEP) + LARGE PIDs --- */}
        <div className="absolute right-[0cqw] top-1/2 -translate-y-1/2 w-[35cqw] h-[90cqh] flex items-center justify-end z-10">
          <svg
            viewBox="0 0 240 480"
            className="w-full h-full overflow-visible drop-shadow-[0_10px_30px_rgba(0,0,0,1)] px-4"
          >
            <defs>
              <linearGradient
                id="speedGradAggressive"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Speed Path (Half Circle) */}
            <path
              d="M 20 30 A 210 210 0 0 1 20 450"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="30"
            />
            {/* Inner Glow Background */}
            <path
              d="M 20 30 A 210 210 0 0 1 20 450"
              fill="none"
              stroke="#ffffff"
              strokeWidth="40"
              className="opacity-[0.03] blur-[10px]"
            />
            <path
              d="M 20 30 A 210 210 0 0 1 20 450"
              fill="none"
              stroke="url(#speedGradAggressive)"
              strokeWidth="24"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - speedPercent / 100)}
              strokeLinecap="butt"
              className={ultraFastTransition}
              style={{
                filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))",
              }}
            />

            {/* Ticks for Speed */}
            {Array.from({ length: 9 }).map((_, i) => {
              const angle = -Math.PI / 2 + (i / 8) * Math.PI;
              const x1 = 20 + Math.cos(angle) * 195;
              const y1 = 240 + Math.sin(angle) * 195;
              const x2 = 20 + Math.cos(angle) * 220;
              const y2 = 240 + Math.sin(angle) * 220;
              return (
                <g key={i}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="3"
                  />
                  <text
                    x={20 + Math.cos(angle) * 170}
                    y={240 + Math.sin(angle) * 170}
                    fill="white"
                    fontSize="24"
                    fontWeight="900"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="opacity-60"
                  >
                    {i * 20}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* LARGE PIDS ON THE RIGHT */}
          <div className="absolute right-[6cqw] top-1/2 -translate-y-1/2 flex flex-col gap-[2.5cqh] z-20 items-end w-[22cqw]">
            {/* Large PIDs on the Right with Scanline */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 -right-4 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent animate-[scan_4s_linear_infinite]" />
              <LargePidDisplay
                label="BOOST_PRESSURE"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="#ef4444"
                progress={(data?.boost || 0) / 25}
                transitionClass={ultraFastTransition}
              />
            </div>
            <div className="relative w-full">
              <LargePidDisplay
                label="INTAKE_AIR_TEMP"
                value={Math.round(data?.intakeAirTemp || 0)}
                unit="°F"
                color="#fbbf24"
                progress={(data?.intakeAirTemp || 0) / 200}
                transitionClass={ultraFastTransition}
              />
            </div>
            <div className="relative w-full">
              <LargePidDisplay
                label="FUEL_REMAINING"
                value={Math.round(data?.fuelLevel || 100)}
                unit="%"
                color="#38bdf8"
                progress={(data?.fuelLevel || 1) / 100}
                transitionClass={ultraFastTransition}
              />
            </div>
          </div>
        </div>

        {/* Warning Lights at Bottom */}
        <div className="absolute bottom-[8cqh] left-1/2 -translate-x-1/2 z-30">
          <WarningLights lights={data?.warningLights || {}} />
        </div>

        {/* Ticker at Bottom */}
        <div className="absolute inset-x-0 bottom-0 z-40 h-[3cqh]">
          <Ticker data={data} navState={navState} theme={theme} />
        </div>
      </div>
    );
  },
);

// Helper component for circular mini gauges
const CircularMiniGauge: React.FC<{
  label: string;
  value: string | number;
  max: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  transitionClass?: string;
}> = ({
  label,
  value,
  max,
  unit,
  color,
  icon,
  transitionClass = "transition-all duration-300",
}) => {
  const percent = Math.min(100, (Number(value) / max) * 100);
  const stroke = 3;
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl p-2 pl-4 pr-6 rounded-full border border-white/[0.08] shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="relative w-[9cqh] h-[9cqh]">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke + 1}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={transitionClass}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white/30 mb-0.5">{icon}</span>
          <span className="text-[1.8cqh] font-black leading-none text-white">
            {value}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[1cqh] font-black tracking-widest text-white/30 uppercase leading-none mb-1">
          {label}
        </span>
        <span className="text-[1.1cqh] font-bold text-white/10 uppercase italic">
          {unit}
        </span>
      </div>
    </div>
  );
};

// Helper component for large PIDs
const LargePidDisplay: React.FC<{
  label: string;
  value: string | number;
  unit: string;
  color: string;
  progress: number;
  transitionClass?: string;
}> = ({
  label,
  value,
  unit,
  color,
  progress,
  transitionClass = "transition-all duration-300",
}) => {
  return (
    <div className="w-full bg-black/60 backdrop-blur-xl border border-white/[0.08] p-3 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] relative overflow-hidden group">
      <div
        className="absolute top-0 right-0 w-[3px] h-full"
        style={{ backgroundColor: color }}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-white/[0.05] to-transparent pointer-events-none" />

      <div className="flex flex-col items-end gap-1 relative z-10">
        <span className="text-[1cqh] font-black text-white/30 tracking-[0.4em] uppercase">
          {label}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[5.5cqh] font-black italic text-white tabular-nums leading-none tracking-tighter"
            style={{ textShadow: `0 0 15px ${color}44` }}
          >
            {value}
          </span>
          <span className="text-[1.8cqh] font-black text-white/50 tracking-widest uppercase">
            {unit}
          </span>
        </div>
        {/* Aggressive Progress Bar */}
        <div className="w-full h-[2px] bg-white/[0.03] rounded-full mt-1.5 overflow-hidden flex flex-row-reverse">
          <div
            className={`h-full shadow-[0_0_15px_currentColor] ${transitionClass}`}
            style={{
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              backgroundColor: color,
              color,
            }}
          />
        </div>
      </div>
    </div>
  );
};
