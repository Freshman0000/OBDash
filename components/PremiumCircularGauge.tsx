import { Ticker } from "./Ticker";
import React, { useMemo } from "react";
import { GaugeProps, WarningLights } from "./Gauge";

export const PremiumCircularGauge: React.FC<
  GaugeProps & { customTitle?: string }
> = ({ value, speed, gear, data, navState, theme, customTitle }) => {
  const currentRpm = data?.rpm ?? value * 1000;
  const rpmDisplayValue = Math.min(9999, Math.round(currentRpm));
  const speedVal = Math.round(speed || 0);
  const boostVal = data?.boost ? data.boost.toFixed(1) : "0.0";
  const oilPressVal = data?.oilPressure ? Math.round(data.oilPressure) : "0";

  const tempPercent = Math.min(
    100,
    Math.max(0, ((data?.coolantTemp || 0) / 280) * 100),
  );

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

  const getFuelColor = (level: number) => {
    if (level > 60) return "#10b981"; // emerald-500 (neon green)
    if (level > 25) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };
  const fuelLevel = data?.fuelLevel || 0;
  const fuelColor = getFuelColor(fuelLevel);

  return (
    <div
      className={`w-full h-full p-[1.5cqh] after:absolute after:inset-0 after:rounded-[inherit] after:border-t-2 after:border-white/10 after:pointer-events-none flex flex-col justify-between items-center relative overflow-hidden ${getBgClass()} rounded-[2cqw] border-2 border-[#151515] transition-none shadow-[inset_0_20px_50px_rgba(0,0,0,0.9),inset_0_-10px_20px_rgba(0,0,0,0.8),0_5px_15px_rgba(0,0,0,1)] ${theme.overlay ? "brightness-110 saturate-125" : ""}`}
      style={{
        containerType: "size",
        backgroundColor: theme.backgroundColor || "#040406",
        zIndex: 0,
      }}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_4px)] z-[60] pointer-events-none opacity-30 mix-blend-overlay transition-none" />

      {/* Decorative Bezel Rim */}
      <div className="absolute inset-0 border border-white/40 rounded-[2cqw] pointer-events-none z-10 mix-blend-overlay" />

      {/* Background Layer */}
      <div
        className={`absolute inset-0 opacity-100 mix-blend-screen brightness-150 z-0 ${getBgClass()}`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_80%,rgba(0,0,0,0.8)_100%)] z-0 pointer-events-none" />

      {/* High-End Technical Scanline Effect */}
      <div className="absolute inset-0 z-[65] pointer-events-none opacity-20 overflow-hidden">
        <div className="w-full h-[1cqh] bg-white/10 blur-[2cqh] animate-[scan_6s_linear_infinite]" />
      </div>

      {theme.backlit && (
        <div
          className="absolute inset-0 opacity-30 filter blur-3xl z-[-1] pointer-events-none"
          style={{ backgroundColor: theme.primaryColor }}
        />
      )}

      {/* --- TOP SECTION: SWEPT RPM BAR --- */}
      <div className="w-full relative h-[22cqh] flex flex-col items-center justify-start mt-[1cqh]">
        <div className="flex justify-between w-[94%] px-[2%] text-[2.28cqh] italic font-black tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <span
              key={num}
              className="relative z-20"
              style={{
                color:
                  num >= 8
                    ? theme.accentColor || "#ff1111"
                    : num >= 6
                      ? theme.primaryColor
                      : "white",
              }}
            >
              {num}
            </span>
          ))}
        </div>
        <div className="relative w-[96%] h-[12cqh] mt-[0.5cqh] flex shrink-0 perspective-[1000px] z-10 p-[4px] rounded-md bg-gradient-to-b from-[#222] via-[#111] to-[#000] realistic-bezel ring-1 ring-white/10">
          {/* Highly realistic glass reflection on bezel */}
          <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-md mix-blend-screen" />

          <div
            className="w-[7%] h-full bg-[#050505] border border-white/40 border-r-0 relative overflow-hidden"
            style={{
              transform: "skewX(35deg)",
              boxShadow: "inset 0 0 15px rgba(0,0,0,1)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] z-20 pointer-events-none" />
            {currentRpm > 0 && (
              <div
                className="absolute inset-0 transition-none"
                style={{
                  backgroundColor: theme.primaryColor,
                  width: `${Math.min(100, (currentRpm / 630) * 100)}%`,
                  boxShadow: `0 0 25px ${theme.primaryColor}, inset 0 2px 2px rgba(255,255,255,0.4)`,
                }}
              />
            )}
          </div>

          <div className="w-[86%] h-full bg-[#050505] border-y border-white/40 relative flex overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] transition-none">
            <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent z-30 pointer-events-none mix-blend-overlay" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4.9%,rgba(255,255,255,0.15)_4.9%,rgba(255,255,255,0.15)_5.1%)] z-10 pointer-events-none transition-none" />
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] z-20 pointer-events-none" />
            <div
              className="h-full relative z-0 transition-none"
              style={{
                width: `${Math.max(0, Math.min(100, ((currentRpm - 630) / 7740) * 100))}%`,
                background: `linear-gradient(90deg, ${theme.primaryColor} 0%, ${theme.primaryColor} 70%, #ffffff 88%, ${theme.accentColor || "#ff1111"} 96%)`,
                boxShadow: `0 0 40px ${theme.primaryColor}, inset 0 2px 5px rgba(255,255,255,0.8)`,
              }}
            />
          </div>

          <div
            className="w-[7%] h-full bg-[#050505] border border-white/40 border-l-0 relative overflow-hidden"
            style={{
              transform: "skewX(-35deg)",
              boxShadow: "inset 0 0 15px rgba(0,0,0,1)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent)] z-20 pointer-events-none" />
            {currentRpm > 8370 && (
              <div
                className="absolute inset-0 transition-none"
                style={{
                  backgroundColor: theme.accentColor || "#ff1111",
                  width: `${((currentRpm - 8370) / 630) * 100}%`,
                  boxShadow: `0 0 30px ${theme.accentColor || "#ff1111"}, inset 0 2px 2px rgba(255,255,255,0.5)`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* --- CENTER SECTION: MASSIVE RPM & DETAILED PIDS --- */}
      <div className="flex-1 w-full flex items-center justify-center relative z-20 px-[2cqw]">
        {/* Left Column PIDs */}
        <div className="flex-1 flex justify-end pr-[12cqw] h-full items-center z-20">
          <div className="grid grid-cols-2 gap-[1.5cqw] w-full max-w-[45cqw] h-[85%] relative before:absolute before:-right-[4cqw] before:top-[10%] before:bottom-[10%] before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
            {[
              {
                label: "H2O_TEMP",
                val: `${Math.round(data?.coolantTemp || 0)}°`,
                color: theme.primaryColor,
                textStyle: {
                  color: "white",
                  textShadow: `0 0 10px ${theme.primaryColor}`,
                },
              },
              {
                label: "OIL_TEMP",
                val: `${Math.round(data?.oilTemp || 0)}°`,
                color: theme.secondaryColor || "#555",
                textStyle: {
                  color: "white",
                  textShadow: `0 0 10px ${theme.secondaryColor || "#fff"}`,
                },
              },
              {
                label: "IAT_PRE",
                val: `${Math.round(data?.intakeAirTemp || 0)}°`,
                color: theme.primaryColor,
                textStyle: {
                  color: "#fff",
                  textShadow: `0 0 10px ${theme.primaryColor}`,
                },
              },
              {
                label: "BATT_V",
                val: `${(data?.batteryVolts || 12.4).toFixed(1)}`,
                color: theme.accentColor || "#fff",
                textStyle: {
                  color: "white",
                  textShadow: `0 0 10px ${theme.accentColor || "#fff"}`,
                },
              },
            ].map((pid, i) => (
              <div
                key={i}
                className="flex flex-col bg-[#0A0B10]/60 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.02)] rounded-xl justify-center items-center relative overflow-hidden backdrop-blur-[32px] group ring-1 ring-black/50 hover:border-white/20 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none" />
                <div
                  className="absolute top-0 left-0 w-full h-[4px] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_2px_15px_currentColor]"
                  style={{ backgroundColor: pid.color, color: pid.color }}
                />
                <div
                  className="absolute left-0 top-0 bottom-0 w-[2px] opacity-30 shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: pid.color, color: pid.color }}
                />
                <span
                  className={`text-[1.8cqh] ${pidFontClass} tracking-[0.3em] uppercase mb-1 drop-shadow-[0_2px_5px_rgba(0,0,0,1)] text-white/50 group-hover:text-white/90 transition-colors`}
                >
                  {pid.label}
                </span>
                <span
                  className={`text-[6.5cqh] ${mainFontClass} tabular-nums leading-none mt-1 drop-shadow-[0_2px_5px_rgba(0,0,0,1)] transition-none group-hover:brightness-125 digital-embedded w-full text-center`}
                  style={pid.textStyle}
                >
                  {pid.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: THE MAIN EVENT */}
        <div className="flex flex-col items-center justify-center px-[2cqw] shrink-0 relative mt-[-6cqh] z-30 scale-125">
          {theme.glow && (
            <div
              className="absolute inset-x-[-25cqw] top-[-15cqw] bottom-[-20cqw] bg-white/[0.05] rounded-[50%] blur-[80px] z-[-1] animate-pulse"
              style={{ backgroundColor: `${theme.primaryColor}30` }}
            />
          )}
          <span
            className={`text-[34cqh] font-heavy font-black leading-none tracking-[0.02em] tabular-nums min-w-[3ch] text-center digital-embedded transform transition-transform duration-75 ${currentRpm > 7500 ? "animate-[shake_0.08s_infinite] text-red-500" : ""}`}
            style={
              currentRpm > 7500
                ? { textShadow: "0 0 40px #ef4444" }
                : {
                    color: theme.primaryColor,
                    textShadow: `0 0 35px ${theme.primaryColor}80`,
                  }
            }
          >
            {speedVal}
          </span>
          <div className="flex items-center gap-8 mt-[-4cqh] px-8 py-1 relative">
            <div className="h-[2px] w-[10cqw] bg-gradient-to-l from-white/70 to-transparent" />
            <span className="text-[5cqh] font-black italic tracking-[1em] text-white drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">
              MPH
            </span>
            <div className="h-[2px] w-[10cqw] bg-gradient-to-r from-white/70 to-transparent" />
            {speedVal > 150 && (
              <div className="absolute -inset-4 border-4 border-red-500 rounded-xl animate-ping opacity-70" />
            )}
          </div>
        </div>

        {/* Right Column PIDs */}
        <div className="flex-1 flex justify-start pl-[12cqw] h-full items-center z-20">
          <div className="grid grid-cols-2 gap-[1.5cqw] w-full max-w-[45cqw] h-[85%] relative before:absolute before:-left-[4cqw] before:top-[10%] before:bottom-[10%] before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
            {[
              {
                label: "BST_BAR",
                val: boostVal,
                color: theme.primaryColor,
                textStyle: {
                  color: "white",
                  textShadow: `0 0 10px ${theme.primaryColor}`,
                },
              },
              {
                label: "OIL_PSI",
                val: oilPressVal,
                color: theme.secondaryColor || "#555",
                textStyle: {
                  color: "white",
                  textShadow: `0 0 10px ${theme.secondaryColor || "#fff"}`,
                },
              },
              {
                label: "ENG_LD",
                val: `${Math.round(data?.engineLoad || 0)}%`,
                color: theme.primaryColor,
                textStyle: {
                  color: "#fff",
                  textShadow: `0 0 10px ${theme.primaryColor}`,
                },
              },
              {
                label: "CUR_GR",
                val: gear,
                color: theme.accentColor || "#fff",
                textStyle: {
                  color: "white",
                  textShadow: `0 0 10px ${theme.accentColor || "#fff"}`,
                },
                special: true,
              },
            ].map((pid, i) => (
              <div
                key={i}
                className={`flex flex-col bg-[#0A0B10]/60 border shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.02)] rounded-xl justify-center items-center relative overflow-hidden backdrop-blur-[32px] group ring-1 ring-black/50 transition-all duration-300 transform hover:scale-110 active:scale-95 ${pid.special ? "border-white/40 shadow-[0_5px_40px_inset_0_2px_4px_rgba(255,255,255,0.02)] bg-[#1A1C20]/80" : "border-white/10"}`}
                style={
                  pid.special
                    ? {
                        borderColor: pid.color,
                        boxShadow: `0 0 40px ${pid.color}66, inset 0 2px 4px rgba(255,255,255,0.02)`,
                      }
                    : {}
                }
              >
                <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none mix-blend-screen" />
                {pid.special && (
                  <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent)] pointer-events-none animate-pulse"
                    style={{ color: pid.color }}
                  />
                )}
                {!pid.special && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none" />
                )}

                <div
                  className={`absolute top-0 left-0 w-full ${pid.special ? "h-[8px] shadow-[0_2px_30px_currentColor]" : "h-[4px] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_2px_20px_currentColor]"}`}
                  style={{ backgroundColor: pid.color, color: pid.color }}
                />
                <div
                  className={`absolute ${pid.special ? "right-0" : "left-0"} top-0 bottom-0 w-[2px] opacity-30 shadow-[0_0_10px_currentColor]`}
                  style={{ backgroundColor: pid.color, color: pid.color }}
                />

                <span
                  className={`text-[1.8cqh] ${pidFontClass} tracking-[0.3em] uppercase mb-1 drop-shadow-[0_2px_5px_rgba(0,0,0,1)] text-white/50 group-hover:text-white/90 transition-colors`}
                >
                  {pid.label}
                </span>
                <span
                  className={`text-[6.5cqh] ${mainFontClass} tabular-nums leading-none mt-1 drop-shadow-[0_2px_5px_rgba(0,0,0,1)] transition-none group-hover:brightness-125 ${pid.special ? "-mt-2 scale-110" : ""} digital-embedded w-full text-center`}
                  style={pid.textStyle}
                >
                  {pid.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: SPEED HUD & TELEMETRY --- */}
      <div className="w-full h-[28cqh] relative z-20 flex justify-between items-end pb-[1cqh] px-[4cqw] gap-[2cqw]">
        <div className="w-[32%] h-full flex flex-col justify-end bg-[#0A0B10]/40 border-t border-white/15 rounded-t-[1.5rem] p-[1.5cqw] relative overflow-hidden ring-1 ring-white/10 backdrop-blur-[24px] shadow-[0_-8px_24px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-xl pointer-events-none opacity-200" />
          <div className="flex justify-between w-full text-white/70 font-black italic text-[1.4cqh] mb-[1.5cqh] tracking-[0.2em]">
            <span>COOLANT_VITAL</span>
            <span className="text-white/70">
              {Math.round(data?.coolantTemp || 0)}°C
            </span>
          </div>
          <div className="w-full h-[3.5cqh] bg-black border border-white/30 transform skew-x-[30deg] relative overflow-hidden shadow-[inset_0_5px_10px_rgba(0,0,0,1)]">
            <div
              className="h-full relative"
              style={{ width: `${tempPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-yellow-400 to-red-500" />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(0,0,0,0.5)_6px,rgba(0,0,0,0.5)_8px)]" />
            </div>
          </div>
          <div className="mt-[2.5cqh] flex flex-col gap-[1cqh]">
            <div className="flex justify-between items-center text-[1.2cqh] font-black text-white/60 italic tracking-widest uppercase">
              <span>SYSTEM_DIAG</span>
              <span className="text-emerald-400/80 animate-pulse">OPTIMAL</span>
            </div>
          </div>
        </div>

        {/* DIGITAL SPEED HUD: Prominent and Aggressive */}
        <div className="w-[30%] shrink-0 flex flex-col items-center justify-end relative h-[140%] mb-[-1cqh]">
          <div className="bg-[#0A0B10]/60 border-2 border-t-4 border-white/15 rounded-t-[3rem] px-[4cqw] py-[2cqh] flex flex-col items-center relative overflow-hidden shadow-[0_-16px_40px_rgba(0,0,0,0.9),inset_0_4px_16px_rgba(255,255,255,0.1)] backdrop-blur-[24px] w-full border-t-[var(--theme-primary)]">
            <span
              className={`text-[1.8cqh] ${pidFontClass} text-white/60 tracking-[0.5em] uppercase mb-[-1cqh]`}
            >
              VELOCITY
            </span>
            <span
              className={`text-[12cqh] ${mainFontClass} tabular-nums leading-none text-white drop-shadow-[0_5px_20px_rgba(255,255,255,0.4)] digital-embedded`}
            >
              {Math.round(speed)}
            </span>
            <span className="text-[2cqh] font-black italic tracking-[0.2em] text-white/70 mt-1">
              KM/H
            </span>
          </div>
        </div>

        <div className="w-[32%] h-full flex flex-col justify-end bg-[#0A0B10]/40 border-t border-white/15 rounded-t-[1.5rem] p-[1.5cqw] relative overflow-hidden ring-1 ring-white/10 backdrop-blur-[24px] shadow-[0_-8px_24px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-xl pointer-events-none opacity-200" />
          <div className="flex justify-between w-full text-white/70 font-black italic text-[1.4cqh] mb-[1.5cqh] tracking-[0.2em]">
            <span>FUEL_RESERVE</span>
            <span
              style={{ color: fuelColor }}
              className="drop-shadow-[0_0_8px_currentColor]"
            >
              {Math.round(fuelLevel)}%
            </span>
          </div>
          <div className="w-full h-[3.5cqh] bg-black border border-white/30 transform skew-x-[-30deg] relative overflow-hidden shadow-[inset_0_5px_10px_rgba(0,0,0,1)]">
            <div
              className="h-full relative"
              style={{
                width: `${Math.round(fuelLevel)}%`,
                backgroundColor: fuelColor,
                boxShadow: `0 0 15px ${fuelColor}`,
              }}
            >
              <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(0,0,0,0.5)_6px,rgba(0,0,0,0.5)_8px)]" />
            </div>
          </div>
          <div className="mt-[2.5cqh] flex flex-col gap-[1cqh]">
            <div className="flex justify-between items-center text-[1.2cqh] font-black text-white/60 italic tracking-widest uppercase">
              <span>TELEMETRY</span>
              <span className="text-emerald-400/80 animate-pulse">
                120HZ_LINK
              </span>
            </div>
          </div>
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
