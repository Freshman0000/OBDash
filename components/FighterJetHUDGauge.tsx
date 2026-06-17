import React from "react";
import { GaugeProps, ResponsiveValue, WarningLights } from "./Gauge";
import { Ticker } from "./Ticker";

export const FighterJetHUDGauge: React.FC<GaugeProps> = React.memo(
  ({ value, speed, gear, data, theme, backlit = false }) => {
    const rpmPercent = Math.min(100, (value / 9) * 100);
    const primaryColor = theme.primaryColor || "#00D2FF"; // Cyan Digital Blue
    const secondaryColor = theme.secondaryColor || "#001322";
    const accentColor = theme.accentColor || "#FF3B30"; // Warning red

    // Ticking/sliding offsets based on Speed and RPM for realistic tape animations
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
          backgroundColor: "#00040a",
          borderColor: `${primaryColor}40`,
          animation: value > 0 ? `cockpit-jitter ${Math.max(0.08, 1.2 - value * 0.15)}s infinite ease-in-out` : undefined,
        }}
      >
        {/* 3D Atmospheric Depth Wash to create cockpit depth */}
        <div
          className="absolute inset-x-[-10%] top-[-20%] bottom-[-25%] pointer-events-none z-0 opacity-15"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${primaryColor} 0%, transparent 65%)`,
          }}
        />
        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,50,100,0.4)_0%,transparent_80%)]" />

        {backlit && (
          <div
            className="absolute inset-0 backlit-surface pointer-events-none z-0"
            style={{ "--glow-color": primaryColor + "10" } as any}
          />
        )}

        {/* Flight CSS Animations */}
        <style>
          {`
            @keyframes flight-horizon {
               0% { transform: translateY(0.5cqh) rotate(0.4deg); }
               25% { transform: translateY(-1cqh) rotate(-0.5deg); }
               55% { transform: translateY(1.2cqh) rotate(0.8deg); }
               75% { transform: translateY(-0.6cqh) rotate(-0.7deg); }
               100% { transform: translateY(0.5cqh) rotate(0.4deg); }
            }
            @keyframes target-tracking {
               0% { top: 41%; left: 45%; transform: translate(-50%, -50%) scale(1); }
               20% { top: 43%; left: 53%; transform: translate(-50%, -50%) scale(1.08); }
               40% { top: 38%; left: 51%; transform: translate(-50%, -50%) scale(0.95); }
               60% { top: 45%; left: 47%; transform: translate(-50%, -50%) scale(1.15); }
               80% { top: 39%; left: 55%; transform: translate(-50%, -50%) scale(0.9); }
               100% { top: 41%; left: 45%; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes flight-grid {
               0% { background-position: 0px 0px; }
               100% { background-position: 100px 200px; }
            }
            @keyframes cockpit-jitter {
               0% { transform: translate(0, 0) rotate(0deg); }
               25% { transform: translate(-0.15cqh, 0.15cqh) rotate(-0.03deg); }
               50% { transform: translate(0.15cqh, -0.15cqh) rotate(0.03deg); }
               75% { transform: translate(-0.15cqh, -0.15cqh) rotate(-0.01deg); }
               100% { transform: translate(0, 0) rotate(0deg); }
            }
         `}
        </style>

        {/* 1. Tactical Avionics Radar Grid (Slides Infinitely for Flying Simulation) */}
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none z-0 mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(circle, ${primaryColor} 1px, transparent 1px), linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
            backgroundSize: "20cqw 20cqh, 4cqw 4cqh, 4cqw 4cqh",
            animation: `flight-grid ${speedVal > 0 ? Math.max(1.5, 20 - speedVal * 0.15) : 20}s linear infinite`,
          }}
        />

        {/* Canopy Glare Glass Reflection */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_40%,rgba(255,255,255,0.03)_100%)] pointer-events-none z-30" />
        <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-white/5 pointer-events-none z-30 rotate-12 blur-lg translate-x-12 opacity-40 mix-blend-overlay" />

        {/* Extreme border markings (cockpit HUD glass corners) */}
        <div
          className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 pointer-events-none z-10"
          style={{ borderColor: `${primaryColor}70` }}
        />
        <div
          className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 pointer-events-none z-10"
          style={{ borderColor: `${primaryColor}70` }}
        />
        <div
          className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 pointer-events-none z-10"
          style={{ borderColor: `${primaryColor}70` }}
        />
        <div
          className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 pointer-events-none z-10"
          style={{ borderColor: `${primaryColor}70` }}
        />

        {/* 2. Top Heading Tape (Compass Slider) */}
        <div
          className="absolute top-[2cqh] inset-x-[15cqw] h-[6cqh] border-b border-t flex flex-col items-center justify-center pointer-events-none z-20"
          style={{
            borderColor: `${primaryColor}50`,
            backgroundColor: "rgba(0, 4, 10, 0.7)",
          }}
        >
          {/* Center Lubber Line */}
          <div className="absolute top-0 w-[2px] h-full bg-red-500 z-30 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
          <div className="absolute -top-1 px-2 py-0.5 rounded text-[1.4cqh] font-bold text-red-500 bg-black border border-red-500/40 shadow-sm z-30">
            {String(heading).padStart(3, "0")}°
          </div>
          {/* Sliding Ribbon Numbers */}
          <div className="w-full h-full overflow-hidden relative flex items-center">
            <div
              className="absolute flex gap-[4cqw] items-center justify-center transition-all duration-300 ease-out text-[1.5cqh]"
              style={{
                transform: `translateX(calc(50% - ${heading * 0.4}cqw))`,
              }}
            >
              {Array.from({ length: 37 }).map((_, i) => {
                const deg = (i * 10) % 360;
                const label =
                  deg === 0
                    ? "N"
                    : deg === 90
                      ? "E"
                      : deg === 180
                        ? "S"
                        : deg === 270
                          ? "W"
                          : String(deg / 10).padStart(2, "0");
                const isCardinal = ["N", "E", "S", "W"].includes(label);
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center w-[4cqw] shrink-0"
                  >
                    <span
                      className={`font-black ${isCardinal ? "text-red-400 text-[1.6cqh]" : "opacity-70 text-[1.3cqh]"}`}
                      style={{ color: isCardinal ? undefined : primaryColor }}
                    >
                      {label}
                    </span>
                    <div
                      className="w-[1px] h-[6px] bg-current mt-0.5"
                      style={{ color: `${primaryColor}60` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Center Pitch Ladder & Horizon (Sways Elegantly to Simulate Flight Dynamics) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[45cqw] h-[40cqh] relative flex flex-col items-center justify-center opacity-75 animate-[flight-horizon_8s_ease-in-out_infinite]">
            {/* Horizon line */}
            <div
              className="w-full h-[2px] flex items-center justify-between"
              style={{ backgroundColor: `${primaryColor}40` }}
            >
              <div className="w-[12cqw] h-[2px] bg-red-500" />
              <div className="w-[20cqw]" /> {/* Gap for Flight Path Marker */}
              <div className="w-[12cqw] h-[2px] bg-red-500" />
            </div>
            {/* Standard pitch brackets */}
            {[-10, -5, 5, 10].map((pitch) => (
              <div
                key={pitch}
                className={`absolute w-[36cqw] flex items-center justify-between transition-transform duration-300`}
                style={{ transform: `translateY(${-pitch * 1.5}cqh)` }}
              >
                <span
                  className="text-[1.3cqh] font-bold"
                  style={{ color: primaryColor }}
                >
                  {pitch > 0 ? `+${pitch}` : pitch}
                </span>
                <div className="flex-1 flex justify-between mx-2">
                  <div
                    className={`w-[8cqw] h-[2px] ${pitch < 0 ? "border-t border-dashed" : "border-t"}`}
                    style={{ borderColor: primaryColor }}
                  />
                  <div className="w-[10cqw]" />
                  <div
                    className={`w-[8cqw] h-[2px] ${pitch < 0 ? "border-t border-dashed" : "border-t"}`}
                    style={{ borderColor: primaryColor }}
                  />
                </div>
                <span
                  className="text-[1.3cqh] font-bold"
                  style={{ color: primaryColor }}
                >
                  {pitch > 0 ? `+${pitch}` : pitch}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Active Flight Path Marker (Velocity Vector Indicator - Swaying in flying flow) */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[7cqh] h-[7cqh] flex items-center justify-center pointer-events-none z-10 animate-[flight-horizon_8s_ease-in-out_infinite_direction-reverse]">
          <div
            className="w-[1.8cqh] h-[1.8cqh] rounded-full border-2 bg-black/40"
            style={{
              borderColor: primaryColor,
              boxShadow: `0 0 12px ${primaryColor}60`,
            }}
          />
          <div
            className="w-[2.2cqh] h-[2px] absolute -left-[2.2cqh] top-1/2 -translate-y-1/2"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="w-[2.2cqh] h-[2px] absolute -right-[2.2cqh] top-1/2 -translate-y-1/2"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="w-[2px] h-[1.2cqh] absolute top-[-0.3cqh] left-1/2 -translate-x-1/2"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* 5. Target Lock-On Bracket (Reticle continuously tracks/scans targets to simulate flight computer locking system) */}
        <div
          className="absolute pointer-events-none z-20 animate-[target-tracking_10s_ease-in-out_infinite]"
          style={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className={`w-[11cqh] h-[11cqh] border border-dashed flex flex-col justify-between p-1 rounded bg-black/25 ${targetLocked ? "animate-[pulse_0.7s_infinite]" : "opacity-80"}`}
            style={{ borderColor: targetLocked ? "#FF3B30" : primaryColor }}
          >
            <div className="flex justify-between w-full h-[1cqh]">
              <div
                className="w-2.5 h-[2px] bg-current"
                style={{ color: targetLocked ? "#FF3B30" : primaryColor }}
              />
              <div
                className="w-2.5 h-[2px] bg-current"
                style={{ color: targetLocked ? "#FF3B30" : primaryColor }}
              />
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[1.3cqh] font-extrabold leading-none tracking-wider text-red-500 animate-pulse">
                {targetLocked ? "STT LOCK" : "SCANNING"}
              </span>
              <span
                className="text-[1cqh] font-bold opacity-90 mt-[1.5px]"
                style={{ color: primaryColor }}
              >
                {targetLocked ? "TRT: CORVETTE" : "SYS: ACQUIRING"}
              </span>
              <span className="text-[0.9cqh] font-bold text-slate-400 mt-[1px]">
                {targetLocked ? "RNG: 1.25NM" : "RNG: --.-NM"}
              </span>
            </div>

            <div className="flex justify-between w-full h-[1cqh]">
              <div
                className="w-2.5 h-[2px] bg-current"
                style={{ color: targetLocked ? "#FF3B30" : primaryColor }}
              />
              <div
                className="w-2.5 h-[2px] bg-current"
                style={{ color: targetLocked ? "#FF3B30" : primaryColor }}
              />
            </div>
          </div>
        </div>

        {/* 6. Airspeed Digital Tape (LEFT HUD TAPE) - SIGNIFICANTLY ENLARGED SPEED CONTAINER */}
        <div
          className="absolute left-[3cqw] top-[18cqh] w-[13cqw] h-[48cqh] border rounded flex pointer-events-none z-20 overflow-hidden bg-black/60 backdrop-blur-md animate-[flight-horizon_9s_ease-in-out_infinite]"
          style={{ borderColor: `${primaryColor}40` }}
        >
          {/* Tape numbers */}
          <div className="flex-1 h-full relative overflow-hidden">
            <div
              className="absolute inset-x-0 flex flex-col items-center justify-center transition-all duration-300 ease-out"
              style={{
                transform: `translateY(calc(50% - ${speedVal * 0.45}cqh))`,
              }}
            >
              {Array.from({ length: 42 }).map((_, idx) => {
                const sp = idx * 5;
                const isMajor = sp % 20 === 0;
                return (
                  <div
                    key={idx}
                    className="h-[2.25cqh] flex items-center justify-end w-full pr-[1.5cqw]"
                  >
                    {isMajor && (
                      <span
                        className="text-[1.4cqh] font-bold mr-2"
                        style={{ color: `${primaryColor}80` }}
                      >
                        {sp}
                      </span>
                    )}
                    <div
                      className={`h-[1px] bg-current ${isMajor ? "w-4" : "w-2"}`}
                      style={{ color: `${primaryColor}40` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {/* Main Readout Highlight box overlay - GIGANTIC SIZE SENSITIVE READOUT */}
          <div
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[22cqw] h-[17cqh] border-2 flex flex-col justify-center px-4 rounded-xl bg-gradient-to-b from-[#00081d] to-[#010206] z-30 shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
            style={{ borderColor: primaryColor }}
          >
            <span className="text-[1.3cqh] tracking-[0.2em] text-red-500 font-black border-b border-[#00D2FF]/20 pb-1 uppercase">
              CAS SPEED
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span
                className="text-[12cqh] font-black leading-none drop-shadow-[0_4px_15px_rgba(0,0,0,1)] text-white tabular-nums tracking-tighter"
                style={{ textShadow: `0 0 25px ${primaryColor}` }}
              >
                {speedVal}
              </span>
              <span className="text-[2.2cqh] font-black tracking-widest text-red-500 animate-pulse">
                MPH
              </span>
            </div>
          </div>
        </div>

        {/* 7. Thrust/RPM & Altitude HUD Tapes (RIGHT HUD TAPES) - Symmetrical configuration representing giant RPM */}
        <div
          className="absolute right-[3cqw] top-[18cqh] w-[13cqw] h-[48cqh] border rounded flex flex-row-reverse pointer-events-none z-20 overflow-hidden bg-black/60 backdrop-blur-md animate-[flight-horizon_9s_ease-in-out_infinite_direction-reverse]"
          style={{ borderColor: `${primaryColor}40` }}
        >
          {/* Altitude numbers */}
          <div className="flex-1 h-full relative overflow-hidden">
            <div
              className="absolute inset-x-0 flex flex-col items-center justify-center transition-all duration-300 ease-out"
              style={{
                transform: `translateY(calc(50% - ${altitude * 0.05}cqh))`,
              }}
            >
              {Array.from({ length: 25 }).map((_, idx) => {
                const altValue = idx * 500;
                const isMajor = altValue % 2000 === 0;
                return (
                  <div
                    key={idx}
                    className="h-[2.25cqh] flex items-center justify-start w-full pl-[1.5cqw]"
                  >
                    <div
                      className={`h-[1px] bg-current ${isMajor ? "w-4" : "w-2"}`}
                      style={{ color: `${primaryColor}40` }}
                    />
                    {isMajor && (
                      <span
                        className="text-[1.3cqh] font-bold ml-2"
                        style={{ color: `${primaryColor}80` }}
                      >
                        {altValue}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Symmetrical Giant ENG THRUST display */}
          <div
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[22cqw] h-[17cqh] border-2 flex flex-col justify-center px-4 rounded-xl bg-gradient-to-b from-[#00081d] to-[#010206] z-30 shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
            style={{ borderColor: primaryColor }}
          >
            <span className="text-[1.3cqh] tracking-[0.2em] text-red-500 font-black border-b border-[#00D2FF]/20 pb-1 uppercase">
              ENG REV
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span
                className="text-[12cqh] font-black leading-none drop-shadow-[0_4px_15px_rgba(0,0,0,1)] text-white tabular-nums tracking-tighter"
                style={{ textShadow: `0 0 25px ${primaryColor}` }}
              >
                {rpmVal}
              </span>
              <span
                className="text-[2.2cqh] font-black tracking-widest text-[#FF3B30] animate-pulse"
              >
                RPM
              </span>
            </div>
          </div>
        </div>

        {/* 7.5. Dynamic Altitude Glass Readout Header (Placed Symmetrically above RPM box so altitude remains fully active) */}
        <div
          className="absolute right-2 top-[5cqh] w-[21cqw] h-[7.5cqh] border flex flex-col justify-center px-3 rounded-lg bg-[#000511]/85 z-30 shadow-lg animate-[flight-horizon_9s_ease-in-out_infinite]"
          style={{ borderColor: `${primaryColor}60` }}
        >
          <span className="text-[1.1cqh] tracking-widest text-slate-400 font-black uppercase">
            ALTITUDE
          </span>
          <span
            className="text-[3cqh] font-black text-white leading-none tabular-nums mt-0.5"
            style={{ textShadow: `0 0 10px ${primaryColor}` }}
          >
            {altitude}{" "}
            <span className="text-[1.3cqh] text-red-400 font-extrabold animate-pulse">
              FT
            </span>
          </span>
        </div>

        {/* 8. Modern F-35 Tactical Cockpit HUD Header Status - ENLARGED RPM / FLIGHT STATE */}
        <div className="h-[9cqh] flex items-center justify-between px-[2.5cqw] border-b border-[#00D2FF]/20 relative z-40 bg-black/70 shrink-0 shadow-md backdrop-blur-md rounded-t">
          <div className="flex items-center gap-[1.5cqw]">
            <div
              className="w-[1.2cqh] h-[1.2cqh] rounded-sm animate-pulse"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}`,
              }}
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-[1.8cqh] tracking-[0.4em] text-white">
                PANORAMIC TACTICAL HUD [RAPTOR_V2]
              </span>
              <span
                className="text-[1cqh] tracking-[0.15em] opacity-80"
                style={{ color: primaryColor }}
              >
                AIRCRAFT ID: F-35B LIGHTNING II // SYSTEM: ARMED
              </span>
            </div>
          </div>

          {/* Center Flight Status readouts with ENLARGED RPM Percent readout */}
          <div className="flex gap-[3.5cqw] items-center text-[1.6cqh]">
            <span style={{ color: primaryColor }}>
              G-FORCE: <b className="text-white text-[1.9cqh]">{gForce}G</b>
            </span>
            <span style={{ color: primaryColor }}>
              AoA: <b className="text-white text-[1.9cqh]">{angleOfAttack}°</b>
            </span>
            <span style={{ color: primaryColor }}>
              ROTOR_RPM:{" "}
              <b className="text-[#FF3B30] text-[2.4cqh] tracking-tight">
                {Math.round(rpmPercent)}%
              </b>
            </span>
          </div>

          {/* Transflective gear selection indicator panel */}
          <div className="flex items-center gap-[1cqw] bg-black/60 px-3 py-1 rounded border border-white/5">
            {["P", "R", "N", "D", "S", "M"].map((g) => (
              <div
                key={g}
                className={`text-[2.2cqh] font-black transition-all duration-300 leading-none ${gear === g ? "scale-125 drop-shadow-[0_0_10px_#FF3B30]" : "opacity-30"}`}
                style={{ color: gear === g ? "#FF3B30" : primaryColor }}
              >
                {g}
              </div>
            ))}
          </div>
        </div>

        {/* 9. Avionics Side-Bento Boxes showing PIDs (ENLARGED 1.6x MULTIPLIER FOR HIGHEST LEGIBLITY) */}
        <div className="flex-1 flex relative z-40 min-h-0 items-end justify-between p-[1.5cqw] pb-[1cqh]">
          {/* LEFT RADAR SIDEBAR PANEL: 4 Pids - ENLARGED FONT SIZE & RAISED CONTAINER */}
          <div className="w-[30%] flex flex-col gap-[1cqh] p-[1.8cqw] rounded bg-black/80 border border-[#00D2FF]/30 shadow-[0_8px_25px_rgba(0,0,0,0.8)] h-[29cqh] backdrop-blur-md">
            <span className="text-[1.2cqh] tracking-widest text-[#FF3B30] font-bold border-b border-white/10 pb-[4px] block mb-[0.4cqh] uppercase">
              LEFT AVIONICS BUS [PIDs]
            </span>
            <div className="flex-1 flex flex-col justify-between py-1">
              {[
                {
                  label: "INTAKE T",
                  val: Math.round(
                    data?.intakeTemp || data?.intakeAirTemp || 28,
                  ),
                  unit: "°C",
                  color: primaryColor,
                },
                {
                  label: "ENG LOAD",
                  val: Math.round(data?.engineLoad || 0),
                  unit: "%",
                  color: "#FF3B30",
                },
                {
                  label: "BATTERY",
                  val: (data?.voltage || data?.batteryVolts || 13.8).toFixed(1),
                  unit: "V",
                  color: primaryColor,
                },
                {
                  label: "OIL PRES",
                  val: Math.round(data?.oilPressure || 45),
                  unit: "PSI",
                  color: primaryColor,
                },
              ].map((pid, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-[1.65cqh] border-b border-white/5 py-[3px]"
                >
                  <span
                    className="opacity-80 font-bold tracking-wide uppercase"
                    style={{ color: primaryColor }}
                  >
                    {pid.label}
                  </span>
                  <span
                    className="font-black leading-none text-right text-white drop-shadow-[0_0_5px_currentColor]"
                    style={{ color: pid.color }}
                  >
                    {pid.val}{" "}
                    <span className="text-[1.3cqh] opacity-60 font-bold ml-0.5">
                      {pid.unit}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Master Status center cockpit messages */}
          <div className="flex-1 flex flex-col items-center justify-end px-[2cqw] gap-[0.5cqh] h-full pointer-events-none pb-[0.5cqh]">
            <div className="flex items-center gap-2 bg-black/80 border border-[#00D2FF]/30 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
              <span className="text-[1.3cqh] font-extrabold text-[#00D2FF] animate-pulse">
                LND SCANNER STATUS: PASS
              </span>
            </div>
            <WarningLights
              data={data}
              className="scale-110 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* RIGHT RADAR SIDEBAR PANEL: 4 Pids - ENLARGED FONT SIZE & RAISED CONTAINER */}
          <div className="w-[30%] flex flex-col gap-[1cqh] p-[1.8cqw] rounded bg-black/80 border border-[#00D2FF]/30 shadow-[0_8px_25px_rgba(0,0,0,0.8)] h-[29cqh] backdrop-blur-md">
            <span className="text-[1.2cqh] tracking-widest text-[#FF3B30] font-bold border-b border-white/10 pb-[4px] block mb-[0.4cqh] uppercase text-right">
              RIGHT AVIONICS BUS [PIDs]
            </span>
            <div className="flex-1 flex flex-col justify-between py-1">
              {[
                {
                  label: "COOLANT",
                  val: Math.round(data?.coolantTemp || 92),
                  unit: "°C",
                  color: primaryColor,
                },
                {
                  label: "OIL TEMP",
                  val: Math.round(data?.oilTemp || 98),
                  unit: "°C",
                  color: primaryColor,
                },
                {
                  label: "FUEL LVL",
                  val: Math.round(data?.fuelLevel || 100),
                  unit: "%",
                  color: primaryColor,
                },
                {
                  label: "TURBO BOOST",
                  val: (data?.boost || 0.0).toFixed(1),
                  unit: "PSI",
                  color: "#FF3B30",
                },
              ].map((pid, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-[1.65cqh] border-b border-white/5 py-[3px]"
                >
                  <span
                    className="opacity-80 font-bold tracking-wide uppercase"
                    style={{ color: primaryColor }}
                  >
                    {pid.label}
                  </span>
                  <span
                    className="font-black leading-none text-right text-white drop-shadow-[0_0_5px_currentColor]"
                    style={{ color: pid.color }}
                  >
                    {pid.val}{" "}
                    <span className="text-[1.3cqh] opacity-60 font-bold ml-0.5">
                      {pid.unit}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 10. Sliding alert feed strip (avionics scroll) */}
        <div className="h-[4cqh] w-full border-t border-[#00D2FF]/20 relative z-50 bg-black/90 rounded-b mt-1">
          <Ticker
            data={data}
            theme={theme}
            className="w-full h-full text-[1.4cqh] text-red-400 font-mono"
          />
        </div>
      </div>
    );
  },
);
