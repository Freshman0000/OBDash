import { Ticker } from "./Ticker";
import React, { useMemo } from "react";
import { ResponsiveValue, GaugeProps, PidBox, WarningLights } from "./Gauge";
import {
  Thermometer,
  Droplets,
  Battery,
  Activity,
  Zap,
  Wind,
} from "lucide-react";

export const QuasarGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed = 0, gear, data, navState, theme }) => {
    const {
      vehicleSpeed,
      engineRpm,
      engineOilTemp,
      engineCoolantTemp,
      throttlePosition,
      calculatedEngineLoad,
      controlModuleVoltage,
    } = (data as any) || {};

    const currentRpm = data?.rpm ?? engineRpm ?? value * 1000;
    const currentSpeed = speed ?? vehicleSpeed ?? 0;

    const rpm = Math.round(currentRpm);
    const temp = Math.round(data?.coolantTemp ?? engineCoolantTemp ?? 90);

    // Stable random values for visual effects to prevent "glitching" on every re-render
    const stars = useMemo(
      () =>
        [...Array(40)].map((_, i) => ({
          left: `${(i * 7 + 13) % 100}%`,
          top: `${(i * 11 + 17) % 100}%`,
          width: (i % 8) + 2,
          height: (i % 3) + 1,
          duration: 10 + (i % 8),
          opacity: 0.2 + (i % 5) * 0.1,
          delay: -(i % 10),
        })),
      [],
    );

    const warpStreaks = useMemo(
      () =>
        [...Array(20)].map((_, i) => ({
          angle: (i / 20) * Math.PI * 2,
          dist: 50 + (i % 5) * 10,
          delay: (i % 10) * 0.2,
          durationOffset: (i % 5) * 0.1,
        })),
      [],
    );

    const warpStars = useMemo(
      () =>
        [...Array(40)].map((_, i) => ({
          left: `${(i * 13 + 7) % 100}%`,
          top: `${(i * 17 + 11) % 100}%`,
          width: (i % 3) + 1,
          height: (i % 10) + 5,
          delay: (i % 20) * 0.1,
          duration: 0.8 + (i % 10) * 0.2,
          rotation: (i % 45) - 22.5,
        })),
      [],
    );

    // Calculate power and charge estimates for visual effect
    const powerHp = Math.round((rpm / 8000) * 1800);
    const currentGear =
      gear ??
      (currentSpeed > 0 ? Math.min(6, Math.floor(currentSpeed / 40) + 1) : 1);

    const bgGradient = theme.primaryColor
      ? `radial-gradient(ellipse at top, ${theme.primaryColor}20 0%, transparent 60%)`
      : "none";
    const glowShadow = `drop-shadow(0 0 20px ${theme.primaryColor || "#00aaff"}80)`;

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
          return "";
      }
    };

    return (
      <div
        className={`w-full h-full relative text-white overflow-hidden flex ${theme.fontFamily || "font-tech"} p-[2cqh] rounded-[3cqw] shadow-[inset_0_0_100px_50px_${theme.backgroundColor}] realistic-bezel`}
        style={{
          backgroundColor: theme.backgroundColor || "#040d1a",
          containerType: "size",
        }}
      >
        <style>
          {`
            @keyframes warp-streak {
              0% { transform: translate(-50%, -50%) rotate(var(--tw-rotate)) translateX(0px) scaleX(0.1); opacity: 0; }
              20% { opacity: 0.8; }
              100% { transform: translate(-50%, -50%) rotate(var(--tw-rotate)) translateX(400px) scaleX(2); opacity: 0; }
            }
          `}
        </style>
        <div
          className={`absolute inset-0 mix-blend-screen opacity-100 z-0 ${getBgClass()}`}
        />
        {/* Background glow effects */}
        <div
          className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
          style={{
            background: `radial-gradient(circle at center, ${theme.primaryColor}30 0%, transparent 70%)`,
          }}
        />
        <div className="absolute top-0 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30" />
        <div className="absolute bottom-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-20" />

        <div className="absolute inset-x-[-50%] inset-y-0 overflow-hidden pointer-events-none opacity-20 z-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.width}px`,
                height: `${star.height}px`,
                animation: `pan-x ${star.duration}s linear infinite`,
                animationDelay: `${star.delay}s`,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        {/* Dynamic Motion/Radial Blur Effect */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none transition-all duration-300"
          style={{
            backdropFilter: `blur(${Math.min(16, currentSpeed / 10)}px)`,
            WebkitMaskImage:
              "radial-gradient(circle at center, transparent 15%, black 100%)",
            maskImage:
              "radial-gradient(circle at center, transparent 15%, black 100%)",
            opacity: Math.min(1, currentSpeed / 15),
          }}
        />

        {/* Global Scanning Line */}
        <div className="absolute inset-x-0 h-px bg-white/5 shadow-[0_0_15px_white] z-[10] animate-[scan_8s_linear_infinite] pointer-events-none" />

        {/* Warp Drive Motion Streaks */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {warpStreaks.map((streak, i) => {
            return (
              <div
                key={`streak-${i}`}
                className="absolute top-1/2 left-1/2 w-[300px] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 animate-[warp-streak_1s_infinite_linear]"
                style={{
                  transform: `translate(-50%, -50%) rotate(${streak.angle}rad) translateX(${streak.dist}px)`,
                  animationDelay: `${streak.delay}s`,
                  animationDuration: `${Math.max(0.2, 1.5 - currentSpeed / 40 + streak.durationOffset)}s`,
                }}
              />
            );
          })}
        </div>

        {/* Forward moving tunnel/grid effect spanning entire width */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 perspective-[1000px] overflow-hidden">
          <div
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:5cqw_5cqh] [transform:rotateX(60deg)_translateZ(-200px)_translateY(-100%)]"
            style={{
              animation: `forward-grid ${Math.max(0.1, 5 - currentSpeed / 40)}s linear infinite`,
            }}
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_70%)]"
            style={{ opacity: 0.8 }}
          />
          {warpStars.map((star, i) => (
            <div
              key={`warp-star-${i}`}
              className="absolute bg-white rounded-full"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.width}px`,
                height: `${star.height}px`,
                opacity: 0,
                transform: `rotate(${star.rotation}deg)`,
                animation: `warp-drive ${star.duration}s ease-in infinite`,
                animationDelay: `${star.delay}s`,
                boxShadow: `0 0 10px ${theme.primaryColor}, 0 0 20px white`,
              }}
            />
          ))}
        </div>

        <div className="flex-1 w-full flex relative z-10">
          {/* LEFT WING - Analytics */}
          <div className="w-[30%] h-full flex flex-col justify-between p-[2cqw] relative bg-[#0A0B10]/40 border border-white/15 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)] rounded-[2cqw]">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 bg-[var(--theme-primary)] shadow-[0_0_5px_currentColor]"
                style={{
                  color: theme.primaryColor,
                  backgroundColor: theme.primaryColor,
                }}
              />
              <span className="text-[1.8cqh] font-bold tracking-[0.2em] uppercase opacity-80 text-white">
                GARAGE
              </span>
            </div>
            <div className="text-[1.4cqh] font-bold tracking-[0.2em] uppercase opacity-50 ml-3.5 -mt-1">
              {theme.name.replace(/_/g, " ")}
            </div>

            {/* New PIDs in Left Panel - Look like Skin 4 */}
            <div className="flex-1 flex flex-col justify-center gap-6 pl-4">
              <PidBox
                label="Coolant Temp"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°C"
                color={theme.secondaryColor || "#38bdf8"}
                align="left"
                borderSide="left"
                className="shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10"
                data={data}
              />
              <PidBox
                label="Oil Temp"
                value={Math.round(data?.oilTemp || 0)}
                unit="°C"
                color={theme.primaryColor || "#ef4444"}
                align="left"
                borderSide="left"
                className="shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10"
                data={data}
              />
              <PidBox
                label="Fuel System"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color={theme.accentColor || "#10b981"}
                align="left"
                borderSide="left"
                className="shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10"
                data={data}
              />
            </div>

            <div className="flex items-center justify-start gap-[1.5cqw] text-[1.6cqh] font-bold opacity-70 mt-auto uppercase tracking-widest pt-[2cqh] border-t border-white/10">
              <span>10:10 AM</span>
              <div className="w-px h-[2cqh] bg-white/30" />
              <span>30 Aug 23</span>
            </div>
          </div>

          {/* CENTER TIER - Main Telemetry */}
          <div className="w-[40%] h-full flex flex-col items-center relative font-tech">
            {/* Compass Strip */}
            <div className="w-[80%] flex items-center justify-between text-[1cqh] font-bold opacity-50 tracking-widest mt-[1cqh] px-[2cqw]">
              <svg
                className="w-4 h-4 opacity-50"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>NW</span>
              <div className="h-px w-[6cqw] bg-gradient-to-r from-transparent via-white/20 to-transparent mx-2" />
              <span
                className="text-white opacity-100 text-[1.4cqh] relative filter drop-shadow-[0_0_5px_currentColor]"
                style={{ color: theme.primaryColor }}
              >
                N
              </span>
              <div className="h-px w-[6cqw] bg-gradient-to-r from-transparent via-white/20 to-transparent mx-2" />
              <span>NE</span>
              <svg
                className="w-4 h-4 opacity-50"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </div>

            <div className="mt-[1.5cqh] scale-[0.65] origin-top z-50 transition-all hover:scale-75">
              <WarningLights data={data} />
            </div>

            {/* Branding & Mode */}
            <div className="mt-[0.5cqh] flex flex-col items-center">
              <span
                className="text-[2.2cqh] font-black tracking-[0.6em] uppercase animate-pulse"
                style={{
                  filter: `drop-shadow(0 0 15px ${theme.primaryColor || "#00aaff"})`,
                  fontFamily: "Michroma, sans-serif",
                }}
              >
                QUASAR
              </span>
              <div className="w-full flex items-center justify-center gap-[1cqw] mt-[1cqh]">
                <div className="w-0 h-0 border-t-[0.6cqh] border-t-transparent border-r-[1cqw] border-r-white/30 border-b-[0.6cqh] border-b-transparent" />
                <span
                  className="text-[1.2cqh] font-black tracking-[0.4em] uppercase text-white px-2"
                  style={{
                    color: theme.name.includes("SPORT")
                      ? "#fff"
                      : theme.primaryColor,
                  }}
                >
                  {theme.name.includes("RACE")
                    ? "RACE"
                    : theme.name.includes("SPORT")
                      ? "SPORT"
                      : "DRIVE"}
                </span>
                <div className="w-0 h-0 border-t-[0.6cqh] border-t-transparent border-l-[1cqw] border-l-white/30 border-b-[0.6cqh] border-b-transparent" />
              </div>
            </div>

            {/* Speed & RPM Indicators */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative mt-[-2cqh]">
              {/* Center - RPM Above Speed */}
              <div className="flex flex-col items-center justify-center z-10 pt-10">
                <span
                  className="text-[20cqh] leading-none font-black tracking-tighter tabular-nums drop-shadow-[0_5px_15px_rgba(0,0,0,1)] text-white digital-embedded"
                  style={{
                    fontFamily: "Michroma, sans-serif",
                    textShadow: `0 0 20px rgba(255,255,255,0.3)`,
                  }}
                >
                  {Math.min(9999, rpm)}
                </span>
                <span className="text-[3cqh] font-black italic tracking-[0.6em] text-white/50 mb-4 -mt-2">
                  RPM
                </span>

                <span
                  className={`text-[8cqh] leading-none font-black italic tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 digital-embedded ${theme.name.includes("SPORT") || theme.name.includes("RACE") ? "tracking-[0.1em]" : ""}`}
                  style={{
                    textShadow: `0 0 30px ${theme.primaryColor || "#00aaff"}80`,
                    fontFamily: theme.name.includes("DRIVE")
                      ? "Michroma, sans-serif"
                      : "Orbitron, sans-serif",
                  }}
                >
                  {Math.round(currentSpeed).toString().padStart(3, "0")}
                </span>
                <span
                  className="text-[2.5cqh] font-bold italic tracking-[0.5em] opacity-80 text-white/80"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  MPH
                </span>
              </div>
            </div>

            {/* Bottom Diagnostics */}
            <div className="w-[120%] flex flex-col items-center mt-[4cqh] mb-[2cqh]">
              <div className="w-full flex items-center justify-between text-[1.4cqh] font-bold uppercase tracking-widest opacity-60">
                <div className="flex-1 flex justify-end">
                  <span>HP CHARGE</span>
                </div>
                <div className="w-[30%] flex justify-center">
                  <span
                    className="text-[2cqh] opacity-100 tabular-nums px-6 py-0.5 rounded shadow-[inset_0_0_10px_currentColor] border border-white/10"
                    style={{
                      color: theme.name.includes("DRIVE")
                        ? "#a855f7"
                        : theme.name.includes("SPORT")
                          ? "#ef4444"
                          : "#ef4444",
                    }}
                  >
                    {powerHp}
                  </span>
                </div>
                <div className="flex-1 flex justify-start">
                  <span>POWER HP</span>
                </div>
              </div>
              <div className="w-full flex items-center justify-center gap-[4cqw] mt-[2cqh] text-[1.8cqh] font-bold opacity-80">
                <div className="flex items-center gap-2">
                  <span>
                    {Math.round(((controlModuleVoltage ?? 13.6) / 14.4) * 100)}%
                  </span>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16 4h-2V2h-4v2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 10h-2v4h-2v-4H9v-2h2V8h2v4h2v2z" />
                  </svg>
                </div>
                <div className="h-[3cqh] w-[2px] bg-white/30" />
                <svg
                  className="w-[5cqh] h-[5cqh] opacity-80 mt-[-1cqh]"
                  viewBox="0 0 300 100"
                  fill="currentColor"
                  style={{
                    color:
                      theme.name.includes("RACE") ||
                      theme.name.includes("SPORT")
                        ? "#ef4444"
                        : theme.primaryColor,
                  }}
                >
                  <path d="M150 10 L 250 90 L 50 90 Z" />
                </svg>
                <div className="h-[3cqh] w-[2px] bg-white/30" />
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1v4h-2V5z" />
                  </svg>
                  <span>{temp}°</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT WING - Vehicle Info & Media */}
          <div className="w-[30%] h-full flex flex-col items-end p-[2cqw] relative bg-[#0A0B10]/40 border border-white/15 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)] rounded-[2cqw]">
            {/* Driver Info */}
            <div className="flex items-center gap-[1cqw]">
              <div className="flex flex-col items-end text-right">
                <span
                  className="text-[1.8cqh] font-bold opacity-90 text-white"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  Armağan Arabul
                </span>
                <span className="text-[1.4cqh] font-bold opacity-50 uppercase tracking-widest text-[#9ca3af]">
                  Driver
                </span>
              </div>
              <div className="w-[5cqh] h-[5cqh] rounded-full bg-slate-800 overflow-hidden border-2 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Armagan&backgroundColor=transparent&accessories=sunglasses`}
                  className="w-full h-full object-cover grayscale brightness-125"
                />
              </div>
            </div>

            {/* New PIDs in Right Panel - Look like Skin 4 */}
            <div className="flex-1 flex flex-col justify-center gap-6 w-full mt-[4cqh] pr-4">
              <PidBox
                label="Battery"
                value={(data?.batteryVolts || 12.4).toFixed(1)}
                unit="V"
                color={theme.accentColor || "#38bdf8"}
                align="right"
                borderSide="right"
                className="shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10"
                data={data}
              />
              <PidBox
                label="Drive Load"
                value={Math.round(data?.engineLoad || 0)}
                unit="%"
                color={theme.secondaryColor || "#ff0055"}
                align="right"
                borderSide="right"
                className="shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10"
                data={data}
              />
              <PidBox
                label="Intake Temp"
                value={Math.round(data?.intakeTemp || 0)}
                unit="°C"
                color={theme.primaryColor || "#f59e0b"}
                align="right"
                borderSide="right"
                className="shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10"
                data={data}
              />
            </div>

            <div className="flex items-center justify-end w-full gap-[1.5cqw] text-[1.6cqh] font-bold opacity-70 mt-auto uppercase tracking-widest pt-[2cqh] border-t border-white/10">
              <span>4500 KM</span>
              <div className="w-px h-[2cqh] bg-white/30" />
              <span>24°</span>
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
  },
);
