import { Ticker } from "./Ticker";
import React, { useEffect, useRef } from "react";
import { GaugeProps, HorizontalBarGauge } from "./Gauge";
import { Activity, Zap, Thermometer, Wind, Droplets } from "lucide-react";

export const FuturisticGraphGauge: React.FC<
  GaugeProps & { customTitle?: string }
> = React.memo(({ value, speed, gear, data, navState, theme, customTitle }) => {
  const currentRpm = data?.rpm ?? value * 1000;
  const rpmDisplayValue = Math.min(9999, Math.round(currentRpm));
  const maxRpm = Math.max(8000, theme.maxRpm || 8000);
  const rpmPercent = Math.min(100, (currentRpm / maxRpm) * 100);
  const fuel = data?.fuelLevel ?? 100;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<{ rpm: number; speed: number; load: number }[]>([]);

  useEffect(() => {
    let animationFrameId: number;
    let lastDrawTime = performance.now();

    const drawLine = (
      ctx: CanvasRenderingContext2D,
      points: number[],
      color: string,
      height: number,
      width: number,
      yOffset: number,
      scale: number,
      fillGlow: boolean = false,
    ) => {
      if (points.length < 2) return;
      ctx.beginPath();
      const step = width / (points.length - 1);

      for (let i = 0; i < points.length; i++) {
        const x = i * step;
        const y = yOffset + height - points[i] * scale * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      if (fillGlow) {
        ctx.lineTo(width, yOffset + height);
        ctx.lineTo(0, yOffset + height);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, yOffset, 0, yOffset + height);
        grad.addColorStop(
          0,
          color.replace(")", ", 0.4)").replace("rgb", "rgba"),
        );
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();
      }
    };

    const render = () => {
      const now = performance.now();
      if (now - lastDrawTime > 30) {
        lastDrawTime = now;
        const hist = historyRef.current;
        hist.push({
          rpm: currentRpm / maxRpm,
          speed: speed / 160,
          load: (data?.engineLoad || 0) / 100,
        });
        if (hist.length > 100) hist.shift();

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            // Draw 3D Perspective Grid
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            // Horizontal lines (perspective)
            for (let i = 0; i <= 10; i++) {
              const y = height - Math.pow(i / 10, 2) * height; // Non-linear spacing for depth
              ctx.moveTo(0, y);
              ctx.lineTo(width, y);
            }

            // Vertical lines (perspective)
            const numVerticals = 20;
            const horizonY = 0; // vanishing point height
            for (let i = 0; i <= numVerticals; i++) {
              const xBase = (width / numVerticals) * i;
              // Lines converge towards center top
              const centerX = width / 2;
              ctx.moveTo(centerX, horizonY);
              ctx.lineTo(xBase, height);
            }
            ctx.stroke();

            const rpmPoints = hist.map((h) => h.rpm);
            const speedPoints = hist.map((h) => h.speed);
            const loadPoints = hist.map((h) => h.load);

            const primaryHtml = theme.primaryColor || "#0ea5e9";
            const accentHtml = theme.accentColor || "#ff0055";

            // Helper to safely convert hex to RGB
            const hexToRgbStr = (hex: string) => {
              let c = hex.substring(1);
              if (c.length === 3)
                c = c
                  .split("")
                  .map((x) => x + x)
                  .join("");
              return `rgb(${parseInt(c.slice(0, 2), 16)}, ${parseInt(c.slice(2, 4), 16)}, ${parseInt(c.slice(4, 6), 16)})`;
            };

            const primaryRgb = hexToRgbStr(primaryHtml);
            const accentRgb = hexToRgbStr(accentHtml);

            drawLine(ctx, loadPoints, "rgb(16, 185, 129)", height, width, 0, 1);
            drawLine(ctx, speedPoints, accentRgb, height, width, 0, 1);
            drawLine(ctx, rpmPoints, primaryRgb, height, width, 0, 1, true);
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentRpm, speed, maxRpm, data?.engineLoad, theme.primaryColor]);

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

  return (
    <div
      className={`w-full h-full p-[2cqh] flex flex-col relative overflow-hidden rounded-[2cqw] border-4 border-[#121212] border-t-[#222] border-b-[#050505] shadow-[inset_0_20px_60px_rgba(0,0,0,0.9),inset_0_-10px_20px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,1)] transition-none ${theme.overlay ? "brightness-110 contrast-125" : ""}`}
      style={{
        containerType: "size",
        backgroundColor: theme.backgroundColor || "#040406",
        zIndex: 0,
      }}
    >
      <div
        className={`absolute inset-0 mix-blend-screen opacity-100 z-0 transition-none ${getBgClass()}`}
      />

      {/* Outer Bezel Rim */}
      <div className="absolute inset-x-[0.5cqw] inset-y-[1cqh] border border-white/40 rounded-[1.5cqw] pointer-events-none z-10 mix-blend-overlay shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]" />

      {/* Deep Structural Background */}
      <div className="absolute inset-x-[15%] inset-y-0 opacity-30 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] filter blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.95)_100%)] z-0 pointer-events-none" />

      {/* 3D Wireframe / Circuit Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3cqw_3cqh] z-0 pointer-events-none transform perspective-1000 rotateX-[30deg] scale-150 transform-origin-bottom opacity-70" />
      <div className="absolute inset-0 opacity-75 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSI0OSIgdmlld0JveD0iMCAwIDI4IDQ5Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwb2x5Z29uIHBvaW50cz0iMTQgMCAyOCA4IDI4IDI0IDE0IDMyIDAgMjQgMCA4IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjE1IiBzdHJva2Utd2lkdGg9IjEiLz48cG9seWdvbiBwb2ludHM9IjE0IDQ5IDI4IDQxIDI4IDI0IDE0IDMyIDAgMjQgMCA0MSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] bg-[length:40px_70px] pointer-events-none mix-blend-overlay" />

      {/* Header */}
      <div className="flex justify-between items-center z-10 w-full px-[4cqw] py-[1.2cqh] border-y border-white/30 bg-gradient-to-r from-transparent via-[#111] to-transparent backdrop-blur-xl mb-[2cqh] shadow-[0_5px_25px_rgba(0,0,0,0.8),inset_0_1px_5px_rgba(255,255,255,0.05)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_2px,transparent_2px,transparent_6px)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-200" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_12px_rgba(239,68,68,1)] border border-white/40" />
          <span
            className={`text-[1.8cqh] ${pidFontClass} tracking-[0.6em] text-white/80 uppercase drop-shadow-[0_2px_4px_black]`}
          >
            {customTitle || "TELEMETRY OVERWATCH"}
          </span>
        </div>
        <div className="flex flex-col items-end relative z-10">
          <div
            className={`text-[1.6cqh] ${pidFontClass} tracking-[0.3em] font-bold`}
            style={{
              color: theme.secondaryColor || "#10b981",
              textShadow: `0 0 8px ${theme.secondaryColor || "#10b981"}88`,
            }}
          >
            LIVE FEED SECURE
          </div>
        </div>
      </div>

      {/* Middle section containing Graph and Main values */}
      <div className="flex-1 flex gap-[3cqw] relative z-10 px-[2cqw]">
        {/* Speed and Main Stats - Left Side */}
        <div className="flex-[1.2] flex flex-col gap-[2cqh]">
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-[2cqw] ring-1 ring-white/10 bg-black/40 backdrop-blur-xl transition-none shadow-2xl min-h-[45%]">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            <span
              className={`text-[2.2cqh] ${pidFontClass} tracking-[0.5em] text-white/40 mb-2 uppercase`}
            >
              VELOCITY_CORE
            </span>
            <div className="flex items-baseline gap-2 z-10 transition-none">
              <span
                className={`text-[22cqh] ${mainFontClass} tabular-nums leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-none`}
              >
                {Math.round(speed)}
              </span>
              <div className="flex flex-col items-start transition-none">
                <span
                  className={`text-[3cqh] font-black italic tracking-widest transition-none`}
                  style={{ color: theme.accentColor }}
                >
                  MPH
                </span>
                <div className="w-[10cqw] h-[1px] bg-gradient-to-r from-white to-transparent" />
              </div>
            </div>
          </div>

          <div className="h-[22cqh] flex flex-col justify-end p-[2cqh] bg-black/30 rounded-[1.5cqw] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-30">
              <Droplets size="2cqh" style={{ color: theme.primaryColor }} />
            </div>
            <HorizontalBarGauge
              value={fuel}
              color={theme.primaryColor}
              label="ENERGY_STORAGE"
            />
          </div>
        </div>

        {/* Real-time Graph Box - Center */}
        <div className="flex-[2] relative rounded-[2cqw] border border-white/10 bg-[#020202]/60 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="absolute top-[2cqh] right-[2cqw] flex flex-col gap-[0.5cqh] z-20">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-[2px]"
                style={{
                  color: theme.primaryColor,
                  backgroundColor: theme.primaryColor,
                }}
              />
              <span
                className={`text-[1cqh] font-black tracking-[0.3em] text-white/50 uppercase`}
              >
                FREQ_TRC_1
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-[2px]"
                style={{
                  color: theme.accentColor,
                  backgroundColor: theme.accentColor,
                }}
              />
              <span
                className={`text-[1cqh] font-black tracking-[0.3em] text-white/50 uppercase`}
              >
                SPD_MTR_X
              </span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-full mix-blend-screen opacity-100 relative z-0"
          />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
        </div>

        {/* RPM and Performance - Right Side */}
        <div className="flex-[1.2] flex flex-col gap-[2cqh]">
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-[2cqw] ring-1 ring-white/10 bg-black/40 backdrop-blur-xl shadow-2xl min-h-[45%]">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            <span
              className={`text-[2.2cqh] ${pidFontClass} tracking-[0.5em] text-white/40 mb-2 uppercase`}
            >
              FREQUENCY_LOAD
            </span>
            <div className="flex items-baseline gap-1 z-10 w-full justify-center">
              <span
                className={`text-[14cqh] font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_20px_${theme.primaryColor}]`}
              >
                {rpmDisplayValue}
              </span>
            </div>
            {/* Radial RPM Progress */}
            <div className="absolute bottom-[2cqh] w-[60%] h-[1.5cqh] bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${rpmPercent}%`,
                  backgroundColor: theme.primaryColor,
                  boxShadow: `0 0 15px ${theme.primaryColor}`,
                }}
              />
            </div>
          </div>

          <div className="h-[22cqh] grid grid-cols-2 gap-[1.5cqh]">
            {[
              {
                label: "TEMP_K",
                val: Math.round(data?.coolantTemp || 0),
                unit: "C",
                color: theme.secondaryColor,
              },
              {
                label: "LOAD_FACTOR",
                val: Math.round(data?.engineLoad || 0),
                unit: "%",
                color: theme.accentColor,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-black/40 rounded-[1cqw] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden p-2 group"
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[1.2cqh] font-black text-white/30 tracking-[0.2em] uppercase mb-1">
                  {item.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[4.5cqh] font-black tabular-nums text-white">
                    {item.val}
                  </span>
                  <span className="text-[1.5cqh] font-bold text-white/40">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom PIDs */}
      <div className="h-[20cqh] mt-[2cqh] flex justify-center gap-[1.5cqw] z-10 w-full relative px-[2cqw] pb-[1cqh]">
        {[
          {
            label: "BOOST_PRESSURE",
            val: (data?.boost || 0).toFixed(1),
            unit: "PSI",
            color: theme.primaryColor || "#0ea5e9",
            icon: Zap,
          },
          {
            label: "COOLANT_TEMP",
            val: `${Math.round(data?.coolantTemp || 0)}`,
            unit: "°C",
            color: theme.secondaryColor || "#38bdf8",
            icon: Thermometer,
          },
          {
            label: "ENGINE_LOAD",
            val: `${Math.round(data?.engineLoad || 0)}`,
            unit: "%",
            color: theme.accentColor || "#10b981",
            icon: Activity,
          },
          {
            label: "OIL_PRESS",
            val: `${Math.round(data?.oilPressure || 0)}`,
            unit: "PSI",
            color: theme.primaryColor || "#fff",
            icon: Droplets,
          },
          {
            label: "BATTERY_VOLT",
            val: `${(data?.batteryVolts || 12.4).toFixed(1)}`,
            unit: "V",
            color: theme.secondaryColor || "#ccc",
            icon: Zap,
          },
          {
            label: "INTAKE_AIR",
            val: `${Math.round(data?.intakeAirTemp || 0)}`,
            unit: "°C",
            color: theme.primaryColor || "#0ea5e9",
            icon: Wind,
          },
          {
            label: "FUEL_LVL",
            val: `${Math.round(data?.fuelLevel || 100)}`,
            unit: "%",
            color: theme.secondaryColor || "#38bdf8",
            icon: Droplets,
          },
          {
            label: "AFR_COM",
            val: `14.7`,
            unit: ":1",
            color: theme.accentColor || "#ff0055",
            icon: Droplets,
          },
        ].map((pid, idx) => (
          <div
            key={idx}
            className="flex-1 bg-transparent backdrop-blur-md border border-white/30 rounded-[1cqw] p-[1cqw] relative overflow-hidden group flex flex-col justify-between items-center text-center"
          >
            <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none mix-blend-screen" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-300 transition-opacity pointer-events-none" />

            <div className="flex justify-center items-center gap-1 z-10 border-b border-white/30 pb-1 mb-1 w-full">
              <span
                className={`text-[1.8cqh] ${pidFontClass} text-white/80 tracking-[0.2em] uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,1)] truncate`}
              >
                {pid.label}
              </span>
              <pid.icon
                size="1.8cqh"
                style={{ color: pid.color }}
                className={`opacity-90 drop-shadow-[0_0_8px_currentColor] shrink-0 hidden md:block`}
              />
            </div>

            <div className="flex items-baseline gap-1 mt-auto z-10 w-full justify-center">
              <span
                className={`text-[4.5cqh] leading-none ${mainFontClass} drop-shadow-[0_2px_5px_rgba(0,0,0,1)] transition-none group-hover:brightness-125 text-white`}
                style={{ textShadow: `0 0 10px ${pid.color}` }}
              >
                {pid.val}
              </span>
              <span
                className={`text-[1.8cqh] font-black text-white/70 tracking-widest drop-shadow-[0_2px_5px_rgba(0,0,0,1)]`}
              >
                {pid.unit}
              </span>
            </div>
            {/* Underglow bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[4px] opacity-300 shadow-[0_-2px_15px_currentColor]"
              style={{ backgroundColor: pid.color, color: pid.color }}
            />
          </div>
        ))}
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
});
