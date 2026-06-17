import React from "react";
import {
  ThemeConfig,
  VehicleData,
  CustomSkin,
  NavigationState,
} from "../types";
import { DETAILED_SKINS } from "./DetailedGauges";
import { THEMES } from "../constants";
import {
  Fuel,
  Zap,
  Thermometer,
  Droplet,
  Activity,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Wind,
  Gauge as GaugeIcon,
  ShieldCheck,
  AlertTriangle,
  Target,
  Crosshair,
} from "lucide-react";
import { AggressiveRaceGauge } from "./AggressiveRaceGauge";
import { CarbonSweepGauge } from "./CarbonSweepGauge";
import { F1LCDGauge } from "./F1LCDGauge";
import { Ticker } from "./Ticker";
import { ModernEVGauge } from "./ModernEVGauge";
import { PerspectiveClusterGauge } from "./PerspectiveClusterGauge";
import { FuturisticGraphGauge } from "./FuturisticGraphGauge";
import { PremiumCircularGauge } from "./PremiumCircularGauge";
import { RacingHorizontalGauge } from "./RacingHorizontalGauge";
import { QuasarGauge } from "./QuasarGauge";
import { DigitalDashRetro } from "./DigitalDashRetro";
import { FighterJetHUDGauge as FighterJetHUDGaugeImported } from "./FighterJetHUDGauge";

export interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  theme: ThemeConfig;
  className?: string;
  size?: number;
  speed?: number;
  gear?: string;
  data?: VehicleData;
  navState?: NavigationState;
  backlit?: boolean;
  customSkin?: CustomSkin;
  layoutVariant?: number;
}

// Helper for responsive text sizing
const ResponsiveText: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "huge";
  color?: string;
}> = ({ children, className = "", size = "md", color }) => {
  const sizes = {
    xs: "text-[1.2cqh]",
    sm: "text-[1.8cqh]",
    md: "text-[2.5cqh]",
    lg: "text-[4.5cqh]",
    xl: "text-[7cqh]",
    "2xl": "text-[10cqh]",
    "3xl": "text-[15cqh]",
    "4xl": "text-[20cqh]",
    huge: "text-[28cqh]",
  };

  return (
    <span
      className={`${sizes[size]} ${className} leading-none`}
      style={{ color }}
    >
      {children}
    </span>
  );
};

import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

const RPM_FONTS = [
  "font-lcd",
  "font-lcd-italic",
  "font-digital",
  "font-bitcount",
  "font-tech",
  "font-anton",
  "font-bebas",
  "font-chakra",
  "font-orbitron",
  "font-oswald",
  "font-teko",
  "font-share",
];

export const ResponsiveValue: React.FC<{
  value: string | number;
  className?: string;
  isRpm?: boolean;
  theme?: ThemeConfig;
  padLength?: number;
}> = ({ value, className, isRpm, theme, padLength }) => {
  const numericValue =
    typeof value === "number" ? value : parseFloat(value as string) || 0;

  // Smooth roll back for RPM
  const springValue = useSpring(numericValue, {
    stiffness: 180,
    damping: 20,
    mass: 0.5,
  });

  const [displayValue, setDisplayValue] = useState(numericValue);

  useEffect(() => {
    if (isRpm) {
      springValue.set(numericValue);
    } else {
      setDisplayValue(numericValue);
    }
  }, [numericValue, isRpm, springValue]);

  useEffect(() => {
    if (isRpm) {
      return springValue.on("change", (latest) => {
        setDisplayValue(Math.max(0, Math.round(latest)));
      });
    }
  }, [springValue, isRpm]);

  const rounded = Math.round(displayValue);
  const cappedValue = isRpm ? Math.min(9999, rounded) : rounded;
  const finalDisplay = padLength
    ? cappedValue.toString().padStart(padLength, "0")
    : cappedValue;

  const rpmFontClass = isRpm
    ? "font-lcd tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tabular-nums digital-embedded text-[1.15em]"
    : "digital-embedded";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className || ""} ${rpmFontClass}`}
      style={isRpm ? { minWidth: "5.2ch", textAlign: "right" } : undefined}
    >
      <span
        className="relative z-10 inline-block text-inherit"
        style={{ color: "inherit" }}
      >
        {finalDisplay}
      </span>
    </div>
  );
};

const AVAILABLE_PIDS = [
  { label: "SPEED", key: "speed", unit: "MPH" },
  { label: "RPM", key: "rpm", unit: "RPM" },
  { label: "COOLANT", key: "coolantTemp", unit: "°F" },
  { label: "FUEL", key: "fuelLevel", unit: "%" },
  { label: "VOLTS", key: "voltage", unit: "V" },
  { label: "THROTTLE", key: "throttlePos", unit: "%" },
  { label: "LOAD", key: "engineLoad", unit: "%" },
  { label: "BOOST", key: "boost", unit: "PSI" },
  { label: "OIL TEMP", key: "oilTemp", unit: "°F" },
  { label: "OIL PSI", key: "oilPressure", unit: "PSI" },
  { label: "INTAKE", key: "intakeTemp", unit: "°F" },
  { label: "G-FORCE", key: "acceleration", unit: "G" },
  { label: "FUEL CONS", key: "fuelConsumption", unit: "MPG" },
];

export const PidBox: React.FC<{
  label: string;
  value: string | number;
  unit: string;
  color: string;
  align?: "left" | "right";
  borderSide?: "left" | "right";
  data?: any;
  className?: string;
}> = ({
  label: initialLabel,
  value: initialValue,
  unit: initialUnit,
  color,
  align = "left",
  borderSide = "left",
  data,
  className = "",
}) => {
  const [currentPid, setCurrentPid] = React.useState<{
    label: string;
    unit: string;
    key?: string;
  }>({ label: initialLabel, unit: initialUnit });

  const handleClick = () => {
    const randomPid =
      AVAILABLE_PIDS[Math.floor(Math.random() * AVAILABLE_PIDS.length)];
    setCurrentPid(randomPid);
  };

  let displayValue = initialValue;
  if (currentPid.key && data) {
    const val = data[currentPid.key];
    if (typeof val === "number") {
      displayValue = val % 1 !== 0 ? val.toFixed(1) : Math.round(val);
    } else {
      displayValue = val || 0;
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col ${align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left"} ${borderSide === "left" ? "border-l-[0.8cqw] border-t-2" : borderSide === "right" ? "border-r-[0.8cqw] border-b-2" : "border-t-2 border-b-2"} p-[2cqh] px-[1cqw] justify-center bg-[#020202] shadow-[inset_0_5px_15px_rgba(0,0,0,1),0_2px_5px_rgba(0,0,0,0.8)] ring-1 ring-white/5 transition-all hover:bg-white/5 group w-full flex-1 relative overflow-hidden rounded-[1cqh] cursor-pointer ${className}`}
      style={{
        [borderSide === "left"
          ? "borderLeftColor"
          : borderSide === "right"
            ? "borderRightColor"
            : "borderColor"]: color,
        [borderSide === "left"
          ? "borderTopColor"
          : borderSide === "right"
            ? "borderBottomColor"
            : "borderColor"]: `${color}40`,
      }}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-300 transition-opacity pointer-events-none" />
      <div
        className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 blur-2xl rounded-full pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <div
        className={`flex items-center gap-[1.5cqw] w-full relative z-10 ${align === "center" ? "justify-center" : ""}`}
      >
        <div
          className={`flex flex-col flex-1 ${align === "center" ? "items-center" : ""}`}
        >
          <div
            className={`flex items-baseline gap-[1cqw] ${align === "center" ? "justify-center" : ""}`}
          >
            <span
              className="text-[9cqh] font-micro font-black text-white tabular-nums drop-shadow-[0_2px_5px_rgba(0,0,0,1)] leading-none text-shadow-glow"
              style={{ textShadow: `0 0 15px ${color}` }}
            >
              <ResponsiveValue value={displayValue} />
            </span>
            <span
              className="text-[5cqh] font-black opacity-100 uppercase tracking-widest font-micro drop-shadow-[0_0_10px_currentColor]"
              style={{ color }}
            >
              {currentPid.unit}
            </span>
          </div>
          <span
            className="text-[2.5cqh] font-black opacity-100 uppercase tracking-[0.6em] italic group-hover:opacity-300 transition-opacity z-10 font-micro mt-[1cqh] drop-shadow-[0_0_10px_currentColor] border-b pb-1"
            style={{ color: color, borderBottomColor: `${color}40` }}
          >
            {currentPid.label}
          </span>
        </div>
      </div>
    </div>
  );
};

// Horizontal Bar Gauge for Fuel/Energy
export const HorizontalBarGauge: React.FC<{
  value: number;
  color: string;
  label: string;
}> = ({ value, color, label }) => {
  const segments = 20;
  const activeSegments = Math.ceil((value / 100) * segments);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[1.2cqh] font-black tracking-[0.4em] text-white/40 uppercase">
          {label}
        </span>
        <span className="text-[2cqh] font-black text-white tabular-nums">
          {value}%
        </span>
      </div>
      <div className="flex gap-[0.5cqw] h-[2cqh] w-full items-center px-[0.2cqw]">
        {[...Array(segments)].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-full rounded-sm"
            style={{
              backgroundColor:
                i < activeSegments ? color : "rgba(255,255,255,0.05)",
              boxShadow: i < activeSegments ? `0 0 15px ${color}88` : "none",
              opacity: i < activeSegments ? 1 : 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Standard Telemetry Grid for all performance skins
const TelemetryGrid: React.FC<{
  data: VehicleData | undefined;
  color: string;
  useVerticalDividers?: boolean;
  compact?: boolean;
}> = React.memo(
  ({ data, color, useVerticalDividers = false, compact = false }) => {
    const items = [
      {
        label: "OIL TEMP",
        value: `${Math.round(data?.oilTemp || 0)}°F`,
        icon: Thermometer,
      },
      {
        label: "BOOST",
        value: `${(data?.boost ?? 0).toFixed(1)} PSI`,
        icon: Activity,
      },
      {
        label: "VOLTS",
        value: `${(data?.voltage ?? 0).toFixed(1)}V`,
        icon: Zap,
      },
      {
        label: "LOAD",
        value: `${Math.round(data?.engineLoad || 0)}%`,
        icon: Activity,
      },
      {
        label: "INTAKE",
        value: `${Math.round(data?.intakeTemp || 0)}°F`,
        icon: Wind,
      },
      {
        label: "THROTTLE",
        value: `${Math.round(data?.throttlePos || 0)}%`,
        icon: Zap,
      },
      {
        label: "FUEL",
        value: `${Math.round(data?.fuelLevel || 0)}%`,
        icon: Fuel,
      },
      {
        label: "AIR/FUEL",
        value: `${(data?.engineLoad ? 14.7 - data.engineLoad / 100 : 14.7).toFixed(1)}`,
        icon: Activity,
      },
      {
        label: "TIMING",
        value: `${(data?.rpm ? (data.rpm / 1000) * 5 : 10).toFixed(1)}°`,
        icon: Cpu,
      },
      {
        label: "TPMS",
        value: `${Math.round(data?.tpms?.fl || 0)}/${Math.round(data?.tpms?.fr || 0)}`,
        icon: Activity,
      },
    ];

    return (
      <div
        className={`grid ${compact ? "grid-cols-10" : "grid-cols-5 lg:grid-cols-10"} gap-4 lg:gap-6 w-full h-full items-center overflow-hidden`}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex flex-col items-center justify-center group relative h-full shrink-0 min-w-0 ${useVerticalDividers && i < items.length - 1 ? "border-r border-white/30" : ""}`}
          >
            <div className="flex items-center gap-1 mb-1 opacity-50 group-hover:opacity-100 transition-opacity truncate w-full justify-center">
              <item.icon
                size={compact ? 12 : 16}
                style={{ color: "#e2e8f0" }}
                className="shrink-0"
              />
              <span
                className={`text-[1.2cqh] lg:text-[1.6cqh] font-bold tracking-[0.1em] uppercase italic font-micro text-[#e2e8f0] truncate`}
              >
                {item.label}
              </span>
            </div>
            <span
              className={`text-[2.5cqh] lg:text-[4cqh] font-black tabular-nums transition-all group-hover:scale-110 font-micro-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-white`}
              style={{ textShadow: `0 0 10px ${color}` }}
            >
              {item.value}
            </span>
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] transition-all group-hover:w-1/2"
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </div>
    );
  },
);

export const WarningLights: React.FC<{
  data?: VehicleData;
  className?: string;
}> = ({ data, className = "" }) => {
  if (!data) return null;

  const wl = data.warningLights || {} as any;
  const safeWl = {
    checkEngine: wl?.checkEngine || false,
    oilPressure: wl?.oilPressure || false,
    battery: wl?.battery || false,
    abs: wl?.abs || false,
    traction: wl?.traction || false,
    parkingBrake: wl?.parkingBrake || false,
    tpms: wl?.tpms || false,
    leftSignal: wl?.leftSignal || false,
    rightSignal: wl?.rightSignal || false,
  };
  const coolantTemp = data.coolantTemp || 0;

  const hasCriticalWarning =
    safeWl.checkEngine ||
    safeWl.oilPressure ||
    coolantTemp > 230 ||
    safeWl.battery;

  const lights = [
    {
      icon: <Activity size={16} />,
      active: safeWl.checkEngine,
      color: "text-amber-500",
      label: "ENGINE",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)]",
    },
    {
      icon: <Droplet size={16} />,
      active: safeWl.oilPressure,
      color: "text-red-500",
      label: "OIL",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    },
    {
      icon: <Thermometer size={16} />,
      active: coolantTemp > 230,
      color: "text-red-500",
      label: "TEMP",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    },
    {
      icon: <Zap size={16} />,
      active: safeWl.battery,
      color: "text-red-500",
      label: "BATT",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    },
    {
      icon: <ShieldCheck size={16} />,
      active: safeWl.abs,
      color: "text-amber-500",
      label: "ABS",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)]",
    },
    {
      icon: <Wind size={16} />,
      active: safeWl.traction,
      color: "text-amber-500",
      label: "TRAC",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)]",
    },
    {
      icon: <Activity size={16} />,
      active: safeWl.parkingBrake,
      color: "text-red-600",
      label: "BRAKE",
      glow: "shadow-[0_0_20px_rgba(220,38,38,0.6)]",
    },
    {
      icon: <Wind size={16} />,
      active: safeWl.tpms,
      color: "text-amber-500",
      label: "TIRE",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)]",
    },
    {
      icon: <ChevronLeft size={20} />,
      active: safeWl.leftSignal,
      color: "text-emerald-500",
      label: "LEFT",
      blink: true,
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.8)]",
    },
    {
      icon: <ChevronRight size={20} />,
      active: safeWl.rightSignal,
      color: "text-emerald-500",
      label: "RIGHT",
      blink: true,
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.8)]",
    },
  ];

  return (
    <div className={`flex gap-2 items-center justify-center ${className}`}>
      {/* Master Warning Light */}
      <div
        className={`flex flex-col items-center transition-all duration-500 mr-2 ${hasCriticalWarning ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[pulse_0.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" : "text-white/60 opacity-40"}`}
      >
        <div className="p-1 rounded-sm bg-black/40 border border-white/30 shadow-2xl">
          <AlertTriangle size={14} />
        </div>
        <span className="text-[7.5px] font-black mt-1 tracking-[0.2em] uppercase opacity-80">
          MASTER
        </span>
      </div>

      {lights.map((light, i) => (
        <div
          key={i}
          className={`flex flex-col items-center transition-all duration-500 ${light.active ? `${light.color} opacity-300 ${light.blink ? "animate-[pulse_0.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" : ""}` : "text-white/60 opacity-40"}`}
        >
          <div
            className={`p-1 rounded-lg bg-black/40 border border-white/30 shadow-2xl transition-all duration-300 ${light.active ? `${light.glow}` : ""}`}
          >
            {React.cloneElement(light.icon, { size: 14 })}
          </div>
          <span className="text-[7px] font-black mt-1 tracking-[0.3em] uppercase opacity-60 font-micro">
            {light.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Generic Performance Gauge for the 10 sports car skins
const PerformanceGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const isM = theme.gaugeType === "m-track-v2";
    const rpmPercent = Math.min(100, Math.max(0, (value / 9) * 100));
    const currentRpm = Math.min(9999, Math.round(value * 1000));

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#020202] rounded-[2cqh] overflow-hidden border-2 border-white/30 shadow-[inset_0_0_200px_rgba(0,0,0,1),0_50px_100px_rgba(0,0,0,0.9)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": theme.primaryColor + "15" } as any}
          />
        )}

        {/* Background Depth & Texture - High Fidelity */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,255,255,0.08)_0%,transparent_80%)] opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/90 pointer-events-none" />

        {/* Technical Grid Lines */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none mix-blend-screen"
          style={{
            backgroundImage: `linear-gradient(${theme.primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor} 1px, transparent 1px)`,
            backgroundSize: "4cqw 4cqh",
          }}
        />
        <div className="high-end-gloss" />

        {/* Top Header - Dedicated Row */}
        <div className="h-[12%] flex items-center justify-between px-[4cqw] border-b-2 border-white/40 relative z-10 bg-black/50 backdrop-blur-3xl shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-[3cqw]">
            <div className="relative">
              <div
                className="w-[1.5cqh] h-[1.5cqh] rounded-sm shadow-[0_0_25px_currentColor]"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <div
                className="absolute inset-0 rounded-sm opacity-200 animate-ping"
                style={{ backgroundColor: theme.primaryColor }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-[1.6cqh] tracking-[0.8em] uppercase italic leading-none font-micro">
                {theme.name.replace(/_/g, " ")}
              </span>
              <span className="text-white/70 font-bold text-[0.9cqh] tracking-[0.5em] uppercase mt-1 font-micro">
                AEROSPACE_GRADE_TELEMETRY
              </span>
            </div>
            <WarningLights data={data} className="ml-12" />
          </div>
          <div className="flex items-center gap-[4cqw]">
            <div className="flex flex-col items-end">
              <span className="text-white/80 font-black text-[1.4cqh] tracking-[0.5em] uppercase italic font-micro">
                SYSTEM_SYNC
              </span>
              <div className="flex gap-1.5 mt-1.5">
                <div
                  className="w-5 h-1.5 rounded-sm shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div
                  className="w-5 h-1.5 rounded-sm shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div className="w-5 h-1.5 bg-white/20 rounded-sm animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Rectangular Layout */}
        <div className="flex-1 flex flex-col relative z-10 p-[2cqh] gap-[2cqh]">
          {/* Massive RPM Display */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-[1cqh]">
              <span
                className="text-[3cqh] font-black tracking-[0.5em] uppercase opacity-200 font-micro"
                style={{ color: theme.primaryColor }}
              >
                ENGINE RPM
              </span>
              <span className="text-[20cqh] font-black leading-none tracking-tighter tabular-nums font-micro text-white">
                <ResponsiveValue
                  value={currentRpm}
                  isRpm={true}
                  theme={theme}
                />
              </span>
            </div>

            {/* Rectangular RPM Bar */}
            <div className="w-full h-[10cqh] bg-black/50 border-2 border-white/40 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] skew-x-[-10deg]">
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2cqw_100%]" />

              {/* Fill */}
              <div
                className="absolute top-0 left-0 h-full transition-none flex items-center justify-end pr-[1cqw]"
                style={{
                  width: `${rpmPercent}%`,
                  background: `linear-gradient(90deg, ${theme.primaryColor}40, ${theme.primaryColor})`,
                }}
              >
                <div className="w-[1cqw] h-[80%] bg-white shadow-[0_0_20px_#fff]" />
              </div>

              {/* Ticks and Numbers */}
              <div className="absolute inset-0 flex justify-between px-[1cqw] items-end pb-[1cqh]">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div
                    key={num}
                    className="flex flex-col items-center justify-end h-full"
                  >
                    <span className="text-[2cqh] font-bold text-white/80 mb-[1cqh] font-micro">
                      {num}
                    </span>
                    <div
                      className={`w-[2px] ${num >= 7 ? "h-[4cqh] bg-red-500" : "h-[2cqh] bg-white/30"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Data Row */}
          <div className="flex items-stretch gap-[2cqw] h-[35cqh]">
            {/* Speed & Gear Block */}
            <div className="flex-1 bg-black/30 border border-white/30 flex items-center justify-between p-[2cqw] relative overflow-hidden skew-x-[-5deg]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="flex flex-col relative z-10">
                <span
                  className="text-[2cqh] font-bold tracking-[0.5em] opacity-200 font-micro"
                  style={{ color: theme.primaryColor }}
                >
                  SPEED
                </span>
                <div className="flex items-baseline gap-[1cqw]">
                  <span className="text-[16cqh] font-black leading-none tracking-tighter tabular-nums font-micro text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <ResponsiveValue
                      value={Math.round(speed || 0)}
                      theme={theme}
                    />
                  </span>
                  <span
                    className="text-[3cqh] font-bold tracking-[0.2em] opacity-200 font-micro"
                    style={{ color: theme.primaryColor }}
                  >
                    MPH
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center relative z-10 border-l-2 border-white/30 pl-[4cqw]">
                <span
                  className="text-[2cqh] font-bold tracking-[0.5em] opacity-200 font-micro mb-[1cqh]"
                  style={{ color: theme.primaryColor }}
                >
                  GEAR
                </span>
                <div className="w-[14cqh] h-[14cqh] bg-white/10 flex items-center justify-center border border-white/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <span
                    className="text-[10cqh] font-black text-white font-micro-bold drop-shadow-[0_0_15px_currentColor]"
                    style={{ color: theme.primaryColor }}
                  >
                    {gear}
                  </span>
                </div>
              </div>
            </div>

            {/* Throttle and Load Bars */}
            <div className="w-[30%] flex flex-col gap-[2cqh] justify-center">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[1.5cqh] font-bold text-white/80 font-micro uppercase">
                  <span>THR</span>
                  <span>{Math.round(data.throttlePos || 0)}%</span>
                </div>
                <div className="h-[2cqh] bg-white/10 border border-white/40 overflow-hidden skew-x-[-15deg]">
                  <div
                    className="h-full transition-none"
                    style={{
                      width: `${data.throttlePos || 0}%`,
                      backgroundColor: theme.primaryColor,
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[1.5cqh] font-bold text-white/80 font-micro uppercase">
                  <span>LOAD</span>
                  <span>{Math.round(data.engineLoad || 0)}%</span>
                </div>
                <div className="h-[2cqh] bg-white/10 border border-white/40 overflow-hidden skew-x-[-15deg]">
                  <div
                    className="h-full bg-orange-500 transition-none"
                    style={{ width: `${data.engineLoad || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[18%] mt-auto shrink-0 p-2 relative z-20">
          <div className="h-full bg-black/50 rounded-[1cqh] border-2 border-white/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex items-center px-[4cqw] ring-1 ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-40" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
            <TelemetryGrid
              data={data}
              color={theme.primaryColor}
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const WidePerformanceGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, Math.max(0, (value / 9) * 100));
    const currentRpm = Math.min(9999, Math.round(value * 1000));

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#050505] rounded-[2cqh] overflow-hidden border-2 shadow-[inset_0_0_150px_rgba(0,0,0,1)] flex flex-col"
        style={{
          containerType: "size",
          borderColor: theme.primaryColor + "40",
        }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-25 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_80%)]" />
        <div
          className="absolute inset-0 opacity-30 pointer-events-none mix-blend-screen"
          style={{
            backgroundImage: `linear-gradient(${theme.primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor} 1px, transparent 1px)`,
            backgroundSize: "3cqw 3cqh",
          }}
        />

        {/* Top Header */}
        <div
          className="h-[10%] flex items-center justify-between px-[4cqw] border-b-2 relative z-10 bg-black/70 backdrop-blur-2xl shrink-0 shadow-2xl"
          style={{ borderColor: theme.primaryColor + "40" }}
        >
          <div className="flex items-center gap-[2cqw]">
            <div
              className="w-[1.4cqh] h-[1.4cqh] rounded-sm shadow-[0_0_20px_currentColor] animate-pulse"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <span
              className="font-black text-[1.8cqh] tracking-[1.2em] uppercase italic font-micro drop-shadow-[0_0_10px_currentColor]"
              style={{ color: theme.primaryColor }}
            >
              {theme.name.replace(/_/g, " ")}
            </span>
            <WarningLights data={data} className="ml-8" />
          </div>
          <div
            className="font-black text-[1.2cqh] tracking-[0.8em] uppercase italic font-micro opacity-60"
            style={{ color: theme.primaryColor }}
          >
            HYPER_PERFORMANCE_MODE
          </div>
        </div>

        <div className="flex-1 flex relative z-10 min-h-0">
          {/* Left Sidebar */}
          <div
            className="w-[22%] flex flex-col gap-[1.5cqh] py-[2cqh] px-[1.5cqw] border-r-2 bg-black/30 backdrop-blur-xl relative overflow-hidden"
            style={{ borderColor: theme.primaryColor + "20" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5" />
            <PidBox
              data={data}
              label="COOLANT"
              value={data.coolantTemp}
              unit="°F"
              color={theme.primaryColor}
              align="left"
              borderSide="left"
            />
            <PidBox
              data={data}
              label="BATTERY"
              value={data.voltage.toFixed(1)}
              unit="V"
              color={theme.primaryColor}
              align="left"
              borderSide="left"
            />
            <PidBox
              data={data}
              label="OIL TEMP"
              value={data.oilTemp}
              unit="°F"
              color={theme.primaryColor}
              align="left"
              borderSide="left"
            />
            <PidBox
              data={data}
              label="OIL PRES"
              value={data.oilPressure}
              unit="PSI"
              color={theme.primaryColor}
              align="left"
              borderSide="left"
            />
          </div>

          {/* Center Content - Rectangular Focus */}
          <div className="flex-1 flex flex-col relative px-[3cqw] py-[2cqh] overflow-hidden justify-center gap-[4cqh]">
            <div
              className="absolute -inset-32 blur-[140px] opacity-30"
              style={{ backgroundColor: theme.primaryColor }}
            />

            {/* Massive RPM Section */}
            <div className="flex flex-col relative z-10 w-full">
              <div className="flex justify-between items-end mb-[1cqh]">
                <span
                  className="text-[3cqh] font-bold uppercase tracking-[1em] font-micro opacity-60"
                  style={{ color: theme.primaryColor }}
                >
                  ENGINE_RPM
                </span>
                <span
                  className={`text-[24cqh] font-black text-white tabular-nums leading-none ${theme.fontFamily || ""}`}
                >
                  <ResponsiveValue
                    value={currentRpm}
                    isRpm={true}
                    theme={theme}
                  />
                </span>
              </div>

              {/* Rectangular RPM Bar */}
              <div className="w-full h-[12cqh] bg-black/50 border-2 border-white/40 relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] skew-x-[-15deg]">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3cqw_100%]" />

                <div
                  className="absolute top-0 left-0 h-full transition-none flex items-center justify-end pr-[1cqw]"
                  style={{
                    width: `${rpmPercent}%`,
                    background: `linear-gradient(90deg, ${theme.primaryColor}40, ${theme.primaryColor})`,
                  }}
                >
                  <div className="w-[1.5cqw] h-[80%] bg-white shadow-[0_0_30px_#fff]" />
                </div>

                <div className="absolute inset-0 flex justify-between px-[1cqw] items-end pb-[1cqh]">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                      key={num}
                      className="flex flex-col items-center justify-end h-full"
                    >
                      <span className="text-[2.5cqh] font-bold text-white/80 mb-[1cqh] font-micro">
                        {num}
                      </span>
                      <div
                        className={`w-[3px] ${num >= 7 ? "h-[5cqh] bg-red-500" : "h-[3cqh] bg-white/30"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Speed and Gear Row */}
            <div className="flex items-stretch gap-[4cqw] relative z-10 h-[30cqh]">
              <div className="flex-1 bg-black/60 border-2 border-white/30 flex items-center justify-between p-[3cqw] relative overflow-hidden skew-x-[-10deg]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="flex flex-col relative z-10">
                  <span
                    className="text-[3cqh] font-bold tracking-[0.5em] opacity-200 font-micro"
                    style={{ color: theme.primaryColor }}
                  >
                    SPEED
                  </span>
                  <div className="flex items-baseline gap-[2cqw]">
                    <span className="text-[20cqh] font-black leading-none tracking-tighter tabular-nums font-micro text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      <ResponsiveValue
                        value={Math.round(speed || 0)}
                        theme={theme}
                      />
                    </span>
                    <span
                      className="text-[4cqh] font-bold tracking-[0.2em] opacity-200 font-micro"
                      style={{ color: theme.primaryColor }}
                    >
                      MPH
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-[30%] bg-black/60 border-2 border-white/30 flex flex-col items-center justify-center relative overflow-hidden skew-x-[-10deg]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <span
                  className="text-[3cqh] font-bold tracking-[0.5em] opacity-200 font-micro mb-[2cqh]"
                  style={{ color: theme.primaryColor }}
                >
                  GEAR
                </span>
                <div className="w-[16cqh] h-[16cqh] bg-white/10 flex items-center justify-center border-2 border-white/40 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                  <span
                    className="text-[12cqh] font-black text-white font-micro-bold drop-shadow-[0_0_20px_currentColor]"
                    style={{ color: theme.primaryColor }}
                  >
                    {gear}
                  </span>
                </div>
              </div>
            </div>

            {/* Throttle and Load Bars */}
            <div className="flex gap-[6cqw] mt-[2cqh] w-[60%] opacity-80 relative z-10">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[1.5cqh] font-bold text-white/80 font-micro uppercase">
                  <span>THR</span>
                  <span>{Math.round(data.throttlePos || 0)}%</span>
                </div>
                <div className="h-[2cqh] bg-white/10 border border-white/40 overflow-hidden skew-x-[-15deg]">
                  <div
                    className="h-full transition-none"
                    style={{
                      width: `${data.throttlePos || 0}%`,
                      backgroundColor: theme.primaryColor,
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[1.5cqh] font-bold text-white/80 font-micro uppercase">
                  <span>LOAD</span>
                  <span>{Math.round(data.engineLoad || 0)}%</span>
                </div>
                <div className="h-[2cqh] bg-white/10 border border-white/40 overflow-hidden skew-x-[-15deg]">
                  <div
                    className="h-full bg-orange-500 transition-none"
                    style={{ width: `${data.engineLoad || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div
            className="w-[22%] flex flex-col gap-[1.5cqh] py-[2cqh] px-[1.5cqw] border-l-2 bg-black/30 backdrop-blur-xl relative overflow-hidden"
            style={{ borderColor: theme.primaryColor + "20" }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/5" />
            <PidBox
              data={data}
              label="BOOST"
              value={data.boost.toFixed(1)}
              unit="PSI"
              color={theme.primaryColor}
              align="right"
              borderSide="right"
            />
            <PidBox
              data={data}
              label="INTAKE"
              value={Math.round(data.intakeTemp)}
              unit="°F"
              color={theme.primaryColor}
              align="right"
              borderSide="right"
            />
            <PidBox
              data={data}
              label="FUEL"
              value={Math.round(data.fuelLevel)}
              unit="%"
              color={theme.primaryColor}
              align="right"
              borderSide="right"
            />
            <PidBox
              data={data}
              label="LOAD"
              value={Math.round(data.engineLoad)}
              unit="%"
              color={theme.primaryColor}
              align="right"
              borderSide="right"
            />
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[15%] mt-auto shrink-0 p-1 relative z-20">
          <div
            className="h-full bg-black/70 rounded-[1cqh] border-2 backdrop-blur-3xl flex items-center px-[6cqw] relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]"
            style={{ borderColor: theme.primaryColor + "30" }}
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,rgba(255,255,255,0.05)_50%)] bg-[size:10%_100%]" />
            <TelemetryGrid
              data={data}
              color={theme.primaryColor}
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const AdventureGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, Math.max(0, (value / 9) * 100));
    const currentRpm = Math.min(9999, Math.round(value * 1000));

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#050805] rounded-[1cqh] overflow-hidden border-4 border-emerald-900 shadow-[inset_0_0_150px_rgba(0,0,0,1)] flex flex-col"
        style={{ containerType: "size" }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.15)_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen"
          style={{
            backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
            backgroundSize: "4cqw 4cqh",
          }}
        />

        {/* Top Header */}
        <div className="h-[10%] flex items-center justify-between px-[4cqw] border-b-4 border-emerald-900 relative z-10 bg-black/50 backdrop-blur-xl shrink-0 shadow-2xl">
          <div className="flex items-center gap-[2cqw]">
            <div className="w-[1.4cqh] h-[1.4cqh] bg-emerald-500 rounded-sm shadow-[0_0_20px_#10b981] animate-pulse" />
            <span className="text-emerald-500 font-black text-[1.8cqh] tracking-[1.2em] uppercase italic font-micro drop-shadow-[0_0_10px_#10b981]">
              ADVENTURE_v3
            </span>
            <WarningLights data={data} className="ml-8" />
          </div>
          <div className="text-emerald-500/60 font-black text-[1.2cqh] tracking-[0.8em] uppercase italic font-micro">
            OFFROAD_READY_SYS
          </div>
        </div>

        <div className="flex-1 flex relative z-10 min-h-0">
          {/* Left Sidebar */}
          <div className="w-[22%] flex flex-col gap-[1.5cqh] py-[2cqh] px-[1.5cqw] border-r-4 border-emerald-900 bg-black/60 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-500/5" />
            <PidBox
              data={data}
              label="COOLANT"
              value={data.coolantTemp}
              unit="°F"
              color="#10b981"
              align="left"
              borderSide="left"
            />
            <PidBox
              data={data}
              label="BATTERY"
              value={(data.voltage || 0).toFixed(1)}
              unit="V"
              color="#10b981"
              align="left"
              borderSide="left"
            />
            <PidBox
              data={data}
              label="OIL TEMP"
              value={data.oilTemp}
              unit="°F"
              color="#10b981"
              align="left"
              borderSide="left"
            />
            <PidBox
              data={data}
              label="OIL PRES"
              value={data.oilPressure}
              unit="PSI"
              color="#10b981"
              align="left"
              borderSide="left"
            />
          </div>

          {/* Center Content - Rectangular Focus */}
          <div className="flex-1 flex flex-col relative px-[3cqw] py-[2cqh] overflow-hidden justify-center gap-[4cqh]">
            <div className="absolute -inset-32 bg-emerald-600/10 blur-[140px]" />

            {/* Massive RPM Section */}
            <div className="flex flex-col relative z-10 w-full">
              <div className="flex justify-between items-end mb-[1cqh]">
                <span className="text-[3cqh] text-emerald-500/60 font-bold uppercase tracking-[1em] font-micro">
                  ENGINE_RPM
                </span>
                <span
                  className={`text-[24cqh] font-black text-white tabular-nums leading-none ${theme.fontFamily || ""}`}
                >
                  <ResponsiveValue
                    value={currentRpm}
                    isRpm={true}
                    theme={theme}
                  />
                </span>
              </div>

              {/* Rectangular RPM Bar */}
              <div className="w-full h-[12cqh] bg-black/90 border-4 border-emerald-900 relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:3cqw_100%]" />

                <div
                  className="absolute top-0 left-0 h-full transition-none flex items-center justify-end pr-[1cqw]"
                  style={{
                    width: `${rpmPercent}%`,
                    background: `linear-gradient(90deg, rgba(16,185,129,0.2), #10b981)`,
                  }}
                >
                  <div className="w-[1.5cqw] h-[80%] bg-white shadow-[0_0_30px_#fff]" />
                </div>

                <div className="absolute inset-0 flex justify-between px-[1cqw] items-end pb-[1cqh]">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                      key={num}
                      className="flex flex-col items-center justify-end h-full"
                    >
                      <span className="text-[2.5cqh] font-bold text-emerald-500/50 mb-[1cqh] font-micro">
                        {num}
                      </span>
                      <div
                        className={`w-[4px] ${num >= 7 ? "h-[5cqh] bg-red-500" : "h-[3cqh] bg-emerald-500/50"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Speed and Gear Row */}
            <div className="flex items-stretch gap-[4cqw] relative z-10 h-[30cqh]">
              <div className="flex-1 bg-black/50 border-4 border-emerald-900 flex items-center justify-between p-[3cqw] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                <div className="flex flex-col relative z-10">
                  <span className="text-[3cqh] font-bold text-emerald-500/60 tracking-[0.5em] font-micro">
                    SPEED
                  </span>
                  <div className="flex items-baseline gap-[2cqw]">
                    <span className="text-[20cqh] font-black leading-none tracking-tighter tabular-nums font-micro text-white drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <ResponsiveValue
                        value={Math.round(speed || 0)}
                        theme={theme}
                      />
                    </span>
                    <span className="text-[4cqh] font-bold text-emerald-500/60 tracking-[0.2em] font-micro">
                      MPH
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-[30%] bg-emerald-600 border-4 border-emerald-900 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40 mix-blend-overlay" />
                <span className="text-[3cqh] font-bold text-black/60 tracking-[0.5em] font-micro mb-[2cqh] relative z-10">
                  GEAR
                </span>
                <div className="w-[16cqh] h-[16cqh] bg-black/20 flex items-center justify-center border-4 border-black/40 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] relative z-10">
                  <span className="text-[12cqh] font-black text-black font-micro-bold drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    {gear}
                  </span>
                </div>
              </div>
            </div>

            {/* Throttle and Load Bars */}
            <div className="flex gap-[6cqw] mt-[2cqh] w-[60%] opacity-80 relative z-10">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[1.5cqh] font-bold text-emerald-500/60 font-micro uppercase">
                  <span>THR</span>
                  <span>{Math.round(data.throttlePos || 0)}%</span>
                </div>
                <div className="h-[2cqh] bg-black/50 border-2 border-emerald-900 overflow-hidden">
                  <div
                    className="h-full transition-none bg-emerald-500"
                    style={{ width: `${data.throttlePos || 0}%` }}
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[1.5cqh] font-bold text-emerald-500/60 font-micro uppercase">
                  <span>LOAD</span>
                  <span>{Math.round(data.engineLoad || 0)}%</span>
                </div>
                <div className="h-[2cqh] bg-black/50 border-2 border-emerald-900 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-none"
                    style={{ width: `${data.engineLoad || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[22%] flex flex-col gap-[1.5cqh] py-[2cqh] px-[1.5cqw] border-l-4 border-emerald-900 bg-black/60 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-emerald-500/5" />
            <PidBox
              data={data}
              label="BOOST"
              value={(data.boost || 0).toFixed(1)}
              unit="PSI"
              color="#10b981"
              align="right"
              borderSide="right"
            />
            <PidBox
              data={data}
              label="INTAKE"
              value={Math.round(data.intakeTemp)}
              unit="°F"
              color="#10b981"
              align="right"
              borderSide="right"
            />
            <PidBox
              data={data}
              label="FUEL"
              value={data.fuelLevel}
              unit="%"
              color="#10b981"
              align="right"
              borderSide="right"
            />
            <PidBox
              data={data}
              label="LOAD"
              value={Math.round(data.engineLoad)}
              unit="%"
              color="#10b981"
              align="right"
              borderSide="right"
            />
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[15%] mt-auto shrink-0 p-1 relative z-20">
          <div className="h-full bg-black/50 rounded-[1cqh] border-4 border-emerald-900 backdrop-blur-3xl flex items-center px-[6cqw] relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,rgba(16,185,129,0.05)_50%)] bg-[size:10%_100%]" />
            <TelemetryGrid
              data={data}
              color="#10b981"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const CyberNeon2088: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);
    const dashArray = 283; // 2 * pi * 45
    const dashOffset = dashArray - (dashArray * rpmPercent) / 100;

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#020205] rounded-[4cqh] overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_100px_rgba(6,182,212,0.15)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(6,182,212,0.1)" } as any}
          />
        )}

        {/* Cyberpunk Grid Background - More Detailed */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:4cqw_4cqh] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] z-0" />

        {/* Glitch Overlay Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0 overflow-hidden">
          <div className="absolute top-1/4 left-0 w-full h-[1px] bg-cyan-500 animate-[glitch-line_4s_infinite]" />
          <div className="absolute top-3/4 left-0 w-full h-[1px] bg-magenta-500 animate-[glitch-line_3s_infinite_reverse]" />
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-50 opacity-30" />

        <div className="high-end-gloss z-50" />

        {/* Top Header - Cyber Style */}
        <div className="h-[10%] flex items-center justify-between px-[4cqw] border-b border-cyan-500/40 relative z-40 bg-black/50 backdrop-blur-3xl shrink-0 shadow-[0_5px_20px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-[2cqw]">
            <div className="relative">
              <div className="w-[1.4cqh] h-[1.4cqh] bg-cyan-500 rounded-sm shadow-[0_0_20px_#06b6d4]" />
              <div className="absolute inset-0 bg-cyan-500/40 rounded-sm opacity-30" />
            </div>
            <div className="flex flex-col">
              <span className="text-cyan-400 font-black text-[1.8cqh] tracking-[0.8em] uppercase italic font-micro-bold drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                NEURAL_LINK_v2.0.88
              </span>
              <span className="text-cyan-500/40 text-[0.8cqh] tracking-[0.4em] uppercase font-micro">
                SYSTEM_STABLE_OPTIMIZED
              </span>
            </div>
            <WarningLights data={data} className="ml-12 scale-110" />
          </div>
          <div className="flex items-center gap-[4cqw]">
            <div className="px-4 py-1 border border-cyan-500/30 rounded-sm bg-cyan-500/5 backdrop-blur-md">
              <span className="text-cyan-400 font-black text-[1.2cqh] tracking-[0.4em] uppercase italic font-micro">
                OVERCLOCK_ACTIVE
              </span>
            </div>
            <div className="text-magenta-500 font-black text-[1.4cqh] font-micro">
              2088_OS
            </div>
          </div>
        </div>

        {/* Integrated PIDs - Cyber Layout - High Fidelity */}
        <div className="flex-1 flex relative z-40 min-h-0 items-center justify-center">
          {/* Left Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 to-transparent border-r border-cyan-500/30 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="#06b6d4"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="#06b6d4"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL PRESS"
                value={(data?.oilPressure || 0).toFixed(1)}
                unit="BAR"
                color="#06b6d4"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[4cqh]">
            {/* Central RPM Display - Cyber Style */}
            <div className="relative flex flex-col items-center group cursor-default">
              <div className="absolute -inset-12 bg-cyan-500/5 blur-3xl rounded-sm" />

              <div className="relative flex flex-col items-center">
                <div className="flex items-baseline gap-4">
                  <span
                    className={`text-[26cqh] font-black text-white tabular-nums ${theme.fontFamily || ""}`}
                  >
                    <ResponsiveValue
                      value={Math.round(value * 1000)}
                      isRpm={true}
                      theme={theme}
                    />
                  </span>
                  <span className="text-[4cqh] font-black text-cyan-400/60 uppercase tracking-[0.5em] font-micro italic">
                    RPM
                  </span>
                </div>

                {/* RPM Bar - Futuristic */}
                <div className="w-[40cqw] h-[2.5cqh] bg-cyan-900/20 rounded-sm mt-4 overflow-hidden border border-cyan-500/30 relative flex gap-[2px] p-[2px] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  {[...Array(50)].map((_, i) => {
                    const isActive = i < (rpmPercent / 100) * 50;
                    const isRedline = i >= 42;
                    const color = isRedline ? "#ef4444" : "#06b6d4";
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-full -skew-x-12 transition-none ${isActive ? "opacity-300" : "opacity-30"}`}
                        style={{
                          backgroundColor: color,
                          boxShadow: isActive ? `0 0 10px ${color}` : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Central Gear - Floating */}
              {gear && (
                <div className="absolute -top-[12cqh] w-[14cqh] h-[14cqh] border-2 border-cyan-500/40 rounded-lg flex items-center justify-center bg-black/90 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.4)] group-hover:bg-cyan-500/20 transition-all duration-500 rotate-45 group-hover:rotate-[225deg]">
                  <span className="text-[8cqh] font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] font-micro -rotate-45 group-hover:-rotate-[225deg] transition-all duration-500">
                    {gear}
                  </span>
                </div>
              )}
            </div>

            {/* Speed Display - Digital Bar */}
            <div className="w-full flex flex-col items-center group cursor-default bg-cyan-500/[0.03] px-[8cqw] py-[2.5cqh] rounded-2xl border border-cyan-500/20 backdrop-blur-2xl shadow-[0_15px_60px_rgba(0,0,0,0.7)] hover:bg-cyan-500/10 transition-all duration-500">
              <div className="w-full flex justify-between items-end mb-3">
                <span className="text-[2.5cqh] font-black text-cyan-400/60 uppercase tracking-[0.8em] font-micro italic">
                  SPEED
                </span>
                <span className="text-[6cqh] font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] font-micro">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
              </div>
              <div className="w-full h-[2cqh] bg-cyan-900/20 rounded-sm flex gap-1 p-1">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-300 ${i < ((speed || 0) / 200) * 40 ? "bg-magenta-500 shadow-[0_0_10px_#d946ef]" : "bg-cyan-900/10"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Throttle and Load Bars */}
          <div className="absolute bottom-[2cqh] left-1/2 -translate-x-1/2 flex gap-[4cqw] w-[50%] justify-center px-[4cqw]">
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-black uppercase tracking-[0.5em] font-micro text-[#06b6d4]">
                THR
              </span>
              <div className="w-full h-[0.8cqh] bg-cyan-950/50 border border-cyan-500/30 overflow-hidden rounded-sm">
                <div
                  className="h-full bg-[#06b6d4] shadow-[0_0_10px_#06b6d4] transition-none"
                  style={{ width: `${data.throttlePos}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-black uppercase tracking-[0.5em] font-micro text-[#ff8800]">
                LOAD
              </span>
              <div className="w-full h-[0.8cqh] bg-cyan-950/50 border border-[#ff8800]/30 overflow-hidden rounded-sm">
                <div
                  className="h-full bg-[#ff8800] shadow-[0_0_10px_#ff8800] transition-none"
                  style={{ width: `${data.engineLoad}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-l from-cyan-950/40 to-transparent border-l border-cyan-500/30 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="#06b6d4"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="#06b6d4"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="BOOST"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="#06b6d4"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[12%] mt-auto shrink-0 p-1 z-40">
          <div className="h-full bg-black/95 rounded-2xl border border-cyan-500/20 backdrop-blur-3xl flex items-center px-[6cqw] relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.12)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,rgba(6,182,212,0.04)_50%)] bg-[size:10%_100%]" />
            <TelemetryGrid
              data={data}
              color="#06b6d4"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const TitaniumPrecision: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#0f0f0f] rounded-[4cqh] overflow-hidden border-2 border-white/30 shadow-[inset_0_0_150px_rgba(0,0,0,1)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(255,255,255,0.05)" } as any}
          />
        )}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_80%)]" />

        {/* Decorative Titanium Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-[80%] h-[80%] border border-white/30 rounded-xl" />
          <div className="absolute w-[90%] h-[90%] border border-white/40 rounded-2xl" />
          <div className="absolute w-[95%] h-[95%] border border-white/40 border-dashed rounded-3xl" />
        </div>

        <div className="high-end-gloss" />

        {/* Top Header - Dedicated Row */}
        <div className="h-[10%] flex items-center justify-between px-[4cqw] border-b border-white/30 relative z-10 bg-gradient-to-r from-black/80 via-black/40 to-black/80 backdrop-blur-xl shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-[2cqw]">
            <div className="relative">
              <div className="w-[1cqh] h-[1cqh] bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <div className="absolute inset-0 bg-white/40 opacity-40" />
            </div>
            <span className="text-white/70 font-black text-[1.2cqh] tracking-[1em] uppercase italic drop-shadow-[0_0_5px_rgba(255,255,255,0.2)] font-micro">
              TITANIUM_PRECISION
            </span>
            <WarningLights data={data} className="ml-6" />
          </div>
          <div className="flex gap-[4cqw] text-[1.2cqh] font-black text-white/20 tracking-[0.8em] uppercase italic font-micro">
            <span>CALIBRATED_v9.4</span>
          </div>
        </div>

        {/* Integrated PIDs - Titanium Layout - High Fidelity */}
        <div className="flex-1 flex relative z-10 min-h-0 items-center justify-center">
          {/* Left Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent border-r border-white/30 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="white"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="white"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL PRESS"
                value={(data?.oilPressure || 0).toFixed(1)}
                unit="BAR"
                color="white"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[4cqh]">
            {/* Central Gauge Area */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-baseline gap-4">
                <span
                  className={`text-[24cqh] font-black text-white leading-none tracking-tighter tabular-nums font-micro ${theme.fontFamily || ""}`}
                >
                  <ResponsiveValue
                    value={Math.round(value * 1000)}
                    isRpm={true}
                    theme={theme}
                  />
                </span>
                <span className="text-[3cqh] font-black text-white/70 italic tracking-[0.8em] mt-2 uppercase font-micro-bold">
                  RPM
                </span>
              </div>

              {/* Rectangular RPM Bar */}
              <div className="w-full h-[4cqh] bg-black/40 border-2 border-white/40 rounded-sm mt-4 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                <div
                  className="absolute top-0 left-0 h-full transition-none"
                  style={{
                    width: `${rpmPercent}%`,
                    background: `linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,1))`,
                  }}
                />
                <div className="absolute inset-0 flex justify-between px-[1cqw]">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="h-full w-[2px] bg-black/40" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-[6cqw] w-full">
              <div className="flex flex-col items-center justify-center bg-white/5 p-[2cqw] rounded-xl border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <span className="text-[8cqh] font-black text-white/80 leading-none tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
                <span className="text-[2cqh] font-black text-white/60 italic tracking-[0.5em] font-micro-bold">
                  MPH
                </span>
              </div>

              {gear && (
                <div className="w-[14cqh] h-[14cqh] bg-gradient-to-br from-white/10 to-black/80 text-white rounded-xl flex items-center justify-center font-black text-[8cqh] shadow-[inset_0_0_20px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)] border border-white/40 backdrop-blur-xl">
                  <span className="relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] font-micro">
                    {gear}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Throttle and Load Bars */}
          <div className="absolute bottom-[2cqh] left-1/2 -translate-x-1/2 flex gap-[4cqw] w-[50%] justify-center px-[4cqw]">
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-black uppercase tracking-[0.5em] font-micro text-white/80">
                THR
              </span>
              <div className="w-full h-[0.8cqh] bg-white/10 border border-white/40 overflow-hidden rounded-sm">
                <div
                  className="h-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-none"
                  style={{ width: `${data.throttlePos}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-black uppercase tracking-[0.5em] font-micro text-[#ff8800]/50">
                LOAD
              </span>
              <div className="w-full h-[0.8cqh] bg-white/10 border border-white/40 overflow-hidden rounded-sm">
                <div
                  className="h-full bg-[#ff8800]/80 shadow-[0_0_10px_rgba(255,136,0,0.5)] transition-none"
                  style={{ width: `${data.engineLoad}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-l from-white/[0.05] to-transparent border-l border-white/30 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="white"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="white"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="BOOST"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="white"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[12%] mt-auto shrink-0 p-1">
          <div className="h-full bg-black/60 rounded-2xl border border-white/30 backdrop-blur-2xl flex items-center px-[6cqw] relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,rgba(255,255,255,0.05)_50%)] bg-[size:10%_100%]" />
            <TelemetryGrid
              data={data}
              color="white"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const RacingGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#050505] rounded-[4cqh] overflow-hidden border-2 border-red-600/20 shadow-[inset_0_0_150px_rgba(0,0,0,1)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(239,68,68,0.05)" } as any}
          />
        )}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.08)_0%,transparent_70%)] opacity-40" />

        {/* Racing Stripes */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[10cqw] flex gap-2 opacity-30 pointer-events-none -skew-x-12">
          <div className="w-1/3 h-full bg-red-600" />
          <div className="w-2/3 h-full bg-red-600" />
        </div>

        <div className="high-end-gloss" />

        {/* Top Header - Racing Style */}
        <div className="h-[10%] flex items-center justify-between px-[4cqw] border-b border-red-600/30 relative z-10 bg-black/50 backdrop-blur-2xl shrink-0">
          <div className="flex items-center gap-[2cqw]">
            <div className="w-[1.2cqh] h-[1.2cqh] bg-red-600 rounded-sm shadow-[0_0_15px_#dc2626]" />
            <span className="text-red-600 font-black text-[1.5cqh] tracking-[1.2em] uppercase italic font-micro-bold drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              RACING_PRO_v4
            </span>
            <WarningLights data={data} className="ml-8" />
          </div>
          <div className="flex gap-[4cqw] text-[1.2cqh] font-black text-red-600/50 tracking-[0.8em] uppercase italic font-micro">
            <span>TRACK_MODE_ACTIVE</span>
          </div>
        </div>

        {/* Integrated PIDs - Racing Layout - High Fidelity */}
        <div className="flex-1 flex relative z-10 min-h-0 items-center justify-center">
          {/* Left Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 to-transparent border-r border-red-600/30 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="#dc2626"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="#dc2626"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL PRESS"
                value={(data?.oilPressure || 0).toFixed(1)}
                unit="BAR"
                color="#dc2626"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[2cqh]">
            {/* Horizontal RPM Bar (Race Style) */}
            <div className="w-full h-[10cqh] bg-black/50 rounded-lg border-2 border-red-600/40 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] skew-x-[-10deg]">
              <div
                className="absolute top-0 left-0 h-full transition-none"
                style={{
                  width: `${rpmPercent}%`,
                  background: `linear-gradient(90deg, #dc2626, #facc15)`,
                }}
              />
              {/* Ticks */}
              <div className="absolute inset-0 flex justify-between px-[1cqw]">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-full w-[2px] bg-white/20" />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center mix-blend-difference">
                <span className="text-[12cqh] font-black tracking-tighter text-white font-micro drop-shadow-md skew-x-[10deg]">
                  <ResponsiveValue
                    value={Math.round(value * 1000)}
                    isRpm={true}
                    theme={theme}
                  />
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-[6cqw] w-full mt-[2cqh]">
              {/* Speed Display */}
              <div className="flex flex-col items-center justify-center bg-black/40 p-[2cqw] rounded-xl border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                <span className="text-[12cqh] font-black text-white leading-none tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] tabular-nums font-micro">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
                <span className="text-[2.5cqh] font-black text-red-600 italic tracking-[0.8em] mt-2 uppercase font-micro-bold">
                  MPH
                </span>
              </div>

              {/* Central Gear Indicator */}
              <div className="w-[16cqh] h-[16cqh] bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-[10cqh] shadow-[0_0_50px_rgba(220,38,38,0.5)] border-4 border-white/40 relative overflow-hidden group hover:scale-105 transition-all duration-300 -skew-x-12">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-80" />
                <span className="relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] font-micro-bold skew-x-12">
                  {gear || "N"}
                </span>
              </div>
            </div>
          </div>

          {/* Throttle and Load Bars */}
          <div className="absolute bottom-[2cqh] left-1/2 -translate-x-1/2 flex gap-[4cqw] w-[50%] justify-center px-[4cqw]">
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-black uppercase tracking-[0.5em] font-micro text-[#dc2626]">
                THR
              </span>
              <div className="w-full h-[0.8cqh] bg-red-950/50 border border-red-600/30 overflow-hidden skew-x-12">
                <div
                  className="h-full bg-[#dc2626] shadow-[0_0_10px_#dc2626] transition-none"
                  style={{ width: `${data.throttlePos}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-black uppercase tracking-[0.5em] font-micro text-[#ff8800]">
                LOAD
              </span>
              <div className="w-full h-[0.8cqh] bg-red-950/50 border border-[#ff8800]/30 overflow-hidden skew-x-12">
                <div
                  className="h-full bg-[#ff8800] shadow-[0_0_10px_#ff8800] transition-none"
                  style={{ width: `${data.engineLoad}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-l from-red-950/40 to-transparent border-l border-red-600/30 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="#dc2626"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="#dc2626"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="BOOST"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="#dc2626"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[15%] mt-auto shrink-0 p-1">
          <div className="h-full bg-black/60 rounded-3xl border border-red-600/20 backdrop-blur-2xl flex items-center px-[6cqw] relative overflow-hidden">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,rgba(220,38,38,0.05)_50%)] bg-[size:10%_100%]" />
            <TelemetryGrid
              data={data}
              color="#dc2626"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const LuxuryGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);
    const speedPercent = Math.min(100, ((speed || 0) / 200) * 100);

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#121212] rounded-[4cqh] overflow-hidden border-2 border-white/40 shadow-[inset_0_0_200px_rgba(0,0,0,1)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(255,255,255,0.03)" } as any}
          />
        )}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/padded-leather.png')] opacity-15 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_100%)]" />

        {/* Elegant Background Accents */}
        <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none flex justify-between px-10">
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        <div className="high-end-gloss" />

        {/* Top Header - Luxury Style */}
        <div className="h-[10%] flex items-center justify-between px-[4cqw] border-b border-white/40 relative z-10 bg-black/50 backdrop-blur-2xl shrink-0">
          <div className="flex items-center gap-[2cqw]">
            <div className="w-[1.2cqh] h-[1.2cqh] bg-white/40" />
            <span className="text-white/70 font-medium text-[1.5cqh] tracking-[1.5em] uppercase italic font-micro">
              LUXURY_ELITE
            </span>
            <WarningLights data={data} className="ml-8 opacity-40" />
          </div>
          <div className="flex gap-[4cqw] text-[1.2cqh] font-medium text-white/20 tracking-[1em] uppercase italic font-micro">
            <span>v2.4_PREMIUM</span>
          </div>
        </div>

        {/* Integrated PIDs - Luxury Layout - High Fidelity */}
        <div className="flex-1 flex relative z-10 min-h-0 items-center justify-center">
          {/* Left Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent border-r border-white/40 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="white"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="white"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL PRESS"
                value={(data?.oilPressure || 0).toFixed(1)}
                unit="BAR"
                color="white"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[4cqh]">
            {/* RPM Display */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-baseline gap-4">
                <span
                  className={`text-[24cqh] font-light text-white leading-none tracking-widest tabular-nums ${theme.fontFamily || ""}`}
                >
                  <ResponsiveValue
                    value={Math.round(value * 1000)}
                    isRpm={true}
                    theme={theme}
                  />
                </span>
                <span className="text-[3cqh] font-medium text-white/60 tracking-[1em] mt-2 uppercase font-micro-bold">
                  RPM
                </span>
              </div>

              {/* Elegant RPM Bar */}
              <div className="w-full h-[1cqh] bg-white/5 mt-6 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full transition-none bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  style={{ width: `${rpmPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-[8cqw] w-full">
              {/* Speed Display */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8cqh] font-light text-white leading-none tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] tabular-nums font-micro">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
                <span className="text-[2cqh] font-medium text-white/60 tracking-[1em] mt-2 uppercase font-micro-bold">
                  MPH
                </span>
              </div>

              {/* Center Gear */}
              {gear && (
                <div className="w-[12cqh] h-[12cqh] border border-white/40 flex items-center justify-center font-light text-[8cqh] text-white bg-white/[0.03] backdrop-blur-3xl shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden group hover:scale-105 transition-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-40 group-hover:rotate-180 transition-transform duration-1000" />
                  <span className="relative z-10 font-micro">{gear}</span>
                </div>
              )}
            </div>
          </div>

          {/* Throttle and Load Bars */}
          <div className="absolute bottom-[2cqh] left-1/2 -translate-x-1/2 flex gap-[4cqw] w-[50%] justify-center px-[4cqw]">
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-light uppercase tracking-[0.5em] font-micro text-white/80">
                THR
              </span>
              <div className="w-full h-[0.8cqh] bg-white/5 border border-white/30 overflow-hidden">
                <div
                  className="h-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-none"
                  style={{ width: `${data.throttlePos}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-light uppercase tracking-[0.5em] font-micro text-[#ff8800]/50">
                LOAD
              </span>
              <div className="w-full h-[0.8cqh] bg-white/5 border border-white/30 overflow-hidden">
                <div
                  className="h-full bg-[#ff8800]/80 shadow-[0_0_10px_rgba(255,136,0,0.5)] transition-none"
                  style={{ width: `${data.engineLoad}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-l from-white/[0.02] to-transparent border-l border-white/40 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="white"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="white"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="BOOST"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="white"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[12%] mt-auto shrink-0 p-1">
          <div className="h-full bg-white/[0.01] rounded-2xl border border-white/40 backdrop-blur-2xl flex items-center px-[6cqw] relative overflow-hidden">
            <TelemetryGrid
              data={data}
              color="white"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const BlueprintGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);
    const speedPercent = Math.min(100, ((speed || 0) / 200) * 100);

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#001a33] rounded-[4cqh] overflow-hidden border-2 border-sky-500/30 shadow-[inset_0_0_150px_rgba(0,0,0,1)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(14,165,233,0.05)" } as any}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:2cqh_2cqh]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.08)_0%,transparent_100%)]" />

        {/* Blueprint Technical Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
          preserveAspectRatio="none"
        >
          <line
            x1="10%"
            y1="0"
            x2="10%"
            y2="100%"
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <line
            x1="90%"
            y1="0"
            x2="90%"
            y2="100%"
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <line
            x1="0"
            y1="20%"
            x2="100%"
            y2="20%"
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <line
            x1="0"
            y1="80%"
            x2="100%"
            y2="80%"
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <rect
            x="20%"
            y="20%"
            width="60%"
            height="60%"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="0.5"
          />
          <rect
            x="25%"
            y="25%"
            width="50%"
            height="50%"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="0.5"
            strokeDasharray="10,10"
          />
        </svg>

        <div className="high-end-gloss" />

        {/* Top Header - Blueprint Style */}
        <div className="h-[10%] flex items-center justify-between px-[4cqw] border-b border-sky-500/30 relative z-10 bg-sky-950/80 backdrop-blur-2xl shrink-0">
          <div className="flex items-center gap-[2cqw]">
            <div className="w-[1.2cqh] h-[1.2cqh] bg-sky-500 shadow-[0_0_15px_#0ea5e9]" />
            <span className="text-sky-500 font-black text-[1.5cqh] tracking-[1.2em] uppercase italic font-micro-bold drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">
              BLUEPRINT_OS_v2.1
            </span>
            <WarningLights data={data} className="ml-8" />
          </div>
          <div className="flex gap-[4cqw] text-[1.2cqh] font-black text-sky-500/50 tracking-[0.8em] uppercase italic font-micro">
            <span>SYSTEM_NOMINAL</span>
          </div>
        </div>

        {/* Integrated PIDs - Blueprint Layout - High Fidelity */}
        <div className="flex-1 flex relative z-10 min-h-0 items-center justify-center">
          {/* Left Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-950/60 to-transparent border-r border-sky-500/30 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="#0ea5e9"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="#0ea5e9"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL PRESS"
                value={Math.round(data?.oilPressure || 0)}
                unit="PSI"
                color="#0ea5e9"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[4cqh]">
            {/* RPM Indicator */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-baseline gap-4">
                <span
                  className={`text-[24cqh] font-black text-white leading-none tracking-tighter tabular-nums relative z-10 ${theme.fontFamily || ""}`}
                >
                  <ResponsiveValue
                    value={Math.round(value * 1000)}
                    isRpm={true}
                    theme={theme}
                  />
                </span>
                <span className="text-[3cqh] font-black text-sky-500/60 tracking-[1em] uppercase italic mt-2 font-micro-bold relative z-10">
                  RPM
                </span>
              </div>

              {/* Rectangular RPM Bar */}
              <div className="w-full h-[3cqh] bg-sky-950/50 border border-sky-500/30 mt-4 relative overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.2)]">
                <div
                  className="absolute top-0 left-0 h-full transition-none bg-[#0ea5e9]"
                  style={{ width: `${rpmPercent}%` }}
                />
                <div className="absolute inset-0 flex justify-between px-[1cqw]">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="h-full w-[2px] bg-sky-900/40" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-[6cqw] w-full">
              {/* Speed Indicator */}
              <div className="flex flex-col items-center justify-center bg-sky-950/30 p-[2cqw] border border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.1)]">
                <span className="text-[8cqh] font-black text-white leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(14,165,233,0.8)] tabular-nums font-micro relative z-10">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
                <span className="text-[2cqh] font-black text-sky-500/60 tracking-[1em] uppercase italic mt-2 font-micro-bold relative z-10">
                  MPH
                </span>
              </div>

              {/* Center Gear */}
              {gear && (
                <div className="w-[14cqh] h-[14cqh] border-2 border-sky-500/50 flex items-center justify-center font-black text-[8cqh] text-sky-400 bg-sky-900/50 backdrop-blur-2xl shadow-[0_0_20px_rgba(14,165,233,0.3)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(14,165,233,0.1)_5px,rgba(14,165,233,0.1)_10px)]" />
                  <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-sky-500/50" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-sky-500/50" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-sky-500/50" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-sky-500/50" />
                  <span className="relative z-10 font-micro">{gear}</span>
                </div>
              )}
            </div>
          </div>

          {/* Throttle and Load Bars */}
          <div className="absolute bottom-[2cqh] left-1/2 -translate-x-1/2 flex gap-[4cqw] w-[50%] justify-center px-[4cqw]">
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-black uppercase tracking-[0.5em] font-micro text-[#0ea5e9]">
                THR
              </span>
              <div className="w-full h-[0.8cqh] bg-sky-950/50 border border-sky-500/30 overflow-hidden">
                <div
                  className="h-full bg-[#0ea5e9] shadow-[0_0_10px_#0ea5e9] transition-none"
                  style={{ width: `${data.throttlePos}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-[1cqh] flex-1">
              <span className="text-[1.2cqh] font-black uppercase tracking-[0.5em] font-micro text-[#ff8800]">
                LOAD
              </span>
              <div className="w-full h-[0.8cqh] bg-sky-950/50 border border-sky-500/30 overflow-hidden">
                <div
                  className="h-full bg-[#ff8800] shadow-[0_0_10px_#ff8800] transition-none"
                  style={{ width: `${data.engineLoad}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[24%] flex flex-col gap-[2cqh] py-[3cqh] px-[2cqw] relative">
            <div className="absolute inset-0 bg-gradient-to-l from-sky-950/60 to-transparent border-l border-sky-500/30 backdrop-blur-md" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="#0ea5e9"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="#0ea5e9"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="BOOST"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="#0ea5e9"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[12%] mt-auto shrink-0 p-1">
          <div className="h-full bg-sky-950/60 rounded-2xl border border-sky-500/30 backdrop-blur-2xl flex items-center px-[6cqw] relative overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.1)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,rgba(14,165,233,0.05)_50%)] bg-[size:10%_100%]" />
            <TelemetryGrid
              data={data}
              color="#0ea5e9"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const getTextureUrl = (texture?: string) => {
  switch (texture) {
    case "machined":
    case "brushed-aluminum":
      return "https://www.transparenttextures.com/patterns/brushed-alum.png";
    case "hex-grid":
      return "https://www.transparenttextures.com/patterns/hexellence.png";
    case "blueprint":
      return "https://www.transparenttextures.com/patterns/blueprint.png";
    case "honeycomb":
      return "https://www.transparenttextures.com/patterns/honeycomb.png";
    case "graphite":
      return "https://www.transparenttextures.com/patterns/dark-matter.png";
    case "alcantara":
      return "https://www.transparenttextures.com/patterns/stardust.png";
    case "piano-black":
      return "https://www.transparenttextures.com/patterns/black-linen.png";
    case "lcd":
      return "https://www.transparenttextures.com/patterns/pixel-weave.png";
    case "forged-carbon":
      return "https://www.transparenttextures.com/patterns/black-scales.png";
    case "carbon":
    case "polished-carbon":
    default:
      return "https://www.transparenttextures.com/patterns/carbon-fibre.png";
  }
};

interface AeroGlassProps extends GaugeProps {
  title: string;
  bgType: "pulse" | "texture" | "grid" | "solid" | "radar" | "hologram";
  customTexture?: string;
  layoutType?: "standard" | "split" | "central" | "asymmetric";
}

const AeroGlassBaseGauge: React.FC<AeroGlassProps> = React.memo((props) => {
  const {
    value,
    speed,
    gear,
    data,
    theme,
    title,
    bgType,
    customTexture,
    navState: nState,
    layoutType = "standard",
  } = props;
  const primaryColor = theme.primaryColor || "#ffffff";
  const secondaryColor = theme.secondaryColor || "#000000";
  const accentColor = theme.accentColor || "#00ffff";

  const rpmPercent = Math.min(100, (value / 9) * 100);
  const rpmValue = Math.round(value * 1000);

  const textureUrl = customTexture
    ? getTextureUrl(customTexture as any)
    : getTextureUrl(theme.texture);

  // Shift light logic
  const totalLeds = 20;
  const activeLeds = Math.floor((rpmPercent / 100) * totalLeds);
  const isFlashing = rpmPercent > 95;

  return (
    <div
      className={`w-full h-full p-[1.5cqh] relative overflow-hidden flex flex-col ${theme.fontFamily || "font-tech"} group/glass`}
      style={{ containerType: "size", backgroundColor: secondaryColor }}
    >
      {/* Dynamic Backgrounds based on bgType */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {bgType === "pulse" && (
          <>
            <div
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-30 blur-[100px] animate-pulse-slow skew-x-12"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] opacity-40 blur-[120px] animate-pulse-slow -skew-x-12"
              style={{ backgroundColor: accentColor, animationDelay: "2s" }}
            />
          </>
        )}
        {bgType === "texture" && textureUrl && (
          <div
            className="absolute inset-0 opacity-300 brightness-150 mix-blend-screen"
            style={{
              backgroundImage: `url('${textureUrl}')`,
              backgroundSize: "100px 100px",
            }}
          />
        )}
        {bgType === "grid" && (
          <div
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4cqw_4cqh]"
            style={{
              backgroundImage: `linear-gradient(${primaryColor}20 1px, transparent 1px), linear-gradient(90deg, ${primaryColor}20 1px, transparent 1px)`,
            }}
          />
        )}
        {bgType === "radar" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <div
              className="w-[80cqw] h-[80cqh] border border-white/40 skew-x-12"
              style={{ borderColor: primaryColor }}
            />
            <div
              className="absolute w-[60cqw] h-[60cqh] border border-white/40 -skew-x-12"
              style={{ borderColor: primaryColor }}
            />
          </div>
        )}
        {bgType === "hologram" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div
              className="w-[70cqw] h-[70cqh] border border-white/30 blur-sm skew-x-6"
              style={{ borderColor: accentColor }}
            />
            <div
              className="absolute w-[50cqw] h-[50cqh] border border-white/30 blur-md -skew-x-6"
              style={{ borderColor: primaryColor }}
            />
          </div>
        )}
      </div>

      {/* Main Panel */}
      <div
        className={`absolute inset-[1.5cqh] bg-black/80 backdrop-blur-3xl z-10 flex flex-col overflow-hidden realistic-bezel realistic-glass ${layoutType === "asymmetric" ? "rounded-tr-[4cqh] rounded-bl-[4cqh]" : ""}`}
      >
        {/* Top Shift Lights - Rectangular Array */}
        <div
          className={`flex gap-[0.2cqw] justify-between w-full p-[0.5cqh] bg-black/50 border-b-2 border-white/30 ${isFlashing ? "animate-pulse" : ""}`}
        >
          {[...Array(totalLeds)].map((_, i) => {
            let color = "bg-white/5";
            let glow = "";
            if (i < activeLeds) {
              if (i < totalLeds * 0.5) {
                color = "bg-green-500";
                glow = "shadow-[0_0_15px_#22c55e]";
              } else if (i < totalLeds * 0.8) {
                color = "bg-yellow-400";
                glow = "shadow-[0_0_15px_#facc15]";
              } else {
                color = "bg-red-500";
                glow = "shadow-[0_0_15px_#ef4444]";
              }
            }
            return (
              <div
                key={i}
                className={`h-[2cqh] flex-1 ${color} ${glow} transition-none border-r border-black/50 skew-x-[-15deg]`}
              />
            );
          })}
        </div>

        {/* Header / Title */}
        <div className="flex justify-between items-center px-[2cqw] py-[1cqh] border-b border-white/30 bg-gradient-to-r from-white/5 to-transparent">
          <div className="flex items-center gap-[2cqw]">
            <div
              className="w-[1cqw] h-[2cqh] bg-white/80 skew-x-[-20deg]"
              style={{ backgroundColor: primaryColor }}
            />
            <span
              className="text-[1.8cqh] font-black tracking-[0.4em] uppercase opacity-90 font-micro"
              style={{ color: primaryColor }}
            >
              {title}
            </span>
          </div>
          <WarningLights data={data} />
        </div>

        {/* Main Content Area - Dynamic Layout */}
        <div
          className={`flex-1 flex relative p-[2cqw] gap-[2cqh] ${layoutType === "split" ? "flex-row" : "flex-col"}`}
        >
          {/* Massive RPM Section - Primary Focus */}
          <div
            className={`flex flex-col justify-center relative ${layoutType === "split" ? "w-[60%] pr-[2cqw] border-r border-white/30" : "flex-1"}`}
          >
            <div
              className={`flex justify-between items-end mb-[1cqh] ${layoutType === "central" ? "flex-col items-center text-center" : ""}`}
            >
              <span
                className="text-[3cqh] font-black tracking-[0.5em] uppercase opacity-200 font-micro"
                style={{ color: primaryColor }}
              >
                ENGINE RPM
              </span>
              <span
                className={`text-[20cqh] font-black leading-none tracking-tighter tabular-nums font-micro ${layoutType === "central" ? "text-[24cqh]" : ""}`}
                style={{ color: accentColor }}
              >
                <ResponsiveValue value={rpmValue} isRpm={true} theme={theme} />
              </span>
            </div>

            {/* Complex Rectangular RPM Bar */}
            <div
              className={`w-full bg-black/50 border-2 border-white/40 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] ${layoutType === "asymmetric" ? "skew-x-[10deg]" : "skew-x-[-10deg]"} ${layoutType === "central" ? "h-[8cqh]" : "h-[12cqh]"}`}
            >
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2cqw_100%]" />

              {/* Fill */}
              <div
                className="absolute top-0 left-0 h-full transition-none flex items-center justify-end pr-[1cqw]"
                style={{
                  width: `${rpmPercent}%`,
                  background: `linear-gradient(90deg, ${primaryColor}40, ${accentColor})`,
                }}
              >
                <div className="w-[1cqw] h-[80%] bg-white shadow-[0_0_20px_#fff]" />
              </div>

              {/* Ticks and Numbers */}
              <div className="absolute inset-0 flex justify-between px-[1cqw] items-end pb-[1cqh]">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div
                    key={num}
                    className="flex flex-col items-center justify-end h-full"
                  >
                    <span className="text-[2cqh] font-bold text-white/80 mb-[1cqh] font-micro">
                      {num}
                    </span>
                    <div
                      className={`w-[2px] ${num >= 7 ? "h-[4cqh] bg-red-500" : "h-[2cqh] bg-white/30"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Data Row */}
          <div
            className={`flex items-stretch gap-[2cqw] ${layoutType === "split" ? "w-[40%] flex-col" : "h-[30cqh]"}`}
          >
            {/* Speed & Gear Block */}
            <div
              className={`flex-1 bg-black/30 border border-white/30 flex items-center justify-between p-[2cqw] relative overflow-hidden ${layoutType === "asymmetric" ? "skew-x-[5deg]" : "skew-x-[-5deg]"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="flex flex-col relative z-10">
                <span
                  className="text-[2cqh] font-bold tracking-[0.5em] opacity-200 font-micro"
                  style={{ color: primaryColor }}
                >
                  SPEED
                </span>
                <div className="flex items-baseline gap-[1cqw]">
                  <span
                    className={`font-black leading-none tracking-tighter tabular-nums font-micro text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] ${layoutType === "split" ? "text-[10cqh]" : "text-[14cqh]"}`}
                  >
                    <ResponsiveValue
                      value={Math.round(speed || 0)}
                      theme={theme}
                    />
                  </span>
                  <span
                    className="text-[3cqh] font-bold tracking-[0.2em] opacity-200 font-micro"
                    style={{ color: primaryColor }}
                  >
                    MPH
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center relative z-10 border-l-2 border-white/30 pl-[4cqw]">
                <span
                  className="text-[2cqh] font-bold tracking-[0.5em] opacity-200 font-micro mb-[1cqh]"
                  style={{ color: primaryColor }}
                >
                  GEAR
                </span>
                <div
                  className={`bg-white/10 flex items-center justify-center border border-white/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ${layoutType === "split" ? "w-[8cqh] h-[8cqh]" : "w-[12cqh] h-[12cqh]"}`}
                >
                  <span
                    className={`font-black text-white font-micro-bold drop-shadow-[0_0_15px_currentColor] ${layoutType === "split" ? "text-[5cqh]" : "text-[8cqh]"}`}
                    style={{ color: accentColor }}
                  >
                    {gear}
                  </span>
                </div>
              </div>
            </div>

            {/* Critical PIDs Block */}
            <div
              className={`${layoutType === "split" ? "h-[40%] flex-row" : "w-[35%] flex-col"} flex gap-[1cqh]`}
            >
              <div
                className={`flex-1 bg-black/30 border border-white/30 flex items-center justify-between px-[2cqw] ${layoutType === "asymmetric" ? "skew-x-[5deg]" : "skew-x-[-5deg]"} relative overflow-hidden ${layoutType === "split" ? "flex-col justify-center" : ""}`}
              >
                <div
                  className={`absolute ${layoutType === "split" ? "top-0 left-0 right-0 h-[4px]" : "left-0 top-0 bottom-0 w-[4px]"}`}
                  style={{ backgroundColor: primaryColor }}
                />
                <span
                  className={`text-[2cqh] font-bold tracking-[0.2em] opacity-70 font-micro text-white ${layoutType === "split" ? "text-[1.5cqh]" : ""}`}
                >
                  COOLANT
                </span>
                <span
                  className={`font-black tabular-nums font-micro ${layoutType === "split" ? "text-[3cqh]" : "text-[4cqh]"}`}
                  style={{ color: accentColor }}
                >
                  {Math.round(data.coolantTemp)}
                  <span className="text-[1.5cqh] ml-1 opacity-200">°F</span>
                </span>
              </div>
              <div
                className={`flex-1 bg-black/30 border border-white/30 flex items-center justify-between px-[2cqw] ${layoutType === "asymmetric" ? "skew-x-[5deg]" : "skew-x-[-5deg]"} relative overflow-hidden ${layoutType === "split" ? "flex-col justify-center" : ""}`}
              >
                <div
                  className={`absolute ${layoutType === "split" ? "top-0 left-0 right-0 h-[4px]" : "left-0 top-0 bottom-0 w-[4px]"}`}
                  style={{ backgroundColor: primaryColor }}
                />
                <span
                  className={`text-[2cqh] font-bold tracking-[0.2em] opacity-70 font-micro text-white ${layoutType === "split" ? "text-[1.5cqh]" : ""}`}
                >
                  OIL TEMP
                </span>
                <span
                  className={`font-black tabular-nums font-micro ${layoutType === "split" ? "text-[3cqh]" : "text-[4cqh]"}`}
                  style={{ color: accentColor }}
                >
                  {Math.round(data.oilTemp)}
                  <span className="text-[1.5cqh] ml-1 opacity-200">°F</span>
                </span>
              </div>
              <div
                className={`flex-1 bg-black/30 border border-white/30 flex items-center justify-between px-[2cqw] ${layoutType === "asymmetric" ? "skew-x-[5deg]" : "skew-x-[-5deg]"} relative overflow-hidden ${layoutType === "split" ? "flex-col justify-center" : ""}`}
              >
                <div
                  className={`absolute ${layoutType === "split" ? "top-0 left-0 right-0 h-[4px]" : "left-0 top-0 bottom-0 w-[4px]"}`}
                  style={{ backgroundColor: primaryColor }}
                />
                <span
                  className={`text-[2cqh] font-bold tracking-[0.2em] opacity-70 font-micro text-white ${layoutType === "split" ? "text-[1.5cqh]" : ""}`}
                >
                  BOOST
                </span>
                <span
                  className={`font-black tabular-nums font-micro ${layoutType === "split" ? "text-[3cqh]" : "text-[4cqh]"}`}
                  style={{ color: accentColor }}
                >
                  {data.boost.toFixed(1)}
                  <span className="text-[1.5cqh] ml-1 opacity-200">PSI</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Grid Row */}
        <div className="h-[12cqh] border-t-2 border-white/30 bg-black/50 px-[2cqw] py-[1cqh] relative overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
          <TelemetryGrid
            data={data}
            color={primaryColor}
            useVerticalDividers={true}
            compact={true}
          />
        </div>

        {/* Bottom Bar - Throttle/Load - Rectangular */}
        <div className="h-[6cqh] flex items-center justify-between px-[2cqw] border-t border-white/30 bg-black">
          <div className="flex items-center gap-[2cqw] w-[45%]">
            <span
              className="text-[1.5cqh] font-bold tracking-widest opacity-60 w-[4cqw] font-micro"
              style={{ color: primaryColor }}
            >
              THR
            </span>
            <div className="flex-1 h-[2cqh] bg-white/10 border border-white/40 relative overflow-hidden skew-x-[-20deg]">
              <div
                className="absolute top-0 left-0 h-full transition-none"
                style={{
                  width: `${data.throttlePos}%`,
                  backgroundColor: primaryColor,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-[2cqw] w-[45%] justify-end">
            <div className="flex-1 h-[2cqh] bg-white/10 border border-white/40 relative overflow-hidden skew-x-[20deg] flex justify-end">
              <div
                className="absolute top-0 right-0 h-full transition-none bg-orange-500"
                style={{ width: `${data.engineLoad}%` }}
              />
            </div>
            <span
              className="text-[1.5cqh] font-bold tracking-widest opacity-60 w-[4cqw] text-right font-micro"
              style={{ color: primaryColor }}
            >
              LOAD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

const QuantumDriveGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#00050a] rounded-[2cqh] overflow-hidden border-2 border-sky-500/20 shadow-[0_0_150px_rgba(14,165,233,0.15)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(14,165,233,0.1)" } as any}
          />
        )}

        {/* Quantum Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:2cqw_2cqh] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] z-0" />

        {/* Diagonal Data Streams */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-sky-500 rotate-45 animate-[pulse_2s_infinite]" />
          <div className="absolute top-0 right-1/4 w-[1px] h-full bg-sky-500 -rotate-45 animate-[pulse_3s_infinite_reverse]" />
        </div>

        <div className="high-end-gloss z-50" />

        {/* Top Header - Quantum Style */}
        <div className="h-[12%] flex items-center justify-between px-[4cqw] border-b-2 border-sky-500/40 relative z-40 bg-black/50 backdrop-blur-3xl shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-[2cqw]">
            <div className="relative">
              <div className="w-[1.4cqh] h-[1.4cqh] bg-sky-500 rounded-sm shadow-[0_0_20px_#0ea5e9] animate-pulse" />
              <div className="absolute inset-0 bg-sky-500/40 rounded-sm opacity-30" />
            </div>
            <div className="flex flex-col">
              <span className="text-sky-400 font-black text-[2cqh] tracking-[0.8em] uppercase italic font-micro-bold drop-shadow-[0_0_15px_rgba(14,165,233,0.6)]">
                QUANTUM_DRIVE_v9
              </span>
              <span className="text-sky-500/40 text-[0.8cqh] tracking-[0.4em] uppercase font-micro">
                HYPER_SPACE_LINK_ACTIVE
              </span>
            </div>
            <WarningLights data={data} className="ml-12 scale-110" />
          </div>
          <div className="flex items-center gap-[4cqw]">
            <div className="px-4 py-1 border border-sky-500/30 rounded-sm bg-sky-500/5 backdrop-blur-md">
              <span className="text-sky-400 font-black text-[1.2cqh] tracking-[0.4em] uppercase italic font-micro">
                WARP_READY
              </span>
            </div>
          </div>
        </div>

        {/* Integrated PIDs - Quantum Layout */}
        <div className="flex-1 flex relative z-40 min-h-0 items-center justify-center p-[2cqw]">
          {/* Left Sidebar */}
          <div className="w-[25%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative bg-sky-950/20 border border-sky-500/20 rounded-xl backdrop-blur-md shadow-[inset_0_0_30px_rgba(14,165,233,0.1)]">
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="#0ea5e9"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="#0ea5e9"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL PRESS"
                value={(data?.oilPressure || 0).toFixed(1)}
                unit="BAR"
                color="#0ea5e9"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[4cqh]">
            {/* Central RPM Display - Quantum Style */}
            <div className="relative flex flex-col items-center group cursor-default w-full">
              <div className="absolute -inset-12 bg-sky-500/5 blur-3xl rounded-sm" />

              <div className="relative flex flex-col items-center w-full">
                <div className="flex items-baseline gap-4">
                  <span
                    className={`text-[23cqh] font-black text-white tabular-nums ${theme.fontFamily || ""}`}
                  >
                    <ResponsiveValue
                      value={Math.round(value * 1000)}
                      isRpm={true}
                      theme={theme}
                    />
                  </span>
                  <span className="text-[4cqh] font-black text-sky-400/60 uppercase tracking-[0.5em] font-micro italic">
                    RPM
                  </span>
                </div>

                {/* RPM Bar - Segmented Quantum */}
                <div className="w-full h-[3cqh] bg-sky-900/20 rounded-sm mt-4 overflow-hidden border-2 border-sky-500/40 relative flex gap-[4px] p-[2px] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                  {[...Array(40)].map((_, i) => {
                    const isActive = i < (rpmPercent / 100) * 40;
                    const isRedline = i >= 34;
                    const color = isRedline ? "#ef4444" : "#0ea5e9";
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-full -skew-x-[20deg] transition-none ${isActive ? "opacity-300" : "opacity-15"}`}
                        style={{
                          backgroundColor: color,
                          boxShadow: isActive ? `0 0 15px ${color}` : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Central Gear - Floating Hexagon */}
              {gear && (
                <div
                  className="absolute -top-[14cqh] w-[16cqh] h-[16cqh] border-4 border-sky-500/40 flex items-center justify-center bg-black/90 backdrop-blur-2xl shadow-[0_0_80px_rgba(14,165,233,0.4)] transition-all duration-500"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                >
                  <span className="text-[9cqh] font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] font-micro transition-all duration-500">
                    {gear}
                  </span>
                </div>
              )}
            </div>

            {/* Speed Display - Digital Block */}
            <div className="w-[80%] flex flex-col items-center group cursor-default bg-sky-500/[0.05] px-[6cqw] py-[2cqh] rounded-xl border-2 border-sky-500/30 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] hover:bg-sky-500/10 transition-all duration-500">
              <div className="w-full flex justify-between items-end mb-2">
                <span className="text-[3cqh] font-black text-sky-400/60 uppercase tracking-[0.8em] font-micro italic">
                  SPEED
                </span>
                <span className="text-[8cqh] font-black text-white tabular-nums drop-shadow-[0_0_30px_rgba(14,165,233,0.5)] font-micro leading-none">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[25%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative bg-sky-950/20 border border-sky-500/20 rounded-xl backdrop-blur-md shadow-[inset_0_0_30px_rgba(14,165,233,0.1)]">
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="#0ea5e9"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="#0ea5e9"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="BOOST"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="#0ea5e9"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[12%] mt-auto shrink-0 p-1 z-40">
          <div className="h-full bg-black/95 rounded-xl border-2 border-sky-500/30 backdrop-blur-3xl flex items-center px-[6cqw] relative overflow-hidden shadow-[0_0_60px_rgba(14,165,233,0.2)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,rgba(14,165,233,0.06)_50%)] bg-[size:5%_100%]" />
            <TelemetryGrid
              data={data}
              color="#0ea5e9"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const StealthTacticalGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#0a0a0a] rounded-[1cqh] overflow-hidden border-4 border-[#1a1a1a] shadow-[inset_0_0_100px_rgba(0,0,0,1)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(255,0,0,0.05)" } as any}
          />
        )}

        {/* Tactical Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4cqw_4cqh] z-0" />

        {/* Crosshairs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80cqh] h-[80cqh] border border-white/40 rounded-sm pointer-events-none z-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-white/5 absolute" />
          <div className="w-[1px] h-full bg-white/5 absolute" />
        </div>

        <div className="high-end-gloss z-50 opacity-200" />

        {/* Top Header - Tactical Style */}
        <div className="h-[10%] flex items-center justify-between px-[4cqw] border-b-2 border-[#333] relative z-40 bg-[#050505] shrink-0 shadow-md">
          <div className="flex items-center gap-[2cqw]">
            <div className="w-[1.4cqh] h-[1.4cqh] bg-red-600 rounded-sm shadow-[0_0_10px_#dc2626] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-white/90 font-black text-[1.8cqh] tracking-[0.8em] uppercase font-micro-bold">
                TACTICAL_HUD_v4
              </span>
              <span className="text-red-500/80 text-[0.8cqh] tracking-[0.4em] uppercase font-micro">
                COMBAT_MODE_ENGAGED
              </span>
            </div>
            <WarningLights
              data={data}
              className="ml-12 scale-110 grayscale contrast-150"
            />
          </div>
          <div className="flex items-center gap-[4cqw]">
            <div className="px-4 py-1 border border-red-500/50 rounded-sm bg-red-500/10">
              <span className="text-red-500 font-black text-[1.2cqh] tracking-[0.4em] uppercase font-micro">
                ARMED
              </span>
            </div>
          </div>
        </div>

        {/* Integrated PIDs - Tactical Layout */}
        <div className="flex-1 flex relative z-40 min-h-0 items-center justify-center p-[2cqw]">
          {/* Left Sidebar */}
          <div className="w-[22%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative bg-[#111] border border-[#333] rounded-sm shadow-inner">
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="#ef4444"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="#ef4444"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL PRESS"
                value={(data?.oilPressure || 0).toFixed(1)}
                unit="BAR"
                color="#ef4444"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[4cqh]">
            {/* Central RPM Display - Tactical Style */}
            <div className="relative flex flex-col items-center group cursor-default w-full">
              <div className="relative flex flex-col items-center w-full">
                <div className="flex items-baseline gap-4">
                  <span
                    className={`text-[26cqh] font-black text-white tabular-nums ${theme.fontFamily || ""}`}
                  >
                    <ResponsiveValue
                      value={Math.round(value * 1000)}
                      isRpm={true}
                      theme={theme}
                    />
                  </span>
                  <span className="text-[3cqh] font-black text-red-500/80 uppercase tracking-[0.5em] font-micro">
                    RPM
                  </span>
                </div>

                {/* RPM Bar - Blocky Tactical */}
                <div className="w-full h-[4cqh] bg-[#111] rounded-sm mt-4 overflow-hidden border-2 border-[#333] relative flex gap-[2px] p-[2px]">
                  {[...Array(30)].map((_, i) => {
                    const isActive = i < (rpmPercent / 100) * 30;
                    const isRedline = i >= 25;
                    const color = isRedline
                      ? "#ef4444"
                      : isActive
                        ? "#ffffff"
                        : "#222222";
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-full transition-none`}
                        style={{
                          backgroundColor: color,
                          boxShadow:
                            isActive && isRedline
                              ? `0 0 10px ${color}`
                              : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Central Gear - Tactical Block */}
              {gear && (
                <div className="absolute -top-[12cqh] w-[14cqh] h-[14cqh] border-2 border-red-500/50 flex items-center justify-center bg-[#050505] shadow-[0_0_30px_rgba(255,0,0,0.2)] transition-all duration-500">
                  <span className="text-[8cqh] font-black text-red-500 font-micro transition-all duration-500">
                    {gear}
                  </span>
                </div>
              )}
            </div>

            {/* Speed Display - Tactical Block */}
            <div className="w-[70%] flex flex-col items-center group cursor-default bg-[#111] px-[6cqw] py-[2cqh] rounded-sm border-2 border-[#333] shadow-inner transition-all duration-500">
              <div className="w-full flex justify-between items-end mb-2">
                <span className="text-[2.5cqh] font-black text-white/80 uppercase tracking-[0.8em] font-micro">
                  SPEED
                </span>
                <span className="text-[7cqh] font-black text-white tabular-nums font-micro leading-none">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[22%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative bg-[#111] border border-[#333] rounded-sm shadow-inner">
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="#ef4444"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="#ef4444"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="BOOST"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="#ef4444"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[12%] mt-auto shrink-0 p-1 z-40">
          <div className="h-full bg-[#050505] rounded-sm border-2 border-[#333] flex items-center px-[6cqw] relative overflow-hidden">
            <TelemetryGrid
              data={data}
              color="#ef4444"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const NeonSynthwaveGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-micro relative bg-[#0f0518] rounded-[2cqh] overflow-hidden border-2 border-fuchsia-500/30 shadow-[inset_0_0_100px_rgba(217,70,239,0.15)] flex flex-col group/gauge"
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(217,70,239,0.15)" } as any}
          />
        )}

        {/* Synthwave Sun & Grid Background */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-[linear-gradient(rgba(217,70,239,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.2)_1px,transparent_1px)] bg-[size:4cqw_4cqh] [transform:perspective(500px)_rotateX(60deg)] origin-bottom z-0" />
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[40cqh] h-[40cqh] rounded-sm bg-gradient-to-b from-yellow-400 via-orange-500 to-fuchsia-600 shadow-[0_0_80px_rgba(249,115,22,0.6)] z-0 opacity-40"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% 10%, 0 10%, 0 15%, 100% 15%, 100% 25%, 0 25%, 0 30%, 100% 30%, 100% 45%, 0 45%, 0 50%, 100% 50%, 100% 70%, 0 70%, 0 75%, 100% 75%, 100% 100%, 0 100%)",
          }}
        />

        <div className="high-end-gloss z-50 opacity-30" />

        {/* Top Header - Synthwave Style */}
        <div className="h-[10%] flex items-center justify-between px-[4cqw] border-b-4 border-fuchsia-500/40 relative z-40 bg-black/60 backdrop-blur-xl shrink-0 shadow-[0_10px_30px_rgba(217,70,239,0.2)]">
          <div className="flex items-center gap-[2cqw]">
            <div className="w-[1.4cqh] h-[1.4cqh] bg-cyan-400 rounded-sm shadow-[0_0_15px_#22d3ee] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-black text-[2cqh] tracking-[0.6em] uppercase italic font-micro-bold drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]">
                OUTRUN_OS_1984
              </span>
              <span className="text-cyan-400/80 text-[0.8cqh] tracking-[0.4em] uppercase font-micro">
                VIRTUAL_REALITY_LINK
              </span>
            </div>
            <WarningLights data={data} className="ml-12 scale-110" />
          </div>
          <div className="flex items-center gap-[4cqw]">
            <div className="px-4 py-1 border-2 border-cyan-400/50 rounded-sm bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <span className="text-cyan-400 font-black text-[1.2cqh] tracking-[0.4em] uppercase italic font-micro">
                TURBO
              </span>
            </div>
          </div>
        </div>

        {/* Integrated PIDs - Synthwave Layout */}
        <div className="flex-1 flex relative z-40 min-h-0 items-center justify-center p-[2cqw]">
          {/* Left Sidebar */}
          <div className="w-[22%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative bg-black/40 border border-fuchsia-500/30 rounded-sm backdrop-blur-md shadow-[0_0_20px_rgba(217,70,239,0.1)]">
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="#d946ef"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="#d946ef"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL PRESS"
                value={(data?.oilPressure || 0).toFixed(1)}
                unit="BAR"
                color="#d946ef"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[4cqh]">
            {/* Central RPM Display - Synthwave Style */}
            <div className="relative flex flex-col items-center group cursor-default w-full">
              <div className="relative flex flex-col items-center w-full">
                <div className="flex items-baseline gap-4">
                  <span
                    className={`text-[24cqh] font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-fuchsia-500 tabular-nums ${theme.fontFamily || ""}`}
                  >
                    <ResponsiveValue
                      value={Math.round(value * 1000)}
                      isRpm={true}
                      theme={theme}
                    />
                  </span>
                  <span className="text-[4cqh] font-black text-cyan-400/80 uppercase tracking-[0.5em] font-micro italic drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    RPM
                  </span>
                </div>

                {/* RPM Bar - Synthwave Neon */}
                <div className="w-full h-[3cqh] bg-black/30 rounded-sm mt-4 overflow-hidden border-2 border-cyan-400/40 relative flex gap-[4px] p-[2px] shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  {[...Array(40)].map((_, i) => {
                    const isActive = i < (rpmPercent / 100) * 40;
                    const isRedline = i >= 34;
                    const color = isRedline ? "#f97316" : "#22d3ee";
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-full -skew-x-[30deg] transition-none ${isActive ? "opacity-300" : "opacity-40"}`}
                        style={{
                          backgroundColor: color,
                          boxShadow: isActive ? `0 0 15px ${color}` : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Central Gear - Synthwave Block */}
              {gear && (
                <div className="absolute -top-[14cqh] w-[14cqh] h-[14cqh] border-4 border-fuchsia-500 flex items-center justify-center bg-black/50 shadow-[0_0_40px_rgba(217,70,239,0.6)] transition-all duration-500 -skew-x-12">
                  <span className="text-[9cqh] font-black text-fuchsia-400 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)] font-micro transition-all duration-500 skew-x-12">
                    {gear}
                  </span>
                </div>
              )}
            </div>

            {/* Speed Display - Synthwave Block */}
            <div className="w-[70%] flex flex-col items-center group cursor-default bg-black/60 px-[6cqw] py-[2cqh] rounded-sm border-2 border-fuchsia-500/40 shadow-[0_0_30px_rgba(217,70,239,0.3)] transition-all duration-500">
              <div className="w-full flex justify-between items-end mb-2">
                <span className="text-[3cqh] font-black text-fuchsia-400/80 uppercase tracking-[0.8em] font-micro italic drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                  SPEED
                </span>
                <span className="text-[8cqh] font-black text-cyan-300 tabular-nums drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] font-micro leading-none">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[22%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative bg-black/40 border border-fuchsia-500/30 rounded-sm backdrop-blur-md shadow-[0_0_20px_rgba(217,70,239,0.1)]">
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="#22d3ee"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="#22d3ee"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="BOOST"
                value={(data?.boost || 0).toFixed(1)}
                unit="PSI"
                color="#22d3ee"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[12%] mt-auto shrink-0 p-1 z-40">
          <div className="h-full bg-black/50 rounded-sm border-2 border-cyan-400/40 flex items-center px-[6cqw] relative overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <TelemetryGrid
              data={data}
              color="#22d3ee"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const EleganceMinimalGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);

    return (
      <div
        className={`w-full h-full p-[2cqh] ${theme.fontFamily || "font-tech"} relative bg-[#f8f9fa] rounded-[1cqh] overflow-hidden border border-[#e5e7eb] shadow-[inset_0_0_50px_rgba(0,0,0,0.05)] flex flex-col group/gauge`}
        style={{ containerType: "size" }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": "rgba(255,255,255,0.8)" } as any}
          />
        )}

        {/* Minimalist Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8f9fa] to-[#e9ecef] z-0" />

        {/* Subtle Texture */}
        <div
          className="absolute inset-0 opacity-40 z-0"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "2cqw 2cqh",
          }}
        />

        <div className="high-end-gloss z-50 opacity-30" />

        {/* Top Header - Minimalist Style */}
        <div className="h-[8%] flex items-center justify-between px-[4cqw] border-b border-[#e5e7eb] relative z-40 bg-white/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-[2cqw]">
            <div className="flex flex-col">
              <span className="text-[#1f2937] font-light text-[1.8cqh] tracking-[0.4em] uppercase">
                ELEGANCE_SERIES
              </span>
              <span className="text-[#6b7280] text-[0.8cqh] tracking-[0.2em] uppercase">
                PURE_MINIMALISM
              </span>
            </div>
            <WarningLights data={data} className="ml-12 scale-90 opacity-80" />
          </div>
          <div className="flex items-center gap-[4cqw]">
            <div className="px-4 py-1 border border-[#d1d5db] rounded-sm bg-[#f3f4f6]">
              <span className="text-[#4b5563] font-medium text-[1cqh] tracking-[0.2em] uppercase">
                TOURING
              </span>
            </div>
          </div>
        </div>

        {/* Integrated PIDs - Minimalist Layout */}
        <div className="flex-1 flex relative z-40 min-h-0 items-center justify-center p-[2cqw]">
          {/* Left Sidebar */}
          <div className="w-[20%] flex flex-col gap-[3cqh] py-[2cqh] px-[2cqw] relative bg-white/60 border border-[#e5e7eb] rounded-sm backdrop-blur-sm shadow-sm">
            <div className="relative z-10 flex flex-col gap-[3cqh]">
              <PidBox
                data={data}
                label="COOLANT"
                value={Math.round(data?.coolantTemp || 0)}
                unit="°F"
                color="#374151"
                align="left"
                borderSide="left"
              />
              <PidBox
                data={data}
                label="OIL TEMP"
                value={Math.round(data?.oilTemp || 0)}
                unit="°F"
                color="#374151"
                align="left"
                borderSide="left"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[4cqw] gap-[6cqh]">
            {/* Central RPM Display - Minimalist Style */}
            <div className="relative flex flex-col items-center group cursor-default w-full">
              <div className="relative flex flex-col items-center w-full">
                <div className="flex items-baseline gap-4">
                  <span
                    className={`text-[28cqh] font-light text-[#111827] tabular-nums tracking-tighter ${theme.fontFamily || ""}`}
                  >
                    <ResponsiveValue
                      value={Math.round(value * 1000)}
                      isRpm={true}
                      theme={theme}
                    />
                  </span>
                  <span className="text-[3cqh] font-medium text-[#9ca3af] uppercase tracking-[0.2em]">
                    RPM
                  </span>
                </div>

                {/* RPM Bar - Minimalist Line */}
                <div className="w-[80%] h-[1cqh] bg-[#e5e7eb] rounded-sm mt-2 overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#1f2937] transition-none"
                    style={{ width: `${rpmPercent}%` }}
                  />
                  {/* Redline indicator */}
                  <div className="absolute top-0 right-0 h-full w-[15%] bg-[#ef4444] opacity-80" />
                </div>
              </div>

              {/* Central Gear - Minimalist Block */}
              {gear && (
                <div className="absolute -top-[10cqh] w-[12cqh] h-[12cqh] border border-[#d1d5db] flex items-center justify-center bg-white shadow-sm transition-all duration-500 rounded-sm">
                  <span className="text-[6cqh] font-light text-[#111827] transition-all duration-500">
                    {gear}
                  </span>
                </div>
              )}
            </div>

            {/* Speed Display - Minimalist Block */}
            <div className="w-[60%] flex flex-col items-center group cursor-default bg-white/80 px-[4cqw] py-[2cqh] rounded-sm border border-[#e5e7eb] shadow-sm transition-all duration-500">
              <div className="w-full flex justify-between items-end mb-1">
                <span className="text-[2cqh] font-medium text-[#9ca3af] uppercase tracking-[0.2em]">
                  SPEED
                </span>
                <span className="text-[6cqh] font-light text-[#111827] tabular-nums leading-none tracking-tighter">
                  <ResponsiveValue
                    value={Math.round(speed || 0)}
                    theme={theme}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[20%] flex flex-col gap-[3cqh] py-[2cqh] px-[2cqw] relative bg-white/60 border border-[#e5e7eb] rounded-sm backdrop-blur-sm shadow-sm">
            <div className="relative z-10 flex flex-col gap-[3cqh]">
              <PidBox
                data={data}
                label="BATTERY"
                value={(data?.voltage || 0).toFixed(1)}
                unit="V"
                color="#374151"
                align="right"
                borderSide="right"
              />
              <PidBox
                data={data}
                label="FUEL"
                value={Math.round(data?.fuelLevel || 0)}
                unit="%"
                color="#374151"
                align="right"
                borderSide="right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Minimalist Row */}
        <div className="h-[10%] mt-auto shrink-0 p-1 z-40">
          <div className="h-full bg-white/80 rounded-sm border border-[#e5e7eb] flex items-center px-[6cqw] relative overflow-hidden shadow-sm">
            <TelemetryGrid
              data={data}
              color="#4b5563"
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const AeroUniversalJDMGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="JDM_LEGEND"
    bgType="solid"
    layoutType="standard"
  />
);
const AeroPerformanceGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="PERFORMANCE_SPEC"
    bgType="texture"
    customTexture="carbon-fibre"
    layoutType="split"
  />
);
const AeroWidePerformanceGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="WIDE_PERFORMANCE"
    bgType="texture"
    customTexture="machined"
    layoutType="asymmetric"
  />
);
const AeroAdventureGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="ADVENTURE_PRO"
    bgType="texture"
    customTexture="hex-grid"
    layoutType="central"
  />
);
const AeroRacingGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="RACING_DYNAMICS"
    bgType="grid"
    layoutType="split"
  />
);
const AeroLuxuryGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="LUXURY_TOURING"
    bgType="texture"
    customTexture="alcantara"
    layoutType="central"
  />
);
const AeroBlueprintGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="BLUEPRINT_V4"
    bgType="texture"
    customTexture="blueprint"
    layoutType="standard"
  />
);
const AeroFuturisticGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="FUTURISTIC_HUD"
    bgType="pulse"
    layoutType="asymmetric"
  />
);
const AeroCyberpunkGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="CYBERPUNK_2077"
    bgType="grid"
    layoutType="split"
  />
);
const AeroMinimalistGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="MINIMALIST_DASH"
    bgType="solid"
    layoutType="central"
  />
);
const AeroTacticalGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="TACTICAL_OPS"
    bgType="radar"
    layoutType="asymmetric"
  />
);
const AeroNeonGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="NEON_NIGHTS"
    bgType="pulse"
    layoutType="split"
  />
);
const AeroHolographicGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="HOLOGRAPHIC_PROJ"
    bgType="hologram"
    layoutType="central"
  />
);
const AeroRetroArcadeGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="RETRO_ARCADE"
    bgType="grid"
    layoutType="standard"
  />
);
const AeroSteampunkGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="STEAMPUNK_GEARS"
    bgType="texture"
    customTexture="machined"
    layoutType="asymmetric"
  />
);
const AeroSynthwaveGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="SYNTHWAVE_RIDER"
    bgType="grid"
    layoutType="split"
  />
);
const AeroGlassmorphismGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="AERO_GLASS_UI"
    bgType="pulse"
    layoutType="central"
  />
);
const AeroRadarGauge: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="RADAR_SWEEP"
    bgType="radar"
    layoutType="asymmetric"
  />
);
const AeroInterLinkV2: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="INTERLINK_V2"
    bgType="texture"
    customTexture="circuit-board"
    layoutType="split"
  />
);
const AeroVfdLink: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="VFD_LINK"
    bgType="solid"
    layoutType="standard"
  />
);
const AeroCyberNeon2088: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="CYBER_NEON_2088"
    bgType="pulse"
    layoutType="asymmetric"
  />
);
const AeroTitaniumPrecision: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="TITANIUM_PRECISION"
    bgType="texture"
    customTexture="brushed-alum"
    layoutType="central"
  />
);

const FighterJetHUDGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    if (typeof window !== "undefined" || value || !value) {
      return (
        <FighterJetHUDGaugeImported
          value={value}
          speed={speed}
          gear={gear}
          data={data}
          theme={theme}
          backlit={backlit}
        />
      );
    }
    const rpmPercent = Math.min(100, (value / 9) * 100);
    const primaryColor = theme.primaryColor || "#00FF66";
    const secondaryColor = theme.secondaryColor || "#002208";
    const accentColor = theme.accentColor || "#FF3B30";

    const speedVal = Math.round(speed || 0);
    const rpmVal = Math.round(value * 1000);

    // Flight states
    const heading = Math.round((speedVal * 2.4 + 120) % 360);
    const gForce = (1.0 + value * 0.4 + speedVal * 0.015).toFixed(1);
    const angleOfAttack = (3.2 + value * 0.8).toFixed(1);
    const altitude = Math.round(rpmVal * 1.5 + speedVal * 5); // Simulated altitude using current performance

    // Tactical Lock State
    const targetLocked = speedVal > 5;

    return (
      <div
        className="w-full h-full p-[1.5cqh] font-mono relative rounded-[1cqh] overflow-hidden border-2 shadow-[inset_0_0_120px_rgba(0,0,0,1)] flex flex-col group/gauge select-none"
        style={{
          containerType: "size",
          backgroundColor: "#020703",
          borderColor: `${primaryColor}40`,
        }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": primaryColor + "10" } as any}
          />
        )}

        {/* 1. Tactical Avionics Radar Grid */}
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none z-0 mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(circle, ${primaryColor} 1px, transparent 1px), linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
            backgroundSize: "20cqw 20cqh, 4cqw 4cqh, 4cqw 4cqh",
          }}
        />

        {/* Extreme border markings (cockpit HUD glass corners) */}
        <div
          className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 pointer-events-none z-10"
          style={{ borderColor: `${primaryColor}60` }}
        />
        <div
          className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 pointer-events-none z-10"
          style={{ borderColor: `${primaryColor}60` }}
        />
        <div
          className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 pointer-events-none z-10"
          style={{ borderColor: `${primaryColor}60` }}
        />
        <div
          className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 pointer-events-none z-10"
          style={{ borderColor: `${primaryColor}60` }}
        />

        {/* Pitch Ladder (HUD) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
          <div className="flex flex-col gap-[4cqh] items-center w-[40cqw]">
            {[15, 10, 5, 0, -5, -10, -15].map((deg) => (
              <div
                key={deg}
                className="flex items-center justify-between w-full"
              >
                <span
                  className="text-[1.5cqh] font-bold"
                  style={{ color: primaryColor }}
                >
                  {Math.abs(deg)}
                </span>
                <div
                  className={`flex-1 h-[2px] mx-[1cqw] ${deg === 0 ? "bg-transparent" : ""}`}
                  style={{
                    backgroundColor: deg === 0 ? "transparent" : primaryColor,
                    borderTop: deg === 0 ? `2px solid ${primaryColor}` : "none",
                  }}
                >
                  {deg < 0 && (
                    <div
                      className="w-full h-[2px] mt-[2px]"
                      style={{
                        backgroundColor: theme.backgroundColor || "#000500",
                      }}
                    />
                  )}
                </div>
                <div className="w-[10cqw]" /> {/* Center gap */}
                <div
                  className={`flex-1 h-[2px] mx-[1cqw] ${deg === 0 ? "bg-transparent" : ""}`}
                  style={{
                    backgroundColor: deg === 0 ? "transparent" : primaryColor,
                    borderTop: deg === 0 ? `2px solid ${primaryColor}` : "none",
                  }}
                >
                  {deg < 0 && (
                    <div
                      className="w-full h-[2px] mt-[2px]"
                      style={{
                        backgroundColor: theme.backgroundColor || "#000500",
                      }}
                    />
                  )}
                </div>
                <span
                  className="text-[1.5cqh] font-bold"
                  style={{ color: primaryColor }}
                >
                  {Math.abs(deg)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Vector (Flight Path Marker) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[6cqh] h-[6cqh] flex items-center justify-center pointer-events-none z-0">
          <div
            className="w-[1.5cqh] h-[1.5cqh] rounded-full border-2"
            style={{ borderColor: primaryColor }}
          />
          <div
            className="w-[3cqh] h-[2px] absolute -left-[3cqh]"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="w-[3cqh] h-[2px] absolute -right-[3cqh]"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="w-[2px] h-[2cqh] absolute -top-[2cqh]"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* Dynamic F-22 Roll / G-Load Indicators */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70cqh] h-[70cqh] border-[3px] border-dashed rounded-full pointer-events-none z-0 flex items-center justify-center animate-[spin_30s_linear_infinite]"
          style={{ borderColor: `${primaryColor}40` }}
        >
          <div
            className="absolute top-0 w-4 h-4 -mt-2 bg-transparent border-b-[8px] border-x-[8px] border-x-transparent"
            style={{ borderBottomColor: primaryColor }}
          />
        </div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55cqh] h-[55cqh] rounded-full pointer-events-none z-0 border-[0.5cqh] border-transparent border-t-current animate-[spin_8s_ease-in-out_infinite]"
          style={{ color: `${primaryColor}80` }}
        />

        <div className="high-end-gloss z-50 opacity-30" />

        {/* Top Header - HUD Style */}
        <div
          className="h-[10%] flex items-center justify-between px-[4cqw] border-b-2 relative z-40 bg-black/30 shrink-0 shadow-[0_5px_15px_rgba(0,0,0,0.8)] backdrop-blur-md"
          style={{ borderColor: primaryColor }}
        >
          <div className="flex items-center gap-[2cqw]">
            <div
              className="w-[1.4cqh] h-[1.4cqh] rounded-sm shadow-[0_0_10px_currentColor] animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="flex flex-col drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
              <span
                className="font-black text-[1.8cqh] tracking-[0.8em] uppercase font-micro-bold"
                style={{ color: primaryColor }}
              >
                RAPTOR_HUD
              </span>
              <span
                className="text-[0.8cqh] tracking-[0.4em] uppercase font-micro"
                style={{ color: primaryColor }}
              >
                TACTICAL_TELEMETRY
              </span>
            </div>
            <div className="flex items-center gap-[2cqw] ml-[4cqw]">
              {["P", "R", "N", "D", "S", "M"].map((g) => (
                <div
                  key={g}
                  className={`text-[2.5cqh] font-black transition-all duration-300 drop-shadow-[0_2px_5px_rgba(0,0,0,1)] ${gear === g ? "scale-125" : "opacity-40"}`}
                  style={{ color: gear === g ? accentColor : primaryColor }}
                >
                  {g}
                </div>
              ))}
            </div>
            <WarningLights
              data={data}
              className="ml-[4cqw] scale-110 drop-shadow-[0_2px_5px_rgba(0,0,0,1)]"
            />
          </div>
        </div>

        {/* Integrated PIDs - HUD Layout */}
        <div className="flex-1 flex relative z-40 min-h-0 items-stretch justify-between p-[2cqw] pb-[0]">
          {/* Left Sidebar - Telemetry PIDs */}
          <div
            className="w-[25%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative bg-black/20 border-r-2 shadow-[20px_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md h-full"
            style={{ borderColor: primaryColor }}
          >
            <div className="relative z-10 flex flex-col gap-[2.5cqh] justify-around h-full scale-130 origin-left">
              {[
                {
                  label: "INTAKE AIR",
                  val: Math.round(data?.intakeAirTemp || 0),
                  unit: "°C",
                  perc: Math.min(100, ((data?.intakeAirTemp || 0) / 100) * 100),
                  color: primaryColor,
                },
                {
                  label: "ENG LOAD",
                  val: Math.round(data?.engineLoad || 0),
                  unit: "%",
                  perc: data?.engineLoad || 0,
                  color: accentColor,
                },
                {
                  label: "BATTERY",
                  val: (data?.batteryVolts || 12.4).toFixed(1),
                  unit: "V",
                  perc: Math.max(
                    0,
                    Math.min(100, (((data?.batteryVolts || 0) - 10) / 5) * 100),
                  ),
                  color: primaryColor,
                },
                {
                  label: "OIL PRESS",
                  val: Math.round(data?.oilPressure || 0),
                  unit: "PSI",
                  perc: Math.min(100, data?.oilPressure || 0),
                  color: primaryColor,
                },
              ].map((pid, idx) => (
                <div
                  key={idx}
                  className="flex flex-col drop-shadow-[0_2px_5px_rgba(0,0,0,1)] w-full"
                >
                  <div className="flex justify-between items-end mb-1">
                    <span
                      className="text-[1.2cqh] opacity-70 tracking-widest"
                      style={{ color: primaryColor }}
                    >
                      {pid.label}
                    </span>
                    <span
                      className="text-[3.5cqh] font-bold leading-none"
                      style={{ color: pid.color }}
                    >
                      {pid.val}
                      <span className="text-[1.5cqh] opacity-70">
                        {pid.unit}
                      </span>
                    </span>
                  </div>
                  <div
                    className="w-full h-[0.5cqh] bg-black/50 overflow-hidden"
                    style={{ border: `1px solid ${primaryColor}40` }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${pid.perc}%`,
                        backgroundColor: pid.color,
                        boxShadow: `0 0 10px ${pid.color}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[2cqh] drop-shadow-[0_5px_15px_rgba(0,0,0,1)]">
            {/* Central RPM Display - HUD Style */}
            <div className="relative flex flex-col items-center group cursor-default w-full scale-[2] transform transition-transform duration-700">
              <div
                className="text-[25cqh] leading-none font-black tracking-tighter"
                style={{ color: primaryColor }}
              >
                <ResponsiveValue
                  value={Math.round(value * 1000)}
                  isRpm={true}
                  theme={theme}
                />
              </div>
              <div
                className="text-[2.5cqh] font-bold tracking-[0.5em] uppercase opacity-80"
                style={{ color: primaryColor }}
              >
                RPM
              </div>

              {/* Linear RPM Bar */}
              <div
                className="w-[80%] h-[2cqh] bg-black/30 border mt-[2cqh] relative overflow-hidden"
                style={{ borderColor: primaryColor }}
              >
                <div
                  className="absolute top-0 left-0 h-full transition-none"
                  style={{
                    width: `${rpmPercent}%`,
                    backgroundColor:
                      rpmPercent > 90 ? accentColor : primaryColor,
                    boxShadow: `0 0 10px ${rpmPercent > 90 ? accentColor : primaryColor}`,
                  }}
                />
              </div>
            </div>

            {/* Central Speed Display */}
            <div className="relative flex flex-col items-center mt-[8cqh] scale-[2] transform transition-transform duration-700">
              <div
                className="text-[18cqh] leading-none font-black tracking-tighter"
                style={{ color: primaryColor }}
              >
                <ResponsiveValue value={Math.round(speed || 0)} theme={theme} />
              </div>
              <div
                className="text-[2cqh] font-bold tracking-[0.5em] uppercase opacity-80"
                style={{ color: primaryColor }}
              >
                MPH
              </div>
            </div>
          </div>

          {/* Right Sidebar - Telemetry PIDs */}
          <div
            className="w-[25%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative bg-black/20 border-l-2 shadow-[-20px_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md h-full"
            style={{ borderColor: primaryColor }}
          >
            <div className="relative z-10 flex flex-col gap-[2.5cqh] justify-around h-full text-right items-end scale-130 origin-right">
              {[
                {
                  label: "COOLANT",
                  val: Math.round(data?.coolantTemp || 0),
                  unit: "°C",
                  perc: Math.min(
                    100,
                    Math.max(0, ((data?.coolantTemp || 0) / 250) * 100),
                  ),
                  color: primaryColor,
                },
                {
                  label: "OIL TEMP",
                  val: Math.round(data?.oilTemp || 0),
                  unit: "°C",
                  perc: Math.min(
                    100,
                    Math.max(0, ((data?.oilTemp || 0) / 280) * 100),
                  ),
                  color: primaryColor,
                },
                {
                  label: "FUEL LVL",
                  val: Math.round(data?.fuelLevel || 100),
                  unit: "%",
                  perc: data?.fuelLevel || 100,
                  color: primaryColor,
                },
                {
                  label: "BOOST",
                  val: (data?.boost || 0).toFixed(1),
                  unit: "PSI",
                  perc: Math.min(100, ((data?.boost || 0) / 25) * 100),
                  color: accentColor,
                },
              ].map((pid, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-end drop-shadow-[0_2px_5px_rgba(0,0,0,1)] w-full"
                >
                  <div className="flex justify-between items-end mb-1 w-full flex-row-reverse">
                    <span
                      className="text-[1.2cqh] opacity-70 tracking-widest text-left"
                      style={{ color: primaryColor }}
                    >
                      {pid.label}
                    </span>
                    <span
                      className="text-[3.5cqh] font-bold leading-none"
                      style={{ color: pid.color }}
                    >
                      {pid.val}
                      <span className="text-[1.5cqh] opacity-70">
                        {pid.unit}
                      </span>
                    </span>
                  </div>
                  <div
                    className="w-full h-[0.5cqh] bg-black/50 overflow-hidden transform rotate-180"
                    style={{ border: `1px solid ${primaryColor}40` }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${pid.perc}%`,
                        backgroundColor: pid.color,
                        boxShadow: `0 0 10px ${pid.color}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Ticker Display */}
        <div className="h-[5%] w-full relative z-[100]">
          <Ticker
            data={data}
            theme={theme}
            className="w-full h-full text-[2.5cqh]"
          />
        </div>
      </div>
    );
  },
);

const AeroPurpleNebula: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="PURPLE_NEBULA"
    bgType="pulse"
    layoutType="ultrawide"
  />
);
const AeroPurpleCyber: React.FC<GaugeProps> = (props) => (
  <AeroGlassBaseGauge
    {...props}
    title="PURPLE_CYBER"
    bgType="grid"
    layoutType="split"
  />
);

export const UnifiedTacticalGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false, layoutVariant = 0 }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);
    const primary = theme.primaryColor || "#ef4444";
    const secondary = theme.secondaryColor || "#000000";
    const accent = theme.accentColor || "#ffffff";
    const bg = theme.backgroundColor || "#050505";
    const title = theme.name || "TACTICAL_HUD_v4";
    const isGlow = theme.glowEffect;

    return (
      <div
        className={`w-full h-full p-[1.5cqh] font-micro relative rounded-[1cqh] overflow-hidden border-[0.5cqh] shadow-[inset_0_0_150px_rgba(0,0,0,1)] flex flex-col group/gauge ${theme.texture ? `texture-${theme.texture}` : ""}`}
        style={{
          containerType: "size",
          backgroundColor: bg,
          borderColor: secondary,
          boxShadow: isGlow
            ? `0 0 50px ${primary}33, inset 0 0 100px rgba(0,0,0,0.9)`
            : "inset 0 0 100px rgba(0,0,0,0.9)",
        }}
      >
        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": `${primary}15` } as any}
          />
        )}

        {/* High-End Glassmorphism Background Layer */}
        <div className="absolute inset-0 z-0 bg-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none z-0" />

        {/* Neon-Racer Specific Purple Glow */}
        {theme.id === "neon-racer" && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,55,242,0.15)_0%,transparent_70%)] pointer-events-none z-0" />
        )}

        {/* Tactical Grid Background - colored by primary */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4cqw_4cqh] z-0" />

        {/* Crosshairs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80cqh] h-[80cqh] border border-white/40 rounded-full pointer-events-none z-0 flex items-center justify-center opacity-30">
          <div className="w-full h-[1px] bg-white/10 absolute" />
          <div className="w-[1px] h-full bg-white/10 absolute" />
          <div className="w-[60cqh] h-[60cqh] border border-white/40 rounded-full absolute" />
          <div className="w-[40cqh] h-[40cqh] border border-white/40 rounded-full absolute" />
        </div>

        <div className="high-end-gloss z-50 opacity-40 pointer-events-none" />

        {/* Top Header - Tactical Style */}
        <div
          className="h-[10%] flex items-center justify-between px-[4cqw] border-b-2 relative z-40 shrink-0 shadow-md backdrop-blur-md"
          style={{ borderColor: `${primary}40`, backgroundColor: `${bg}CC` }}
        >
          <div className="flex items-center gap-[2cqw]">
            <div
              className="w-[1.4cqh] h-[1.4cqh] rounded-sm animate-pulse"
              style={{
                backgroundColor: accent,
                boxShadow: isGlow ? `0 0 15px ${accent}` : "none",
              }}
            />
            <div className="flex flex-col">
              <span className="text-white/90 font-black text-[1.8cqh] tracking-[0.8em] uppercase font-micro-bold drop-shadow-md">
                {title}
              </span>
              <span
                className="text-[0.8cqh] tracking-[0.4em] uppercase font-micro"
                style={{ color: primary }}
              >
                SYSTEM_ONLINE // SECURE_LINK
              </span>
            </div>
            <WarningLights
              data={data}
              className="ml-12 scale-110 grayscale contrast-150"
            />
          </div>
          <div className="flex items-center gap-[4cqw]">
            <div
              className="px-4 py-1 border rounded-sm backdrop-blur-sm shadow-inner"
              style={{
                borderColor: `${primary}80`,
                backgroundColor: `${primary}1A`,
              }}
            >
              <span
                className="font-black text-[1.2cqh] tracking-[0.4em] uppercase font-micro"
                style={{
                  color: primary,
                  textShadow: isGlow ? `0 0 10px ${primary}` : "none",
                }}
              >
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Integrated PIDs - Tactical Layout */}
        <div
          className={`flex-1 flex relative z-40 min-h-0 items-center justify-center p-[2cqw] ${layoutVariant === 1 || layoutVariant === 3 ? "flex-row-reverse" : ""}`}
        >
          {/* Left Sidebar */}
          <div
            className="w-[22%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative border rounded-xl shadow-2xl backdrop-blur-xl"
            style={{
              backgroundColor: `${secondary}99`,
              borderColor: `${primary}33`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              {layoutVariant === 2 || layoutVariant === 3 ? (
                <>
                  <PidBox
                    data={data}
                    label="BATTERY"
                    value={(data?.batteryVolts || data?.voltage || 13.8).toFixed(1)}
                    unit="V"
                    color={primary}
                    align="center"
                    borderSide="center"
                  />
                  <PidBox
                    data={data}
                    label="FUEL"
                    value={Math.round(data?.fuelLevel ?? 85)}
                    unit="%"
                    color={primary}
                    align="center"
                    borderSide="center"
                  />
                  <PidBox
                    data={data}
                    label="BOOST"
                    value={(data?.boost ?? 0).toFixed(1)}
                    unit="PSI"
                    color={primary}
                    align="center"
                    borderSide="center"
                  />
                </>
              ) : (
                <>
                  <PidBox
                    data={data}
                    label="COOLANT"
                    value={Math.round(data?.coolantTemp ?? 185)}
                    unit="°F"
                    color={primary}
                    align="center"
                    borderSide="center"
                  />
                  <PidBox
                    data={data}
                    label="OIL TEMP"
                    value={Math.round(data?.oilTemp ?? 195)}
                    unit="°F"
                    color={primary}
                    align="center"
                    borderSide="center"
                  />
                  <PidBox
                    data={data}
                    label="OIL PRESS"
                    value={(data?.oilPressure ?? 45).toFixed(1)}
                    unit="PSI"
                    color={primary}
                    align="center"
                    borderSide="center"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative px-[3cqw] gap-[4cqh]">
            {/* Central RPM Display - Tactical Style */}
            <div className="relative flex flex-col items-center group cursor-default w-full">
              <div className="relative flex flex-col items-center w-full">
                <div className="flex items-baseline gap-4 relative">
                  {/* RPM font smaller but large enough to fit perfectly */}
                  <span
                    className={`text-[20cqh] font-black tabular-nums ${theme.fontFamily || ""}`}
                    style={{ color: accent }}
                  >
                    <ResponsiveValue
                      value={Math.round(value * 1000)}
                      isRpm={true}
                      theme={theme}
                    />
                  </span>
                  <span
                    className="text-[3cqh] font-black uppercase tracking-[0.5em] font-micro absolute -right-[8cqw] bottom-[4cqh]"
                    style={{
                      color: primary,
                      textShadow: isGlow ? `0 0 10px ${primary}` : "none",
                    }}
                  >
                    RPM
                  </span>
                </div>

                {/* RPM Bar - Blocky Tactical */}
                <div
                  className="w-full h-[4cqh] rounded-sm mt-4 overflow-hidden border border-white/30 relative flex gap-[3px] p-[3px] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md"
                  style={{ backgroundColor: `${secondary}CC` }}
                >
                  {[...Array(40)].map((_, i) => {
                    const isActive = i < (rpmPercent / 100) * 40;
                    const isRedline = i >= 32;
                    const color = isRedline
                      ? "#ef4444"
                      : isActive
                        ? primary
                        : "rgba(255,255,255,0.05)";
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-full rounded-[1px] transition-none`}
                        style={{
                          backgroundColor: color,
                          boxShadow:
                            isActive && isRedline
                              ? `0 0 15px ${color}`
                              : isActive && isGlow
                                ? `0 0 15px ${color}`
                                : "none",
                          opacity: isActive ? 1 : 0.5,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Central Gear - Tactical Block */}
              {gear && (
                <div
                  className="absolute -top-[12cqh] w-[14cqh] h-[14cqh] border-2 rounded-lg flex items-center justify-center shadow-2xl backdrop-blur-xl transition-all duration-500"
                  style={{
                    borderColor: `${accent}80`,
                    backgroundColor: `${bg}CC`,
                    boxShadow: isGlow
                      ? `0 0 40px ${accent}40, inset 0 0 20px ${accent}20`
                      : "inset 0 0 20px rgba(0,0,0,0.5)",
                  }}
                >
                  <span
                    className="text-[7cqh] font-black font-micro transition-all duration-500 drop-shadow-lg"
                    style={{ color: accent }}
                  >
                    {gear}
                  </span>
                </div>
              )}
            </div>

            {/* Speed Display - Tactical Block */}
            <div
              className="w-[70%] flex flex-col items-center group cursor-default px-[6cqw] py-[2cqh] rounded-xl border border-white/30 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-500 relative overflow-hidden"
              style={{ backgroundColor: `${secondary}CC` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] animate-scanline pointer-events-none" />
              <div className="w-full flex justify-between items-end mb-2 relative z-10">
                <span className="text-[2.5cqh] font-black text-white/80 uppercase tracking-[0.8em] font-micro">
                  SPEED
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[8cqh] font-black text-white tabular-nums font-micro leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <ResponsiveValue
                      value={Math.round(speed || 0)}
                      theme={theme}
                    />
                  </span>
                  <span className="text-[3cqh] font-black text-white/70 uppercase tracking-widest font-micro">
                    MPH
                  </span>
                </div>
              </div>
            </div>

            {/* New Circular Gauges and Lap Data below Speed */}
            <div className="w-full flex items-center justify-between px-[4cqw] mt-2">
              <div className="flex flex-col items-start pt-[1cqh] border-t border-white/20 w-[15cqw]">
                <span className="text-[1.5cqh] font-bold italic text-white/50 tracking-[0.2em]">
                  LAP TIME
                </span>
                <span className="text-[2.2cqh] font-black italic text-white">
                  03:18.983
                </span>
              </div>

              <div className="flex gap-[4cqw]">
                <div className="relative w-[14cqh] h-[14cqh] rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(0,0,0,0.9)]">
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
                      r="41"
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="6"
                      strokeDasharray="257.6"
                      strokeDashoffset={
                        257.6 -
                        257.6 *
                          (data?.boost !== undefined
                            ? Math.min(30, Math.max(0, data.boost)) / 30
                            : (value * 2.8) / 30)
                      }
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_#0ea5e9]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <span className="text-[1cqh] font-black text-[#0ea5e9] tracking-widest uppercase mb-[1px]">
                      BOOST
                    </span>
                    <span className="text-[2.8cqh] font-extrabold text-white leading-none tabular-nums">
                      {(data?.boost !== undefined
                        ? data.boost
                        : value * 2.8
                      ).toFixed(1)}
                    </span>
                    <span className="text-[0.9cqh] font-bold text-white/40 tracking-wider">
                      PSI
                    </span>
                  </div>
                </div>

                <div className="relative w-[14cqh] h-[14cqh] rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(0,0,0,0.9)]">
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
                      r="41"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="6"
                      strokeDasharray="257.6"
                      strokeDashoffset={
                        257.6 -
                        257.6 *
                          (data?.oilPressure !== undefined
                            ? Math.min(100, Math.max(0, data.oilPressure)) / 100
                            : (35 + value * 5) / 100)
                      }
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_#f59e0b]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <span className="text-[1cqh] font-black text-[#f59e0b] tracking-widest uppercase mb-[1px]">
                      OIL PRES
                    </span>
                    <span className="text-[2.8cqh] font-extrabold text-white leading-none tabular-nums">
                      {(data?.oilPressure !== undefined
                        ? data.oilPressure
                        : 35 + value * 5
                      ).toFixed(1)}
                    </span>
                    <span className="text-[0.9cqh] font-bold text-white/40 tracking-wider">
                      BAR
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end pt-[1cqh] border-t border-white/20 w-[15cqw]">
                <span className="text-[1.5cqh] font-bold italic text-white/50 tracking-[0.2em]">
                  SECTOR 1
                </span>
                <span className="text-[2.2cqh] font-black italic text-[#d946ef]">
                  01:27:13
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div
            className="w-[22%] flex flex-col gap-[2cqh] py-[2cqh] px-[2cqw] relative border rounded-xl shadow-2xl backdrop-blur-xl"
            style={{
              backgroundColor: `${secondary}99`,
              borderColor: `${primary}33`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-white/5 to-transparent rounded-xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-[2cqh]">
              {layoutVariant === 2 || layoutVariant === 3 ? (
                <>
                  <PidBox
                    data={data}
                    label="COOLANT"
                    value={Math.round(data?.coolantTemp ?? 185)}
                    unit="°F"
                    color={primary}
                    align={layoutVariant === 3 ? "left" : "right"}
                    borderSide={layoutVariant === 3 ? "left" : "right"}
                  />
                  <PidBox
                    data={data}
                    label="OIL TEMP"
                    value={Math.round(data?.oilTemp ?? 195)}
                    unit="°F"
                    color={primary}
                    align={layoutVariant === 3 ? "left" : "right"}
                    borderSide={layoutVariant === 3 ? "left" : "right"}
                  />
                  <PidBox
                    data={data}
                    label="OIL PRESS"
                    value={(data?.oilPressure ?? 45).toFixed(1)}
                    unit="PSI"
                    color={primary}
                    align={layoutVariant === 3 ? "left" : "right"}
                    borderSide={layoutVariant === 3 ? "left" : "right"}
                  />
                </>
              ) : (
                <>
                  <PidBox
                    data={data}
                    label="BATTERY"
                    value={(data?.batteryVolts || data?.voltage || 13.8).toFixed(1)}
                    unit="V"
                    color={primary}
                    align={layoutVariant === 1 ? "left" : "right"}
                    borderSide={layoutVariant === 1 ? "left" : "right"}
                  />
                  <PidBox
                    data={data}
                    label="FUEL"
                    value={Math.round(data?.fuelLevel ?? 85)}
                    unit="%"
                    color={primary}
                    align={layoutVariant === 1 ? "left" : "right"}
                    borderSide={layoutVariant === 1 ? "left" : "right"}
                  />
                  <PidBox
                    data={data}
                    label="BOOST"
                    value={(data?.boost ?? 0).toFixed(1)}
                    unit="PSI"
                    color={primary}
                    align={layoutVariant === 1 ? "left" : "right"}
                    borderSide={layoutVariant === 1 ? "left" : "right"}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Telemetry - Dedicated Row */}
        <div className="h-[12%] mt-auto shrink-0 p-2 z-40">
          <div
            className="h-full rounded-xl border backdrop-blur-3xl flex items-center px-[6cqw] relative overflow-hidden shadow-2xl"
            style={{
              backgroundColor: `${bg}E6`,
              borderColor: `${primary}4D`,
              boxShadow: isGlow
                ? `0 0 60px ${primary}33, inset 0 0 20px ${primary}1A`
                : "inset 0 0 20px rgba(0,0,0,0.5)",
            }}
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,rgba(255,255,255,0.03)_50%)] bg-[size:5%_100%]" />
            <TelemetryGrid
              data={data}
              color={primary}
              useVerticalDividers={true}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  },
);

const GAUGE_SKINS = THEMES.map((theme, index) => {
  if (theme.gaugeType === "ev-modern") {
    const SkinComponent: React.FC<GaugeProps> = (props) => {
      return <ModernEVGauge {...props} theme={theme} />;
    };
    return SkinComponent;
  }

  // Map specific gauge types to real components
  if (theme.gaugeType === "fighter-jet") {
    return (props: GaugeProps) => (
      <FighterJetHUDGauge {...props} theme={theme} />
    );
  }

  if (
    theme.gaugeType === "gravity-master" ||
    theme.gaugeType === "tactical-ops"
  ) {
    return (props: GaugeProps) => (
      <UnifiedTacticalGauge
        {...props}
        theme={theme}
        layoutVariant={index % 4}
      />
    );
  }

  if (theme.gaugeType === "forged-rs-elite") {
    const SkinComponent: React.FC<GaugeProps> = (props) => {
      return <CarbonSweepGauge {...props} theme={theme} />;
    };
    return SkinComponent;
  }

  
  
  if (theme.gaugeType === "quasar") {
    const SkinComponent: React.FC<GaugeProps> = (props) => {
      return <QuasarGauge {...props} theme={theme} />;
    };
    return SkinComponent;
  }
  if (theme.gaugeType === "ev-modern") {
    const SkinComponent: React.FC<GaugeProps> = (props) => {
      return <ModernEVGauge {...props} theme={theme} />;
    };
    return SkinComponent;
  }
  if (theme.gaugeType === "mechanic") {
    const SkinComponent: React.FC<GaugeProps> = (props) => {
      return <F1LCDGauge {...props} theme={theme} />;
    };
    return SkinComponent;
  }
  if (DETAILED_SKINS[theme.gaugeType]) {
    const DetailedSkin = DETAILED_SKINS[theme.gaugeType];
    const SkinComponent: React.FC<GaugeProps> = (props) => {
      return <DetailedSkin {...props} theme={theme} />;
    };
    return SkinComponent;
  }

  // Make 25% of the remaining gauge skins use the AggressiveRaceGauge
  if (index % 4 === 0) {
    const SkinComponent: React.FC<GaugeProps> = (props) => {
      return <AggressiveRaceGauge {...props} theme={theme} />;
    };
    return SkinComponent;
  }

  // Vary the layout slightly based on the theme index
  const SkinComponent: React.FC<GaugeProps> = (props) => {
    // Pass a layout variant to UnifiedTacticalGauge to make them look slightly different
    return (
      <UnifiedTacticalGauge
        {...props}
        theme={theme}
        layoutVariant={index % 4}
      />
    );
  };
  return SkinComponent;
});

export const GaugeDispatcher: React.FC<GaugeProps> = React.memo((props) => {
  const [manualSkinIndex, setManualSkinIndex] = React.useState<number | null>(
    null,
  );
  const themeIndex = THEMES.findIndex((t) => t.id === props.theme.id);
  const defaultSkinIndex = Math.max(0, themeIndex) % GAUGE_SKINS.length;

  const skinIndex =
    manualSkinIndex !== null ? manualSkinIndex : defaultSkinIndex;
  const CurrentGauge = GAUGE_SKINS[skinIndex];

  return (
    <div className="w-full h-full relative group/dispatcher bg-[#020202] overflow-hidden">
      <div className="absolute inset-0 bg-animated-grid opacity-20 pointer-events-none mix-blend-screen" />
      <div className="w-full h-full relative z-10">
        <CurrentGauge {...props} />
      </div>
      <div className="cyber-glare pointer-events-none z-[200]"></div>
    </div>
  );
});
