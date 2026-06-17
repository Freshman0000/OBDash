import { Ticker } from "./Ticker";
import React, { useState, useMemo } from "react";
import { GaugeProps } from "./Gauge";
import { WarningLights } from "../App";

const AVAILABLE_PIDS = [
  {
    id: "coolantTemp",
    label: "TEMP_H2O",
    unit: "°C",
    max: 120,
    colorKey: "primaryColor",
  },
  {
    id: "oilTemp",
    label: "TEMP_OIL",
    unit: "°C",
    max: 150,
    colorKey: "secondaryColor",
  },
  {
    id: "oilPressure",
    label: "PRES_OIL",
    unit: "BAR",
    max: 8,
    colorKey: "accentColor",
  },
  {
    id: "boost",
    label: "PRE_BST",
    unit: "BAR",
    max: 2.5,
    colorKey: "primaryColor",
  },
  {
    id: "voltage",
    label: "SYS_VOLT",
    unit: "V",
    max: 16,
    colorKey: "secondaryColor",
  },
  {
    id: "intakeTemp",
    label: "TEMP_AIR",
    unit: "°C",
    max: 80,
    colorKey: "primaryColor",
  },
  {
    id: "engineLoad",
    label: "ENG_LOAD",
    unit: "%",
    max: 100,
    colorKey: "accentColor",
  },
  {
    id: "throttlePos",
    label: "THR_POS",
    unit: "%",
    max: 100,
    colorKey: "secondaryColor",
  },
];

export const RacingHorizontalGauge: React.FC<
  GaugeProps & { customTitle?: string }
> = ({ value, speed, gear, data, navState, theme, customTitle }) => {
  const safeData = data || {
    warningLights: {},
    throttlePos: 0,
    engineLoad: 0,
    coolantTemp: 0,
    oilTemp: 0,
    fuelLevel: 0,
    voltage: 12.0,
    boost: 0,
    rpm: value * 1000,
  } as any;
  const currentRpm = safeData?.rpm ?? value * 1000;
  const rpmDisplayValue = Math.min(9999, Math.round(currentRpm));
  const maxRpm = Math.max(8000, theme.maxRpm || 8000);
  const rpmPercent = Math.min(100, (currentRpm / maxRpm) * 100);

  const [leftPids] = useState([
    "coolantTemp",
    "oilTemp",
    "oilPressure",
    "boost",
  ]);
  const [rightPids] = useState([
    "voltage",
    "intakeTemp",
    "engineLoad",
    "throttlePos",
  ]);

  const mainFontClass = theme.fontFamily
    ? `${theme.fontFamily} italic`
    : `${theme.fontFamily || "font-tech"} font-black italic`;
  const pidFontClass = "font-micro font-bold italic";

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

  const renderPid = (pidId: string) => {
    const pidConfig = AVAILABLE_PIDS.find((p) => p.id === pidId)!;
    const rawVal = (safeData[pidId as keyof typeof safeData] as number) || 0;
    const MathFunc =
      pidId === "boost" || pidId === "voltage" || pidId === "oilPressure"
        ? (v: number) => v.toFixed(1)
        : Math.round;
    const val = MathFunc(rawVal);
    const progress = Math.min(100, (rawVal / pidConfig.max) * 100);
    // Use theme colors based on colorKey
    const color =
      (theme[pidConfig.colorKey as keyof typeof theme] as string) ||
      theme.primaryColor ||
      "#ffffff";

    return (
      <div
        className="flex flex-col mb-[1.5cqh] p-[2cqw] py-[2cqh] bg-[#020202] shadow-[inset_0_5px_15px_rgba(0,0,0,1),0_5px_15px_rgba(0,0,0,0.8)] border-y-2 border-white/10 rounded-[1.5cqw] relative group transition-none backdrop-blur-md justify-center flex-1 ring-1 ring-white/5 mx-2 overflow-hidden"
        style={{
          borderTopColor: `${color}60`,
          borderBottomColor: `${color}60`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/15 to-transparent pointer-events-none mix-blend-screen" />
        <div
          className="absolute left-0 inset-y-0 w-[4px] shadow-[0_0_15px_currentColor] opacity-100 transition-none"
          style={{ backgroundColor: color, color }}
        />

        <div className="flex justify-between items-baseline mb-[0.5cqh] pl-[1cqw]">
          <span
            className={`text-[2.2cqh] ${pidFontClass} text-white/80 tracking-[0.2em] uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,1)] font-bold border-b border-white/10 pb-1`}
          >
            {pidConfig.label}
          </span>
          <div className="flex items-baseline gap-[1cqw]">
            <span
              className={`text-[8cqh] ${mainFontClass} tabular-nums leading-none drop-shadow-[0_2px_5px_rgba(0,0,0,1)] transition-none text-white`}
              style={{ textShadow: `0 0 20px ${color}` }}
            >
              {val}
            </span>
            <span
              className={`text-[4.5cqh] font-black drop-shadow-[0_2px_5px_rgba(0,0,0,1)] bg-white/5 border-2 px-1.5 rounded-sm transition-none`}
              style={{ borderColor: `${color}80`, color: color }}
            >
              {pidConfig.unit}
            </span>
          </div>
        </div>
        <div className="h-[1cqh] w-full bg-[#050505] shadow-[inset_0_2px_5px_black] mt-1 ml-[1cqw] rounded-full overflow-hidden relative ring-1 ring-white/5">
          <div
            className="h-full relative transition-none"
            style={{
              width: `${progress}%`,
              backgroundColor: color,
              boxShadow: `0 0 15px ${color}`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/40 to-transparent mix-blend-screen" />
            <div className="absolute right-0 top-0 bottom-0 w-[15px] bg-white opacity-80 blur-[2px]" />
          </div>
        </div>
      </div>
    );
  };

  let rpmColor = theme.primaryColor;
  if (rpmPercent > 85) rpmColor = "#ff1111";
  else if (rpmPercent > 70) rpmColor = "#eab308";

  return (
    <div
      className={`w-full h-full p-[1.5cqh] after:absolute after:inset-0 after:rounded-[inherit] after:border-t-2 after:border-white/10 after:pointer-events-none ${theme.fontFamily || "font-tech"} relative rounded-[2cqw] border-4 border-[#121212] border-t-[#222] border-b-[#050505] overflow-hidden flex flex-col shadow-[inset_0_20px_60px_rgba(0,0,0,0.9),inset_0_-10px_20px_rgba(0,0,0,0.8),0_15px_30px_rgba(0,0,0,1)] ring-1 ring-white/10 ring-inset realistic-bezel transition-none ${theme.overlay ? "brightness-[1.15] contrast-125" : ""}`}
      style={{
        containerType: "size",
        backgroundColor: theme.backgroundColor || "#040406",
        zIndex: 0,
      }}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_4px)] z-[60] pointer-events-none opacity-40 mix-blend-overlay" />
      <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent z-[70] pointer-events-none mix-blend-screen" />

      {/* Hyper-Detailed Background Layers */}
      <div
        className={`absolute inset-0 opacity-100 mix-blend-screen brightness-150 z-0 ${getBgClass()}`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] z-0 pointer-events-none" />

      {/* High-End Technical Scanline Effect */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-20 overflow-hidden">
        <div className="w-full h-[1cqh] bg-white/10 blur-[2cqh] animate-[scan_6s_linear_infinite]" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3cqw_3cqh] z-0 pointer-events-none opacity-40 animate-[drive-grid_5s_linear_infinite]" />

      {theme.backlit && (
        <div
          className="absolute inset-x-[20%] inset-y-0 opacity-15 filter blur-[100px] z-[-1] pointer-events-none"
          style={{ backgroundColor: theme.primaryColor }}
        />
      )}

      {/* Base Backdrops */}
      <div className="absolute inset-y-0 left-[27cqw] right-[27cqw] border-x border-white/30 z-0 bg-white/[0.01] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-[4px]" />

      {/* Top Section: Enhanced Bar */}
      <div className="flex justify-between items-center mb-[1.5cqh] relative z-10 px-[2cqw] py-1 bg-black/40 border border-white/30 mx-[1cqw] rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <WarningLights
            lights={safeData.warningLights || {}}
            className="scale-75 origin-left"
          />
          <div className="h-6 w-px bg-white/20" />
          <span
            className={`text-[1.8cqh] ${pidFontClass} tracking-[0.5em] text-white/80 uppercase`}
          >
            {customTitle || "RACE_LOGIC_V9"}
          </span>
        </div>
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 w-8 border-t-4 ${i < rpmPercent / 8.3 ? "border-[var(--theme-primary)] shadow-[0_0_15px_var(--theme-primary)] bg-[var(--theme-primary-20)]" : "border-white/30 bg-black"}`}
              style={
                i < rpmPercent / 8.3 ? { borderColor: theme.primaryColor } : {}
              }
            />
          ))}
        </div>
      </div>

      <div
        className="relative w-full h-[12cqh] bg-[#050505] border-y border-white/40 mb-[2cqh] overflow-hidden flex items-stretch px-[4px] py-[2px] shadow-[inset_0_0_30px_rgba(0,0,0,1)] z-10"
        style={{ clipPath: "polygon(0 60%, 100% 0, 100% 100%, 0 100%)" }}
      >
        {/* Glass reflection overlay */}
        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/15 to-transparent z-30 pointer-events-none" />

        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_1.9%,rgba(255,255,255,0.15)_1.9%,rgba(255,255,255,0.15)_2.1%)] z-10 pointer-events-none opacity-200" />
        <div
          className="absolute left-0 bottom-0 h-full rounded-r-sm transition-none"
          style={{
            width: `${rpmPercent}%`,
            background: `linear-gradient(90deg, ${theme.primaryColor} 0%, ${theme.primaryColor} 70%, #ffffff 88%, #ff1111 96%)`,
            boxShadow: `0 0 40px ${rpmColor}, inset 0 0 10px rgba(0,0,0,0.5)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-full flex justify-between px-[5cqw] items-end pb-[1cqh] text-[3cqh] font-black italic text-white/80 pointer-events-none z-20 mix-blend-overlay drop-shadow-[0_2px_2px_black]">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            .filter((n) => n <= maxRpm / 1000)
            .map((n) => (
              <span key={n}>{n}</span>
            ))}
        </div>
      </div>

      <div className="flex-1 flex justify-between relative z-10 px-[2cqw] gap-[2cqw]">
        {/* Left PID Column */}
        <div className="w-[25%] flex flex-col justify-center">
          {leftPids.map((pid) => (
            <React.Fragment key={pid}>{renderPid(pid)}</React.Fragment>
          ))}
        </div>

        {/* Center Cluster - RPM MAIN, SPEED SUB */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#111] to-[#050505] rounded-[3cqw] border-2 border-[#151515] border-t-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_5px_20px_rgba(255,255,255,0.02),inset_0_-10px_20px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10 mx-[1cqw]">
          <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent z-30 pointer-events-none mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />

          <div className="flex flex-col items-center mt-[-2cqh] relative z-10 w-full px-[5cqw]">
            <span
              className={`text-[28cqh] font-heavy font-black tracking-[-0.05em] tabular-nums leading-none text-[#fff] min-w-[4ch] text-center digital-embedded`}
            >
              {rpmDisplayValue}
            </span>
            <div className="flex items-center gap-6 -mt-2 bg-gradient-to-br from-[#1a1a1a] to-[#000] px-8 py-1.5 rounded-full border-t border-white/20 shadow-[0_5px_15px_black,inset_0_2px_5px_rgba(255,255,255,0.05)] ring-1 ring-black">
              <div
                className="h-px w-10 bg-gradient-to-l from-[var(--theme-primary)] to-transparent"
                style={{ borderColor: theme.primaryColor }}
              />
              <span
                className={`text-[3cqh] ${pidFontClass} tracking-[0.8em] font-black`}
                style={{
                  color: theme.primaryColor,
                  textShadow: `0 0 12px ${theme.primaryColor}88`,
                }}
              >
                RPM
              </span>
              <div
                className="h-px w-10 bg-gradient-to-r from-[var(--theme-primary)] to-transparent"
                style={{ borderColor: theme.primaryColor }}
              />
            </div>
          </div>

          <div className="flex items-center gap-[2cqw] mt-[3cqh] w-full justify-center relative z-10 px-[2cqw]">
            <div className="flex flex-col items-start min-w-[20%]">
              <span className="text-[1.5cqh] font-bold italic text-white/50 tracking-[0.2em] uppercase">
                Lap Time
              </span>
              <span className="text-[2.2cqh] font-black italic text-white">
                03:18.983
              </span>
              <span className="text-[1.2cqh] font-bold italic text-[#4ade80] tracking-widest mt-1">
                -1.24s
              </span>
            </div>

            <div className="flex flex-col items-center bg-gradient-to-b from-[#111] to-[#000] px-[2cqw] py-[0.5cqh] rounded-2xl border-t border-x border-white/30 shadow-[inset_0_3px_10px_rgba(0,0,0,1),_0_5px_20px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden ring-1 ring-black flex-1">
              <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none mix-blend-screen" />
              <span
                className={`text-[1.5cqh] ${pidFontClass} text-white/70 tracking-[0.3em] uppercase drop-shadow-[0_1px_1px_black]`}
              >
                SPEED
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-[7cqh] ${mainFontClass} text-white leading-none mt-1 drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]`}
                >
                  {Math.round(speed)}
                </span>
                <span className="text-[1.8cqh] font-black italic opacity-75 tracking-widest text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  MPH
                </span>
              </div>
            </div>

            <div
              className="flex flex-col items-center bg-gradient-to-b from-[var(--theme-primary-40)] to-black/80 px-[1.25cqw] py-[0.25cqh] rounded-[1cqw] border-t-[2px] border-x border-[var(--theme-primary)] shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_5px_15px_var(--theme-primary-20)] scale-[1.05] backdrop-blur-md relative overflow-hidden ring-1 ring-black"
              style={{ borderTopColor: theme.primaryColor }}
            >
              <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none mix-blend-screen" />
              <span
                className={`text-[1cqh] ${pidFontClass} text-white/80 tracking-[0.2em] uppercase drop-shadow-[0_1px_1px_black] z-10`}
              >
                GEAR
              </span>
              <span
                className={`text-[3.5cqh] ${mainFontClass} text-white leading-none z-10 drop-shadow-[0_0_15px_var(--theme-primary)]`}
                style={{
                  textShadow: `0 0 15px ${theme.primaryColor}, 0 1px 5px black`,
                }}
              >
                {gear}
              </span>
            </div>

            <div className="flex justify-center gap-2 min-w-[20%]">
              <div className="relative w-[8cqh] h-[8cqh]">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeDasharray="282.7"
                    strokeDashoffset={
                      282.7 * (1 - (safeData.throttlePos || 0) / 100)
                    }
                    strokeLinecap="round"
                    className="transition-none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-[1.8cqh] font-black text-white leading-none transition-none">
                    {Math.round(safeData.throttlePos || 0)}
                  </span>
                  <span className="text-[1cqh] font-black text-white/50 tracking-widest drop-shadow-md">
                    THR
                  </span>
                </div>
              </div>
              <div className="relative w-[8cqh] h-[8cqh]">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(255,165,0,0.5)] transition-none"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeDasharray="282.7"
                    strokeDashoffset={
                      282.7 * (1 - (safeData.engineLoad || 0) / 100)
                    }
                    strokeLinecap="round"
                    className="transition-none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-[1.8cqh] font-black text-white leading-none transition-none">
                    {Math.round(safeData.engineLoad || 0)}
                  </span>
                  <span className="text-[1cqh] font-black text-white/50 tracking-widest drop-shadow-md">
                    LOD
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full px-[4cqw] gap-[2cqw] mt-[2cqh]">
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-[1.5cqh] font-bold text-white/60 tracking-widest">
                  COOLANT
                </span>
                <span className="text-[1.5cqh] font-black text-white transition-none">
                  {Math.round(safeData.coolantTemp || 0)} °F
                </span>
              </div>
              <div className="h-[1.5cqh] bg-black border border-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-none"
                  style={{
                    width: `${Math.min(100, ((safeData.coolantTemp || 0) / 300) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-[1.5cqh] font-bold text-white/60 tracking-widest">
                  OIL T.
                </span>
                <span className="text-[1.5cqh] font-black text-white transition-none">
                  {Math.round(safeData.oilTemp || 0)} °F
                </span>
              </div>
              <div className="h-[1.5cqh] bg-black border border-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 shadow-[0_0_10px_#f97316] transition-none"
                  style={{
                    width: `${Math.min(100, ((safeData.oilTemp || 0) / 300) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-[1.5cqh] font-bold text-white/60 tracking-widest">
                  FUEL
                </span>
                <span className="text-[1.5cqh] font-black text-white transition-none">
                  {Math.round(safeData.fuelLevel || 0)} %
                </span>
              </div>
              <div className="h-[1.5cqh] bg-black border border-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 shadow-[0_0_10px_#22c55e] transition-none"
                  style={{ width: `${safeData.fuelLevel || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right PID Column */}
        <div className="w-[25%] flex flex-col justify-center">
          {rightPids.map((pid) => (
            <React.Fragment key={pid}>{renderPid(pid)}</React.Fragment>
          ))}
        </div>
      </div>

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
};
