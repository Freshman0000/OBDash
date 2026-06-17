import { Ticker } from "./Ticker";
import React, { useMemo } from "react";
import { GaugeProps } from "./Gauge";
import { Thermometer, Zap, Battery, Activity, Droplets } from "lucide-react";
import { WarningLights } from "../App";

export const PerspectiveClusterGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, navState, theme }) => {
    const primary = theme.primaryColor || "#ef4444"; // Default to AMG Red style
    const bg = theme.backgroundColor || "#0a0a0a";

    const rpmPercent = Math.min(100, (value / 8) * 100);

    // Create an animated background tunnel effect
    const bgTunnelStyle = {
      backgroundImage: `repeating-linear-gradient(rgba(255,255,255,0.02) 0px, transparent 1px, transparent 4cqh), repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, transparent 1px, transparent 4cqw)`,
      transform: "perspective(1000px) rotateX(60deg) translateY(-20%)",
      transformOrigin: "top center",
    };

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
        className={`w-full h-full relative ${theme.fontFamily || "font-tech"} text-white overflow-hidden rounded-[2cqw] border-4 border-[#121212] border-t-[#222] border-b-[#050505] shadow-[inset_0_20px_60px_rgba(0,0,0,0.9),inset_0_-10px_20px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,1)] flex items-center justify-center realistic-bezel ${theme.overlay ? "brightness-110 contrast-125" : ""}`}
        style={{ backgroundColor: bg, containerType: "size" }}
      >
        {/* Extreme Deep Background with Vignette */}
        <div
          className={`absolute inset-0 mix-blend-screen opacity-100 z-0 ${getBgClass()}`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] z-0 pointer-events-none" />

        {/* HUD Scanlines */}
        <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.05] bg-[linear-gradient(transparent_50%,black_50%)] bg-[size:100%_4px]" />

        {/* 3D Horizon / Tunnel Effect */}
        <div className="absolute inset-x-0 bottom-0 top-[40%] flex justify-center items-end overflow-hidden z-0">
          <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-black to-transparent z-10" />
          {/* Layered Animated Grids for Depth */}
          <div
            className="w-[300%] h-[200%] flex flex-col justify-end animate-[bg-scan_8s_linear_infinite] absolute"
            style={{ ...bgTunnelStyle, opacity: 0.5 }}
          >
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(to top, ${primary}33, transparent 50%)`,
              }}
            />
          </div>
          <div
            className="w-[300%] h-[200%] flex flex-col justify-end animate-[bg-scan_4s_linear_infinite] absolute"
            style={{
              ...bgTunnelStyle,
              transform:
                "perspective(1000px) rotateX(60deg) translateY(-10%) scale(1.2)",
              opacity: 0.3,
            }}
          >
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(to top, ${primary}22, transparent 50%)`,
              }}
            />
          </div>

          <div
            className="absolute bottom-0 w-[60%] h-[80%] blur-[120px]"
            style={{ backgroundColor: primary, opacity: 0.1 }}
          />
        </div>

        {/* Sub-panels (Left & Right Flanks) simulating angled 3D screens */}
        <div
          className="absolute inset-y-[10cqh] left-[4cqw] w-[25cqw] rounded-[1.5rem] bg-[#0A0B10]/40 border border-white/15 backdrop-blur-[24px] shadow-[20px_0_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_0_20px_rgba(255,255,255,0.02)] flex flex-col justify-around items-end pr-[3cqw] py-[2cqh] z-20 realistic-bezel"
          style={{ transform: "perspective(1000px) rotateY(15deg)" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          {[
            {
              label: "COOLANT",
              val: Math.round(data?.coolantTemp || 0),
              max: 120,
              unit: "°C",
              color: theme.secondaryColor || "#38bdf8",
            },
            {
              label: "OIL TEMP",
              val: Math.round(data?.oilTemp || 0),
              max: 150,
              unit: "°C",
              color: theme.primaryColor || "#fff",
            },
            {
              label: "FUEL",
              val: Math.round(data?.fuelLevel || 0),
              max: 100,
              unit: "%",
              color: theme.accentColor || "#ff0055",
            },
            {
              label: "G FORCE",
              val: (data?.gForce || 0).toFixed(2),
              max: 2,
              unit: "G",
              color: "#10b981",
            },
          ].map((pid, i) => (
            <div
              key={i}
              className="flex flex-col items-end gap-0.5 text-right w-full pl-[2cqw]"
            >
              <div className="flex items-center gap-2">
                <span className="text-[2cqh] font-bold text-white/80 tracking-widest uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
                  {pid.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-[8.5cqh] font-black tabular-nums leading-none drop-shadow-[0_2px_5px_rgba(0,0,0,1)] text-white digital-embedded"
                  style={{ textShadow: `0 0 10px ${pid.color}` }}
                >
                  {pid.val}
                </span>
                <span
                  className="text-[3cqh] font-bold drop-shadow-md bg-white/5 border px-1 rounded-sm text-white/80"
                  style={{ borderColor: pid.color }}
                >
                  {pid.unit}
                </span>
              </div>
              {/* Bar Gauge */}
              <div className="w-full h-[0.8cqh] bg-black/50 border border-white/10 rounded-full overflow-hidden mt-1 mt-0.5">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, (Number(pid.val) / pid.max) * 100))}%`,
                    backgroundColor: pid.color,
                    boxShadow: `0 0 8px ${pid.color}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          className="absolute inset-y-[10cqh] right-[4cqw] w-[25cqw] rounded-[1.5rem] bg-[#0A0B10]/40 border border-white/15 backdrop-blur-[24px] shadow-[-20px_0_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_0_20px_rgba(255,255,255,0.02)] flex flex-col justify-around items-start pl-[3cqw] py-[2cqh] z-20 realistic-bezel"
          style={{ transform: "perspective(1000px) rotateY(-15deg)" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          {[
            {
              label: "BATTERY",
              val: (data?.voltage || 12.4).toFixed(1),
              max: 16,
              unit: "V",
              color: theme.secondaryColor || "#38bdf8",
            },
            {
              label: "INTAKE",
              val: Math.round(data?.intakeTemp || 0),
              max: 100,
              unit: "°C",
              color: theme.primaryColor || "#fff",
            },
            {
              label: "BOOST",
              val: (data?.boost || 0).toFixed(1),
              max: 25,
              unit: "PSI",
              color: theme.accentColor || "#ff0055",
            },
            {
              label: "INST FUEL",
              val: (data?.instantFuel || 0).toFixed(1),
              max: 30,
              unit: "L/100",
              color: "#f59e0b",
            },
          ].map((pid, i) => (
            <div
              key={i}
              className="flex flex-col items-start gap-0.5 text-left w-full pr-[2cqw]"
            >
              <div className="flex items-center gap-2">
                <span className="text-[2cqh] font-bold text-white/80 tracking-widest uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
                  {pid.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-[8.5cqh] font-black tabular-nums leading-none drop-shadow-[0_2px_5px_rgba(0,0,0,1)] text-white digital-embedded"
                  style={{ textShadow: `0 0 10px ${pid.color}` }}
                >
                  {pid.val}
                </span>
                <span
                  className="text-[3cqh] font-bold drop-shadow-md bg-white/5 border px-1 rounded-sm text-white/80"
                  style={{ borderColor: pid.color }}
                >
                  {pid.unit}
                </span>
              </div>
              {/* Bar Gauge */}
              <div className="w-full h-[0.8cqh] bg-black/50 border border-white/10 rounded-full overflow-hidden mt-1 mt-0.5">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, (Number(pid.val) / pid.max) * 100))}%`,
                    backgroundColor: pid.color,
                    boxShadow: `0 0 8px ${pid.color}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Center Main HUD */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none mt-[8cqh]">
          {/* Decorative rotating elements */}
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90cqh] h-[90cqh] animate-spin-slow opacity-30"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="5 15"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={primary}
              strokeWidth="1"
              strokeDasharray="20 40"
            />
          </svg>
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85cqh] h-[85cqh] animate-spin-slow-reverse opacity-20"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="1 10"
            />
          </svg>

          {/* Giant RPM Arch */}
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80cqh] h-[80cqh] overflow-visible"
            viewBox="0 0 200 200"
          >
            <defs>
              <filter
                id="glowArch"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Background Track */}
            <path
              d="M 40 160 A 85 85 0 1 1 160 160"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active RPM Arch */}
            <path
              d="M 40 160 A 85 85 0 1 1 160 160"
              fill="none"
              stroke={primary}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="377"
              strokeDashoffset={377 - (377 * rpmPercent) / 100}
              filter="url(#glowArch)"
            />
          </svg>

          {/* Speed Digital Readout */}
          <div className="flex flex-col items-center justify-center bg-[#0A0B10]/40 backdrop-blur-[24px] rounded-[t-3rem] w-[50cqh] h-[50cqh] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_0_100px_rgba(0,0,0,1)] rounded-full relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none mix-blend-screen" />
            {/* Big RPM readout ABOVE speed */}
            <div className="flex flex-col items-center justify-center mt-[-8cqh]">
              <span
                className="text-[16cqh] font-black font-heavy text-[#fff] tabular-nums leading-[0.8] min-w-[4ch] text-center"
                style={{
                  color: value > 6 ? "#ef4444" : "white",
                  textShadow: "0 0 15px currentColor",
                }}
              >
                {Math.min(9999, Math.round(data?.rpm ?? value * 1000))}
              </span>
            </div>

            <span
              className={`text-[11cqh] font-heavy font-black tabular-nums leading-none text-white mt-[3cqh] digital-embedded tracking-[-0.05em]`}
            >
              {Math.round(speed)}
            </span>
            <span className="text-[2.5cqh] font-black tracking-[0.5em] text-white/60 uppercase mt-2">
              MPH
            </span>
          </div>
        </div>

        {/* Top Info Bar */}
        <div className="absolute top-[4cqh] left-1/2 -translate-x-1/2 flex items-center gap-[6cqw] z-40 bg-[#0A0B10]/60 backdrop-blur-[24px] px-12 py-3 rounded-full border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-[2cqh] font-bold tracking-widest uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
              GEAR
            </span>
            <span
              className="text-[5cqh] font-black drop-shadow-[0_2px_5px_rgba(0,0,0,1)]"
              style={{ color: theme.accentColor || "#fff" }}
            >
              {gear}
            </span>
          </div>
          <div className="w-px h-[4cqh] bg-white/20" />
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-[2cqh] font-bold tracking-widest uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
              BOOST
            </span>
            <span
              className="text-[5cqh] font-black drop-shadow-[0_2px_5px_rgba(0,0,0,1)] tabular-nums"
              style={{ color: theme.secondaryColor || "#38bdf8" }}
            >
              {(data?.boost || 0).toFixed(1)}
            </span>
            <span
              className="text-[2cqh] font-bold uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,1)]"
              style={{ color: theme.secondaryColor || "#38bdf8", opacity: 0.5 }}
            >
              PSI
            </span>
          </div>
        </div>

        {/* Warning Lights at Bottom */}
        <div className="absolute bottom-[4cqh] left-1/2 -translate-x-1/2 z-40 scale-[0.7] origin-bottom">
          <WarningLights lights={data?.warningLights || {}} />
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

PerspectiveClusterGauge.displayName = "PerspectiveClusterGauge";
