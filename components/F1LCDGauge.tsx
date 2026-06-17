import React from "react";
import { GaugeProps } from "./Gauge";

export const F1LCDGauge: React.FC<GaugeProps> = ({
  speed,
  gear,
  data,
  theme,
  size = 600,
  showDetails,
}) => {
  const rpm = data?.rpm ?? 0;
  const fuel = data?.fuelLevel ?? 100;

  const rpmPercent = Math.min((rpm / 8000) * 100, 100);

  const isMono = theme.id === "f1-lcd-racing-bw";
  const isBlueGreen = theme.id === "f1-lcd-tech-blue-green";
  const isOrange = theme.id === "f1-lcd-tech-orange";
  const isTintOrange =
    theme.id === "f1-lcd-tint-orange" || theme.id === "f1-lcd-neon-orange";
  const isTintBlue =
    theme.id === "f1-lcd-tint-blue" || theme.id === "f1-lcd-neon-blue";
  const isTintPurple =
    theme.id === "f1-lcd-tint-purple" || theme.id === "f1-lcd-neon-purple";

  // Real Monochrome LCD look with backlit color variants (very light/bright background, dark black-grey text/pixels)
  const lcdBg = isMono
    ? "#9eaba2"
    : isTintOrange
      ? "#cc4e00" // Deep rich amber magma orange-red
      : isTintBlue
        ? "#0251c2" // Rich cobalt ocean blue
        : isTintPurple
          ? "#8000cc" // Rich luxury imperial purple
          : isBlueGreen
            ? "#0a2a24"
            : isOrange
              ? "#2d1a05"
              : theme.primaryColor || "#8da899";

  const pixelActive =
    isMono || isTintOrange || isTintBlue || isTintPurple
      ? "#111613" // Elegant dark liquid crystal ink (grey/dark charcoal)
      : isBlueGreen
        ? "#4ade80"
        : isOrange
          ? "#f97316"
          : "#1a201c";

  const pixelInactive =
    isMono || isTintOrange || isTintBlue || isTintPurple
      ? "rgba(17, 22, 19, 0.08)" // Very subtle unlit segment ghosts
      : isBlueGreen
        ? "rgba(74, 222, 128, 0.05)"
        : isOrange
          ? "rgba(249, 115, 22, 0.05)"
          : "rgba(26, 32, 28, 0.08)";

  const glowClass = isBlueGreen
    ? "drop-shadow-[0_0_8px_#4ade80]"
    : isOrange
      ? "drop-shadow-[0_0_8px_#f97316]"
      : "";

  // Only the inverted dark themes are considered "isDarkTheme" (black BG, glowing green/orange text)
  const isDarkTheme = isBlueGreen || isOrange;
  const labelColor = isDarkTheme ? pixelActive : "#1a201c";
  const borderCol = isDarkTheme ? `${pixelActive}33` : "rgba(26, 32, 28, 0.3)";
  const borderStrong = isDarkTheme
    ? `${pixelActive}80`
    : "rgba(26, 32, 28, 0.5)";
  const bgSoft = isDarkTheme ? `${pixelActive}1a` : "rgba(26, 32, 28, 0.1)";

  const renderBarGauge = (
    label: string,
    value: number,
    max: number,
    inverted: boolean,
    unit: string,
    placeholder: string,
  ) => {
    const percent = Math.min((value / max) * 100, 100);
    const valRounded = Math.round(value);
    const valStr = String(valRounded);
    const valPadded = valStr.padStart(placeholder.length, "0");
    const offset = Math.max(0, placeholder.length - valStr.length);

    return (
      <div className="flex flex-col w-full h-[28cqh] justify-between">
        <div
          className={`flex justify-between items-end mb-[-4cqh] ${inverted ? "flex-row-reverse" : ""} z-10`}
        >
          <span className="text-[6cqh] font-black tracking-tighter opacity-80">
            {label}
          </span>
          <div
            className={`relative flex items-baseline ${inverted ? "justify-start" : "justify-end"} -mb-1 w-[20cqw]`}
          >
            <span
              className={`text-[16cqh] font-black tabular-nums tracking-tighter leading-none pb-1 w-full text-center ${glowClass}`}
            >
              <span style={{ color: pixelInactive }}>
                {valPadded.slice(0, offset)}
              </span>
              <span style={{ color: pixelActive }}>
                {valPadded.slice(offset)}
              </span>
            </span>
            {unit && (
              <span
                className="text-[5cqh] font-black opacity-80 ml-0.5 pb-1 shrink-0"
                style={{ color: pixelActive }}
              >
                {unit}
              </span>
            )}
          </div>
        </div>
        <div
          className={`w-full h-[7cqh] border-[5px] flex p-[3px] gap-[3px] items-end ${inverted ? "flex-row-reverse" : ""}`}
          style={{ borderColor: pixelActive }}
        >
          {[...Array(12)].map((_, i) => {
            const isActive = percent > (i / 12) * 100;
            const hPercent = 40 + (i / 11) * 60; // Start small and get bigger
            return (
              <div
                key={i}
                className={`flex-1 origin-bottom ${inverted ? "skew-x-[25deg]" : "skew-x-[-25deg]"}`}
                style={{
                  backgroundColor: isActive ? pixelActive : pixelInactive,
                  height: `${hPercent}%`,
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex items-center justify-center p-[1cqw] ${theme.fontFamily || "font-lcd"} rounded-[2cqw] border-[12px] border-[#151515] shadow-[inset_0_10px_40px_rgba(0,0,0,0.9),0_30px_60px_rgba(0,0,0,1)] ring-[6px] ring-[#2a2a2a] z-0 realistic-bezel`}
      style={{
        containerType: "size",
        backgroundColor: "#050505",
        color: labelColor,
      }}
    >
      <div
        className="w-full h-full relative p-[2cqw] rounded-[1cqw] overflow-hidden border-2 border-black/80 shadow-[inset_0_5px_30px_rgba(0,0,0,0.6)]"
        style={{ backgroundColor: lcdBg }}
      >
        {/* Backlight Surface Glow for depth */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at center, ${lcdBg} 0%, rgba(0,0,0,0.8) 100%)`,
            filter: "brightness(1.4)",
          }}
        />

        {/* LCD Grid Background (pixel matrix) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.08)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none z-10 mix-blend-overlay opacity-40" />

        {/* Scanning line effect */}
        <div className="absolute inset-x-0 h-[10cqh] bg-black/5 animate-[scan_6s_linear_infinite] pointer-events-none z-10" />

        {/* High-end instrumentation double glare reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-70 z-30 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.02)_100%)] pointer-events-none z-30 mix-blend-screen" />

        {/* LCD Ambient Light / Edge darkening */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-10 mix-blend-multiply" />

        <div className="flex flex-col w-full h-full relative z-20">
          {/* Top Shift Lights Bar in LCD Style */}
          <div
            className="w-full h-[8cqh] flex gap-1.5 mb-[2cqh] p-1.5 border-[4px] rounded-md items-end"
            style={{ borderColor: borderStrong, backgroundColor: bgSoft }}
          >
            {[...Array(20)].map((_, i) => {
              const isActive = rpmPercent > (i / 20) * 100;
              const hPercent = 30 + (i / 19) * 70;
              return (
                <div
                  key={i}
                  className="flex-1 skew-x-[-25deg] mx-[2px] transform origin-bottom border"
                  style={{
                    borderColor: `${pixelActive}15`,
                    backgroundColor: isActive ? pixelActive : pixelInactive,
                    height: `${hPercent}%`,
                  }}
                />
              );
            })}
          </div>

          <div className="flex-1 flex gap-[2cqw]">
            {/* Left Panel */}
            <div
              className="p-1.5 flex-[0.65] flex flex-col justify-between py-[1cqw] px-[1cqw] border-r-[3px]"
              style={{ borderRightColor: borderCol }}
            >
              {renderBarGauge(
                "OIL",
                data?.oilTemp || 210,
                300,
                false,
                "°F",
                "888",
              )}
              {renderBarGauge(
                "H2O",
                data?.coolantTemp || 190,
                250,
                false,
                "°F",
                "888",
              )}
              {renderBarGauge(
                "MAP",
                data?.engineLoad || 0,
                100,
                false,
                "%",
                "888",
              )}
            </div>

            {/* Center Panel (Speed/Gear/RPM) */}
            <div className="flex-[2.7] flex flex-col items-center justify-start relative">
              <div
                className="flex justify-between w-full mb-1 z-10 uppercase font-black opacity-90 border-b-[4px] pb-2 px-2"
                style={{ borderBottomColor: borderCol }}
              >
                <span className="text-[4.5cqh] tracking-tighter">
                  RACE MODE
                </span>
                <span
                  className="text-[4.5cqh] tracking-tighter px-3 py-1 rounded-[4px]"
                  style={{ color: lcdBg, backgroundColor: pixelActive }}
                >
                  DRS OK
                </span>
              </div>

              <div className="flex items-center justify-between w-full px-[1cqw] mt-4">
                <div className="flex flex-col items-start w-1/3">
                  <span className="text-[4cqh] font-black tracking-tighter opacity-70 uppercase mb-0 font-bebas">
                    SPEED
                  </span>
                  <div className="relative mt-[-2cqh] w-full">
                    {(() => {
                      const speedStr = String(Math.round(speed || 0));
                      const speedPadded = speedStr.padStart(3, "0");
                      const speedOffset = 3 - speedStr.length;
                      return (
                        <span
                          className={`text-[30cqh] font-black leading-none tabular-nums tracking-tighter relative z-10 text-center w-full block ${glowClass}`}
                        >
                          <span style={{ color: pixelInactive }}>
                            {speedPadded.slice(0, speedOffset)}
                          </span>
                          <span style={{ color: pixelActive }}>
                            {speedPadded.slice(speedOffset)}
                          </span>
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex flex-col items-center w-1/3">
                  <span className="text-[4cqh] font-black tracking-tighter opacity-70 uppercase mb-0">
                    GEAR
                  </span>
                  <div
                    className="relative border-[5px] rounded-xl px-3 py-1 pb-[2px] flex items-center justify-center min-w-[7.5cqw]"
                    style={{
                      borderColor: pixelActive,
                      backgroundColor: bgSoft,
                    }}
                  >
                    <span
                      className="absolute inset-0 text-[16cqh] font-black leading-none flex items-center justify-center tracking-tighter"
                      style={{ color: pixelInactive }}
                    >
                      8
                    </span>
                    <span
                      className={`text-[16cqh] font-black leading-none relative z-10 tracking-tighter ${glowClass}`}
                      style={{ color: pixelActive }}
                    >
                      {gear}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <div
                      className="border px-1 py-[1px] rounded"
                      style={{ borderColor: pixelActive }}
                    >
                      <span className="text-[1.8cqh] font-black leading-none block">
                        ERS
                      </span>
                    </div>
                    <div
                      className="border px-1 py-[1px] rounded"
                      style={{ borderColor: pixelActive }}
                    >
                      <span className="text-[1.8cqh] font-black leading-none block">
                        KERS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end w-1/3">
                  <span className="text-[4cqh] font-black tracking-tighter opacity-70 uppercase mb-0 font-bebas">
                    RPM
                  </span>
                  <div className="relative mt-[-2cqh] w-full">
                    {(() => {
                      const rpmStr = String(Math.round(rpm || 0));
                      const rpmPadded = rpmStr.padStart(4, "0");
                      const rpmOffset = 4 - rpmStr.length;
                      return (
                        <span
                          className={`text-[27cqh] font-black leading-none tabular-nums tracking-[-0.08em] relative z-10 text-center w-full block ${glowClass}`}
                        >
                          <span style={{ color: pixelInactive }}>
                            {rpmPadded.slice(0, rpmOffset)}
                          </span>
                          <span style={{ color: pixelActive }}>
                            {rpmPadded.slice(rpmOffset)}
                          </span>
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Bottom Center Telemetry Strip */}
              <div className="flex flex-col gap-1 mt-auto mb-[4cqh] w-full px-2">
                <div className="flex gap-[0.8cqw] w-full">
                  {[
                    { label: "BOOST", val: (data?.boost ?? 0.0).toFixed(1), unit: "PSI" },
                    { label: "LOAD", val: Math.round(data?.engineLoad ?? 0), unit: "%" },
                    { label: "THROT", val: Math.round(data?.throttlePos ?? 0), unit: "%" },
                    { label: "BATT", val: (data?.voltage ?? data?.batteryVolts ?? 12.4).toFixed(1), unit: "V" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center border-[1.5px] py-1"
                      style={{ borderColor: pixelActive }}
                    >
                      <span className="text-[2cqh] font-black opacity-70 text-center leading-none mb-1">
                        {item.label}
                      </span>
                      <span className="text-[4cqh] font-black tabular-nums">
                        {item.val}
                        {item.unit && (
                          <span className="text-[2.2cqh] ml-0.5 opacity-80">
                            {item.unit}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-[0.8cqw] w-full">
                  {[
                    { label: "FUEL", val: Math.round(data?.fuelLevel ?? 0), unit: "%" },
                    { label: "OIL_P", val: Math.round(data?.oilPressure ?? 0), unit: "PSI" },
                    { label: "OIL_T", val: Math.round(data?.oilTemp ?? 0), unit: "°C" },
                    { label: "H2O_T", val: Math.round(data?.coolantTemp ?? 0), unit: "°C" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center border-[1.5px] py-1"
                      style={{ borderColor: pixelActive }}
                    >
                      <span className="text-[2cqh] font-black opacity-70 text-center leading-none mb-1">
                        {item.label}
                      </span>
                      <span className="text-[4cqh] font-black tabular-nums">
                        {item.val}
                        {item.unit && (
                          <span className="text-[2.2cqh] ml-0.5 opacity-80">
                            {item.unit}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RPM Bar Graph at the bottom of center */}
              <div
                className="absolute bottom-[-2cqh] w-full h-[6cqh] border-[6px] border-b-0 rounded-t-xl flex p-[4px] pb-0 gap-[4px] items-end"
                style={{ borderColor: pixelActive }}
              >
                {[...Array(40)].map((_, i) => {
                  const isActive = rpmPercent > (i / 40) * 100;
                  const hPercent = 20 + (i / 39) * 80;
                  return (
                    <div
                      key={i}
                      className="flex-1 skew-x-[-20deg] transform origin-bottom border"
                      style={{
                        borderColor: `${pixelActive}15`,
                        backgroundColor: isActive ? pixelActive : pixelInactive,
                        height: `${hPercent}%`,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right Panel */}
            <div
              className="p-1.5 flex-[0.65] flex flex-col justify-between py-[1cqw] px-[1cqw] border-l-[3px]"
              style={{ borderLeftColor: borderCol }}
            >
              <div className="flex flex-col w-full h-[28cqh] justify-between">
                <div className="flex justify-between items-end mb-[-3cqh] flex-row-reverse z-10">
                  <span className="text-[6cqh] font-black tracking-tighter opacity-80">
                    LAP
                  </span>
                  <div className="relative flex items-baseline justify-start -mb-1">
                    <span
                      className="absolute left-0 text-[14cqh] font-black tabular-nums tracking-tighter leading-none"
                      style={{ color: pixelInactive }}
                    >
                      8:88.8
                    </span>
                    <span
                      className="text-[14cqh] font-black tabular-nums relative z-10 tracking-tighter leading-none pb-1"
                      style={{ color: pixelActive }}
                    >
                      1:24.3
                    </span>
                  </div>
                </div>
                <div
                  className="w-full h-[7cqh] border-[5px] flex p-[3px] gap-[3px] flex-row-reverse items-end"
                  style={{ borderColor: pixelActive }}
                >
                  {[...Array(12)].map((_, i) => {
                    const hPercent = 40 + (i / 11) * 60;
                    return (
                      <div
                        key={i}
                        className="flex-1 origin-bottom skew-x-[25deg]"
                        style={{
                          backgroundColor: i < 5 ? pixelActive : pixelInactive,
                          height: `${hPercent}%`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col w-full h-[28cqh] justify-between">
                <div className="flex justify-between items-end mb-[-3cqh] flex-row-reverse z-10">
                  <span className="text-[6cqh] font-black tracking-tighter opacity-80">
                    DELTA
                  </span>
                  <div className="relative flex items-baseline justify-start -mb-1">
                    <span
                      className="absolute left-0 text-[14cqh] font-black tabular-nums tracking-tighter leading-none"
                      style={{ color: pixelInactive }}
                    >
                      -8.88
                    </span>
                    <span
                      className="text-[14cqh] font-black tabular-nums relative z-10 tracking-tighter leading-none pb-1"
                      style={{ color: pixelActive }}
                    >
                      -0.21
                    </span>
                  </div>
                </div>
                <div
                  className="w-full h-[7cqh] border-[5px] flex p-[3px] gap-[3px] flex-row-reverse items-end"
                  style={{ borderColor: pixelActive }}
                >
                  {[...Array(12)].map((_, i) => {
                    const hPercent = 40 + (i / 11) * 60;
                    return (
                      <div
                        key={i}
                        className="flex-1 origin-bottom skew-x-[25deg]"
                        style={{
                          backgroundColor: i < 8 ? pixelActive : pixelInactive,
                          height: `${hPercent}%`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {renderBarGauge("FUEL", fuel || 100, 100, true, "%", "888")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
