import React, { useState, useEffect, useRef } from "react";
import { 
  Play, RotateCcw, AlertTriangle, Cpu, Terminal, ShieldCheck, 
  Search, ExternalLink, MessageSquare, Car, Music, ArrowRight,
  Sun, User, RefreshCw, X, ArrowLeft, Send, ArrowRight as RightIcon,
  Sparkles, CheckCircle2, Navigation as NavIcon, Eye, Radio,
  Tv, Volume2, Gamepad2, Wifi, Compass
} from "lucide-react";
import { ThemeConfig, VehicleData, NavigationState } from "../types";

interface AppLauncherProps {
  theme: ThemeConfig;
  vehicleData: VehicleData | null;
  onNavigateToPage: (page: string) => void;
  isSimulating: boolean;
  onToggleSimulation: (val: boolean) => void;
}

interface AppItem {
  id: string;
  name: string;
  category: "utility" | "media" | "diagnostics" | " entertainment";
  icon: React.ReactNode;
  color: string;
  textColor: string;
  description: string;
  badge?: string;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({ 
  theme, 
  vehicleData, 
  onNavigateToPage,
  isSimulating,
  onToggleSimulation
}) => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  // Audio Synth for retro sound effects
  const playPulseSound = (freq: number = 440, duration: number = 0.08, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  };

  const apps: AppItem[] = [
    {
      id: "racer",
      name: "RETRO OUTRUNNER",
      category: " entertainment",
      icon: <Gamepad2 size={28} />,
      color: "from-pink-500 via-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(236,72,153,0.3)]",
      textColor: "text-pink-400",
      description: "Interactive arcade-style dashboard racer game using steering",
      badge: "PLAY NOW"
    },
    {
      id: "diagnostics",
      name: "ECU DIAGNOSTICS",
      category: "diagnostics",
      icon: <Cpu size={28} />,
      color: "from-emerald-500 via-teal-600 to-cyan-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      textColor: "text-emerald-400",
      description: "Deep scanner for DTC codes, clear malfunction lights",
      badge: "OBD3"
    },
    {
      id: "media_hub",
      name: "STEREO COMPANION",
      category: "media",
      icon: <Music size={28} />,
      color: "from-sky-500 via-blue-600 to-purple-600 shadow-[0_0_20px_rgba(14,165,233,0.3)]",
      textColor: "text-sky-400",
      description: "Infotainment virtual media deck and radio tuner player"
    },
    {
      id: "browser",
      name: "CAR WEB PORTAL",
      category: "utility",
      icon: <Tv size={28} />,
      color: "from-amber-500 via-orange-600 to-red-600 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      textColor: "text-amber-400",
      description: "Simulated Web deck with YouTube and CarPlay presets"
    },
    {
      id: "copilot",
      name: "CO-PILOT AI",
      category: "utility",
      icon: <MessageSquare size={28} />,
      color: "from-indigo-500 via-blue-600 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]",
      textColor: "text-indigo-400",
      description: "Interact with the onboard Antigravity telemetry assistant",
      badge: "LIVE"
    },
    {
      id: "backup_cam",
      name: "SAFETY REAR CAM",
      category: "utility",
      icon: <Eye size={28} />,
      color: "from-neutral-700 via-neutral-800 to-neutral-900 shadow-[0_0_20px_rgba(255,255,255,0.05)]",
      textColor: "text-neutral-300",
      description: "Simulate backup reverse assist radar with path distance guidelines"
    }
  ];

  const renderAppContent = () => {
    switch (activeApp) {
      case "racer":
        return <RetroRacerGame theme={theme} playSound={playPulseSound} vehicleData={vehicleData} />;
      case "diagnostics":
        return <EcuScanner theme={theme} playSound={playPulseSound} vehicleData={vehicleData} />;
      case "media_hub":
        return <MediaHub theme={theme} playSound={playPulseSound} />;
      case "browser":
        return <WebBrowserSimulator theme={theme} playSound={playPulseSound} />;
      case "copilot":
        return <CopilotAi theme={theme} playSound={playPulseSound} vehicleData={vehicleData} />;
      case "backup_cam":
        return <BackupCam theme={theme} playSound={playPulseSound} vehicleData={vehicleData} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black text-white p-4 lg:p-8 overflow-y-auto font-tech">
      {activeApp ? (
        <div className="flex-1 flex flex-col justify-start relative animate-in fade-in zoom-in-95 duration-200">
          <div className="h-[60px] flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <button 
              onClick={() => {
                playPulseSound(300, 0.1, "triangle");
                setActiveApp(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              <ArrowLeft size={16} /> BACK_TO_MENU
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                APP_CONTAINER_LIVE
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-[#06060c] border border-white/10 rounded-futuristic overflow-hidden relative">
            {renderAppContent()}
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-[1400px] mx-auto w-full flex flex-col justify-start pb-24">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
            <div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase text-white/90">
                SYSTEM_APP_LAUNCHER
              </h2>
              <p className="text-xs lg:text-sm text-gray-500 mt-1 uppercase tracking-widest">
                Interactive companion modules & head-unit applications
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="block text-[10px] text-gray-500 uppercase font-black tracking-widest">CONNECTED_VEHICLE</span>
                <span className="block text-xs font-bold text-sky-400 font-mono">OBD_ACTIVE_NODE</span>
              </div>
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
                <Wifi size={20} className="animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  playPulseSound(587.33, 0.08, "sine");
                  setActiveApp(app.id);
                }}
                className="group flex flex-col justify-between p-6 rounded-futuristic bg-[#0c0d12]/50 hover:bg-[#141520]/80 border border-white/10 hover:border-white/20 hover:scale-[1.02] shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.8)] transition-all duration-300 pointer-events-auto text-left relative overflow-hidden h-[180px]"
              >
                {/* Visual hover grid texture */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20" />
                
                {/* Decorative glow corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${app.color} opacity-5 blur-xl group-hover:opacity-15 transition-all`} />

                <div className="w-full flex items-start justify-between">
                  <div className={`p-4 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center text-white`}>
                    {app.icon}
                  </div>
                  {app.badge && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 border border-white/20 text-white/90 px-3 py-1 rounded-full px-2.5">
                      {app.badge}
                    </span>
                  )}
                </div>

                <div className="w-full mt-4">
                  <h3 className={`text-lg font-black tracking-tight uppercase group-hover:translate-x-1 duration-300 ${app.textColor}`}>
                    {app.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 h-8 leading-snug">
                    {app.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 glass-panel p-6 rounded-futuristic border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shrink-0">
                <Compass size={24} className="animate-[spin_4s_linear_infinite]" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase text-white tracking-wider">ECO_SYSTEM_DIAGNOSTICS</h4>
                <p className="text-xs text-gray-400">All applications running containerized on vehicle head unit. Supports direct engine PID communication.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                playPulseSound(430, 0.1, "sine");
                onNavigateToPage("customization");
              }}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all"
            >
              LAUNCH_SETTIN_TWEAKS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


/* ==========================================
   MINI-APP_1: RETRO ARCADE RACER
   ========================================== */
interface RetroRacerGameProps {
  theme: ThemeConfig;
  playSound: (freq?: number, dur?: number, type?: OscillatorType) => void;
  vehicleData: VehicleData | null;
}

const RetroRacerGame: React.FC<RetroRacerGameProps> = React.memo(({ theme, playSound, vehicleData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem("racer_high_score") || "0"));
  const [gameOver, setGameOver] = useState(false);
  const [playerX, setPlayerX] = useState(0); // -1 to 1 range (scaled to road)
  const [speedMult, setSpeedMult] = useState(1);
  const animationFrameId = useRef<number | null>(null);

  // Core Game State
  const obstacles = useRef<{ id: number; x: number; z: number; width: number; type: "car" | "pothole" }[]>([]);
  const segmentOffset = useRef(0);
  const currentSpeed = useRef(15); // miles per segment

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("racer_high_score", String(score));
    }
  }, [score, highScore]);

  const startGame = () => {
    playSound(523, 0.15, "triangle");
    setTimeout(() => playSound(659, 0.12, "triangle"), 80);
    setTimeout(() => playSound(784, 0.2, "triangle"), 160);
    obstacles.current = [];
    setScore(0);
    setPlayerX(0);
    setGameOver(false);
    setIsPlaying(true);
    segmentOffset.current = 0;
    currentSpeed.current = 15;
  };

  useEffect(() => {
    if (!isPlaying) return;

    let framesSinceStart = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let active = true;

    // Quick keys
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = () => {
      if (!active) return;
      framesSinceStart++;

      // Update segment scrolling
      segmentOffset.current += currentSpeed.current * 0.1;
      setScore(Math.floor(segmentOffset.current * 0.5));

      // Handle Steering Physics
      let currentX = playerX;
      if (keys.left) currentX = Math.max(-1.2, currentX - 0.05);
      if (keys.right) currentX = Math.min(1.2, currentX + 0.05);
      setPlayerX(currentX);

      // Handle Obstacle Spawning
      if (framesSinceStart % 60 === 0 && obstacles.current.length < 5) {
        obstacles.current.push({
          id: Math.random(),
          x: (Math.random() * 2) - 1, // road center range: -1 to 1
          z: 300, // starting distance
          width: 0.35,
          type: Math.random() > 0.4 ? "car" : "pothole"
        });
      }

      // Update Obstacles position & check collisions
      obstacles.current = obstacles.current.map(obs => {
        return {
          ...obs,
          z: obs.z - currentSpeed.current * 0.9 // closer
        };
      }).filter(obs => {
        // Collision threshold (z is distance, when close, is z < 15 and z > 0)
        if (obs.z > 0 && obs.z < 18) {
          const distanceX = Math.abs(obs.x - currentX);
          if (distanceX < (obs.width + 0.18)) {
            // CRASH!
            playSound(120, 0.35, "sawtooth");
            setIsPlaying(false);
            setGameOver(true);
            return false;
          }
        }
        return obs.z > 0; // retain future obstacles
      });

      // Clear Canvas
      ctx.fillStyle = "#0c0d1b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Retro Horizon / Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.45);
      gradient.addColorStop(0, "#190226");
      gradient.addColorStop(0.5, "#4d004d");
      gradient.addColorStop(1, "#f10a71");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.45);

      // Draw Horizon Neon Sun
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height * 0.45, 60, Math.PI, 0);
      const sunGrad = ctx.createLinearGradient(0, canvas.height * 0.45 - 60, 0, canvas.height * 0.45);
      sunGrad.addColorStop(0, "#ffff00");
      sunGrad.addColorStop(1, "#ff007f");
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Cyber scan lines in sun
      ctx.fillStyle = "#0c0d1b";
      for (let sl = canvas.height * 0.45 - 60; sl < canvas.height * 0.45; sl += 6) {
        ctx.fillRect(0, sl, canvas.width, 2);
      }

      // Draw Wireframe road & receding segments
      const horizonY = canvas.height * 0.45;
      const roadWidthStart = canvas.width * 0.15;
      const roadWidthEnd = canvas.width * 0.9;
      const roadCenterH = canvas.width * 0.5;

      // Draw Ground Horizon grid lines
      ctx.strokeStyle = "#400080";
      ctx.lineWidth = 1;
      const segmentDist = 20;
      const offsetModulo = segmentOffset.current % segmentDist;

      for (let y = horizonY + 2; y < canvas.height; y += 4) {
        const perspectiveScale = (y - horizonY) / (canvas.height - horizonY);
        // segment scroll
        const alpha = Math.min(1, perspectiveScale * 1.5);
        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.4})`;
        if ((Math.round(segmentOffset.current * 0.5 + y) % 32) < 4) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Road boundary vectors
      ctx.beginPath();
      ctx.moveTo(roadCenterH, horizonY);
      ctx.lineTo(canvas.width * 0.05, canvas.height);
      ctx.lineTo(canvas.width * 0.95, canvas.height);
      ctx.closePath();
      ctx.fillStyle = "#09040e";
      ctx.fill();

      // Draw Perspective grid bounds
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // left lane curb
      ctx.moveTo(roadCenterH - 2, horizonY);
      ctx.lineTo(canvas.width * 0.05, canvas.height);
      // right lane curb
      ctx.moveTo(roadCenterH + 2, horizonY);
      ctx.lineTo(canvas.width * 0.95, canvas.height);
      ctx.stroke();

      // Center dashed lines (scrolling)
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffff00";
      for (let z = 10; z < 400; z += 35) {
        const scrolledZ = (z - segmentOffset.current % 35);
        if (scrolledZ <= 0) continue;
        const scale = 1 / scrolledZ;
        
        // Convert pseudo 3D to 2D
        const y = horizonY + (100 * scale * (canvas.height - horizonY) * 0.08);
        const w = scale * (canvas.width * 0.95) * 0.8;
        const x = roadCenterH;

        if (y > horizonY && y < canvas.height) {
          const dashH = Math.max(1, 15 * (y - horizonY) / (canvas.height - horizonY));
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + dashH);
          ctx.stroke();
        }
      }

      // Draw Steering position / Simulated User vehicle
      const carY = canvas.height - 50;
      const carScaleX = canvas.width * 0.5 + currentX * (canvas.width * 0.35);
      
      // Draw tail-gas flames if fast
      ctx.fillStyle = "#ff00e0";
      ctx.beginPath();
      ctx.moveTo(carScaleX - 15, carY + 8);
      ctx.lineTo(carScaleX - 10 - Math.random() * 15, carY + 12 + Math.random() * 8);
      ctx.lineTo(carScaleX - 5, carY + 8);
      ctx.moveTo(carScaleX + 5, carY + 8);
      ctx.lineTo(carScaleX + 10 + Math.random() * 15, carY + 12 + Math.random() * 8);
      ctx.lineTo(carScaleX + 15, carY + 8);
      ctx.fill();

      // Cyber Sports Car Chassis
      ctx.fillStyle = "#1e1b4b";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(carScaleX - 30, carY + 5);
      ctx.lineTo(carScaleX - 25, carY - 8);
      ctx.lineTo(carScaleX - 15, carY - 8);
      ctx.lineTo(carScaleX - 10, carY - 18); // cabin
      ctx.lineTo(carScaleX + 10, carY - 18);
      ctx.lineTo(carScaleX + 15, carY - 8);
      ctx.lineTo(carScaleX + 25, carY - 8);
      ctx.lineTo(carScaleX + 30, carY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Windshield neon blue
      ctx.fillStyle = "#00ffff";
      ctx.beginPath();
      ctx.moveTo(carScaleX - 8, carY - 16);
      ctx.lineTo(carScaleX + 8, carY - 16);
      ctx.lineTo(carScaleX + 12, carY - 9);
      ctx.lineTo(carScaleX - 12, carY - 9);
      ctx.closePath();
      ctx.fill();

      // Taillights glowing red-hot
      ctx.fillStyle = "#ff0000";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff0000";
      ctx.fillRect(carScaleX - 28, carY - 4, 10, 4);
      ctx.fillRect(carScaleX + 18, carY - 4, 10, 4);
      ctx.shadowBlur = 0; // reset

      // Draw Obstacles (cars & potholes)
      obstacles.current.forEach(obs => {
        if (obs.z <= 0) return;
        const scale = 30 / obs.z;
        const y = horizonY + (100 * scale * (canvas.height - horizonY) * 0.05);
        
        // Horizontal offset based on projection
        const activeRoadW = (y - horizonY) / (canvas.height - horizonY) * (canvas.width * 0.82);
        const x = roadCenterH + obs.x * (activeRoadW / 2);

        if (y > horizonY && y < canvas.height) {
          const sizeW = Math.max(4, scale * 18);
          const sizeH = Math.max(2, scale * 10);

          if (obs.type === "car") {
            // Draw Adversary Cyber Car
            ctx.fillStyle = "#7f1d1d";
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x - sizeW, y);
            ctx.lineTo(x - sizeW * 0.8, y - sizeH);
            ctx.lineTo(x + sizeW * 0.8, y - sizeH);
            ctx.lineTo(x + sizeW, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Headlights
            ctx.fillStyle = "#facc15";
            ctx.shadowBlur = 4;
            ctx.shadowColor = "#facc15";
            ctx.fillRect(x - sizeW * 0.8, y - sizeH + 2, sizeW * 0.3, sizeH * 0.3);
            ctx.fillRect(x + sizeW * 0.5, y - sizeH + 2, sizeW * 0.3, sizeH * 0.3);
            ctx.shadowBlur = 0;
          } else {
            // Draw Hazard Pothole
            ctx.fillStyle = "#ffaa00";
            ctx.beginPath();
            ctx.ellipse(x, y, sizeW, sizeH * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Warning flash overlay
            if (framesSinceStart % 10 < 5) {
              ctx.strokeStyle = "#ff0055";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.ellipse(x, y, sizeW + 2, sizeH * 0.5, 0, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }
      });

      // Quick Instruction HUD on top of canvas overlay
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "bold 10px monospace";
      ctx.fillText("STEER: AXIS_L_R OR ARROWS", 12, 18);

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      active = false;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, playerX]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#08080f] p-4 gap-4 justify-start text-white relative">
      <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl border border-white/5 bg-[#030308] relative">
        <canvas 
          ref={canvasRef} 
          width={450} 
          height={320} 
          className="max-w-full rounded-lg border border-[#ec4899]/30 shadow-[0_0_15px_rgba(236,72,153,0.15)] bg-black h-auto aspect-[45/32]" 
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl">
            {gameOver ? (
              <div className="flex flex-col items-center animate-bounce">
                <span className="text-3xl font-black text-red-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  CRASH_ALERT
                </span>
                <span className="text-xs text-white/50 uppercase mt-1">SYSTEMS REBOOTED_0x44</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center max-w-[300px]">
                <Gamepad2 size={44} className="text-[#ec4899] animate-pulse" />
                <h4 className="text-xl font-black mt-2 uppercase tracking-wide">OUTRUN_INTEGRATED</h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal uppercase">Play a mini retro synthwave arcade test inside head unit. Keep yourself entertained while charging!</p>
              </div>
            )}
            <button
              onClick={startGame}
              className="mt-6 px-6 py-3 bg-[#ec4899] hover:bg-pink-600 border border-pink-400 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)]"
            >
              {gameOver ? "RUN_DIAGNOSTIC_RESTART" : "INITIALIZE_ARCADE_GAME"}
            </button>
          </div>
        )}
      </div>

      <div className="w-full md:w-[280px] bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shadow-[0_0_5px_#ec4899]" />
            <h5 className="text-xs font-black uppercase tracking-wider text-pink-400">ARCADE_STATISTICS</h5>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/50 border border-white/5 p-2 rounded-lg">
              <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-widest">DRIVE_SCORE</span>
              <span className="text-lg font-black font-mono text-white tracking-widest tabular-nums">{score}</span>
            </div>
            <div className="bg-black/50 border border-white/5 p-2 rounded-lg">
              <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-widest">PERSONAL_BEST</span>
              <span className="text-lg font-black font-mono text-cyan-400 tracking-widest tabular-nums">{highScore}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-[10px] uppercase font-mono text-gray-400 mt-2">
            <div className="flex justify-between">
              <span>Segment speed:</span>
              <span className="text-white">{(currentSpeed.current * 1.2).toFixed(0)} SEG/H</span>
            </div>
            <div className="flex justify-between">
              <span>Throttle boost:</span>
              <span className="text-white">{Math.round(vehicleData?.rpm || 2050)} RPM</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-black/80 rounded-lg border border-white/5">
          <span className="text-[9px] block uppercase text-white/50 leading-tight">Steer your retro flyer left/right using arrow keys or AD keys to dodge traffic potholes!</span>
        </div>
      </div>
    </div>
  );
});


/* ==========================================
   MINI-APP_2: ECU SYSTEM CODES SCANNER
   ========================================== */
interface EcuScannerProps {
  theme: ThemeConfig;
  playSound: (freq?: number, dur?: number, type?: OscillatorType) => void;
  vehicleData: VehicleData | null;
}

const EcuScanner: React.FC<EcuScannerProps> = ({ theme, playSound, vehicleData }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState("");
  const [detectedCodes, setDetectedCodes] = useState<{ code: string; desc: string; severity: "critical" | "warning"; module: string }[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [fixed, setFixed] = useState(false);

  const DTC_DB = [
    { code: "P0101", desc: "Mass Air Flow (MAF) Circuit Range/Performance Malfunction", severity: "warning" as const, module: "ECU_ENGINE" },
    { code: "P0300", desc: "Random/Multiple Cylinder Misfire Detected on Coils", severity: "critical" as const, module: "ECU_ENGINE" },
    { code: "P0420", desc: "Catalyst System Efficiency Below Threshold (Bank 1)", severity: "warning" as const, module: "ECU_EMISSIONS" },
    { code: "P0500", desc: "Vehicle Speed Sensor (VSS) A Circuit Malfunction", severity: "critical" as const, module: "TCU_TRANSMISSION" },
    { code: "B0202", desc: "SRS Airbag Deployment Front Left Igniter Range Peak", severity: "critical" as const, module: "SRS_AIRBAG" }
  ];

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setFixed(false);
    playSound(400, 0.15, "sawtooth");
    
    // Simulate step progress
    const steps = [
      "Connecting to J1962 vehicle gateway protocol...",
      "Querying CAN bus high-speed network...",
      "Scanning ENGINE CONTROL MODULE (ECU) PIDs...",
      "Scanning TRANSMISSION GATEWAY (TCU)...",
      "Scanning ANTI-LOCK BRAKES (ABS/ESP)...",
      "Parsing manufacturer diagnostic code registry..."
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2.5;
      setScanProgress(Math.min(100, currentProgress));
      
      const stepIdx = Math.floor((currentProgress / 100) * steps.length);
      setScanStep(steps[Math.min(steps.length - 1, stepIdx)]);

      if (currentProgress % 15 === 0) {
        playSound(600 + (currentProgress * 2), 0.05, "sine");
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setHasScanned(true);
        // Randomly pick a few codes
        const randomCodes = DTC_DB.filter(() => Math.random() > 0.4);
        setDetectedCodes(randomCodes);
        if (randomCodes.length > 0) {
          playSound(220, 0.3, "sawtooth");
        } else {
          playSound(880, 0.25, "sine");
        }
      }
    }, 80);
  };

  const handleClearCodes = () => {
    playSound(880, 0.08, "sine");
    setTimeout(() => playSound(1200, 0.15, "sine"), 60);
    setDetectedCodes([]);
    setFixed(true);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-slate-950 font-micro">
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="text-emerald-400" size={18} />
          <span className="text-sm font-black uppercase text-white">OBD2_DEEP_SYSTEM_SCANNER</span>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase tracking-widest text-[#a855f7]">
          CAN_BUS_ISO_15765
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        <div className="flex-1 bg-black/60 border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-0 relative">
          {isScanning ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-500/20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                <Cpu size={32} className="text-emerald-400 animate-pulse" />
              </div>
              <span className="text-xs font-black text-white">{scanProgress.toFixed(0)}% ANALYZING...</span>
              <span className="text-[10px] text-gray-500 uppercase mt-2 h-4 text-center font-mono tracking-tight max-w-[320px]">
                {scanStep}
              </span>
            </div>
          ) : hasScanned ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <span className="text-xs font-black text-white/50 uppercase">ACTIVE_TROUBLE_CODES_DTC ({detectedCodes.length})</span>
                {detectedCodes.length > 0 && (
                  <button 
                    onClick={handleClearCodes}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-[9px] font-black uppercase tracking-wider"
                  >
                    CLEAR_MALFUNCTION_LIGHTS
                  </button>
                )}
              </div>

              {detectedCodes.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                  {detectedCodes.map((dtc) => (
                    <div key={dtc.code} className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-red-900/40 border border-red-600/30 text-red-400 rounded-md text-[9px] font-black">{dtc.code}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{dtc.module}</span>
                        </div>
                        <p className="text-[10px] text-white/80 leading-normal font-mono mt-1 pr-4">{dtc.desc}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] font-black border uppercase tracking-wider rounded-md shrink-0 ${dtc.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                        {dtc.severity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <CheckCircle2 size={44} className="text-emerald-400 mb-2" />
                  <span className="text-xs font-black text-emerald-400 uppercase">ALL_SYSTEMS_FUNCTIONAL</span>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase">NO CODES IN VEHICLE BUFFER</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Cpu size={44} className="text-gray-500 mb-2 animate-pulse" />
              <span className="text-xs font-black uppercase text-white/50">ECU gateway inactive</span>
              <p className="text-[9px] text-gray-500 uppercase max-w-[280px] mt-1">Initiate a deep system diagnostics sweep using high frequency CAN message triggers.</p>
              <button 
                onClick={handleScan}
                className="mt-4 px-5 py-2.5 bg-emerald-500 text-black font-black uppercase tracking-wider text-xs rounded-xl"
              >
                SWEEP_ALL_MODULES
              </button>
            </div>
          )}
        </div>

        <div className="w-full md:w-[220px] bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between shrink-0">
          <div className="flex flex-col gap-3">
            <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">OBD_CHANNEL_SUMMARY</span>
            <div className="flex flex-col gap-2 font-mono text-[10px]">
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-gray-400">Node Status:</span>
                <span className={isScanning ? "text-amber-400 animate-pulse" : "text-emerald-400"}>{isScanning ? "SCANNING..." : "MONITOR"}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-gray-400">DTC Count:</span>
                <span className={detectedCodes.length > 0 ? "text-red-500" : "text-emerald-400"}>{detectedCodes.length} CODES</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-gray-400">MIL lamp:</span>
                <span className={detectedCodes.length > 0 ? "text-red-500" : "text-gray-500"}>{detectedCodes.length > 0 ? "ON" : "OFF"}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-black/60 rounded-lg border border-emerald-500/10 text-[9px] text-emerald-400 leading-tight">
            {"[GATEWAY] connection fully synchronized via J1939. Real OBD telemetry graphs automatically linked to system cluster."}
          </div>
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   MINI-APP_3: MEDIA PLAYER HUB
   ========================================== */
const MediaHub: React.FC<{ theme: ThemeConfig; playSound: (freq?: number) => void }> = ({ theme, playSound }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(34);
  const [currentSong, setCurrentSong] = useState(0);

  const playlist = [
    { title: "Midnight Drive (Vapor Remix)", artist: "Hyperion Outrun", length: "3:45", id: "01" },
    { title: "Sillhouette Lines", artist: "Stella Cruiser", length: "4:12", id: "02" },
    { title: "Alcantara Core Speed", artist: "AMG Division", length: "2:58", id: "03" },
    { title: "Carbon Wave Reflections", artist: "Aero Matrix", length: "3:22", id: "04" }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTrackProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#0a0a10]">
      <div className="flex-1 flex flex-col md:flex-row gap-6 items-center justify-start min-h-0">
        <div className="w-36 h-36 border border-white/15 bg-gradient-to-br from-purple-900 to-[#12051A] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,100,255,0.2),transparent)]" />
          <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center border border-white/10 animate-[spin_10s_linear_infinite]" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
            <div className="w-6 h-6 rounded-full bg-[#ec4899]/30 border border-[#ec4899] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-[8px] uppercase tracking-[0.2em] mt-3 font-mono text-white/50">ANALOG_DECK</span>
        </div>

        <div className="flex-1 flex flex-col justify-center w-full">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">INFOTAINMENT_MEDIA</span>
          <h4 className="text-xl font-black text-white uppercase tracking-tight mt-1 truncate">
            {playlist[currentSong].title}
          </h4>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
            {playlist[currentSong].artist}
          </span>

          <div className="w-full flex items-center gap-3 mt-6">
            <span className="text-[9px] font-mono text-gray-500">1:23</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                style={{ width: `${trackProgress}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-gray-500">{playlist[currentSong].length}</span>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button 
              onClick={() => {
                playSound(440);
                setCurrentSong(prev => (prev === 0 ? playlist.length - 1 : prev - 1));
                setTrackProgress(0);
              }}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={() => {
                playSound(isPlaying ? 350 : 587);
                setIsPlaying(!isPlaying);
              }}
              className="p-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full"
            >
              <Play size={18} fill="currentColor" />
            </button>
            <button 
              onClick={() => {
                playSound(440);
                setCurrentSong(prev => (prev === playlist.length - 1 ? 0 : prev + 1));
                setTrackProgress(0);
              }}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   MINI-APP_4: SIMULATED CAR WEB PORTAL & MAP
   ========================================== */
const WebBrowserSimulator: React.FC<{ theme: ThemeConfig; playSound: (freq?: number) => void }> = ({ theme, playSound }) => {
  const [address, setAddress] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePreset, setActivePreset] = useState("youtube");

  const presets = [
    { id: "youtube", name: "YouTube Music", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "maps", name: "Google Maps Sat", url: "https://maps.google.com/maps?q=Times%20Square&t=k&z=13&ie=UTF8&iwloc=&output=embed" },
    { id: "weather", name: "Global Weather Radar", url: "https://radar.weather.gov/" },
    { id: "spotify", name: "Web Spotify Deck", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX1s9v6gfcX9F" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-stone-950 font-mono">
      <div className="bg-[#121212] border-b border-white/10 p-3 flex gap-2 overflow-x-auto items-center shrink-0">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              playSound(480);
              setActivePreset(p.id);
              setAddress(p.url);
            }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${activePreset === p.id ? 'bg-[#3b82f6] border-blue-400 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-black/60 relative overflow-hidden flex flex-col justify-center items-center p-4">
        {/* Frame simulator display */}
        <div className="w-full h-full border border-white/10 rounded-xl overflow-hidden relative bg-[#09090e]">
          {activePreset === "youtube" ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <Tv size={44} className="text-red-500 animate-pulse mb-3" />
              <span className="text-xs font-black uppercase tracking-widest text-white/90">CYBER_PLAYER INTEGRATED</span>
              <p className="text-[9px] text-gray-500 uppercase mt-1 leading-normal max-w-[280px]">Simulated stream frame initialized safely. Supports full vehicle viewport mapping.</p>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-[10px] font-black uppercase tracking-widest text-white rounded-lg flex items-center gap-2">
                OPEN_EXTERNAL_YOUTUBE <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <iframe 
              src={address} 
              className="w-full h-full border-0 grayscale brightness-90 saturate-120" 
              title="Simulator Viewport"
            />
          )}
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   MINI-APP_5: ANTIGRAVITY AI TELEMETRY COPILOT
   ========================================== */
interface CopilotAiProps {
  theme: ThemeConfig;
  playSound: (freq?: number) => void;
  vehicleData: VehicleData | null;
}

const CopilotAi: React.FC<CopilotAiProps> = ({ theme, playSound, vehicleData }) => {
  const [messages, setMessages] = useState<{ sender: "user" | "copilot"; text: string; time: string }[]>([
    { sender: "copilot", text: "ANTIGRAVITY TELEMETRY SYSTEM CORE ACTIVE. Query me on battery life, speed diagnostics, and active OBD faults.", time: "10:10 AM" }
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText;
    playSound(600);
    const newMsgs = [...messages, { sender: "user" as const, text: userMsg, time: "10:11 AM" }];
    setMessages(newMsgs);
    setInputText("");

    setTimeout(() => {
      playSound(750);
      let replyText = "Query parameters received. Analyzing OBD system buffer...";
      const lower = userMsg.toLowerCase();
      if (lower.includes("battery") || lower.includes("volts")) {
        replyText = `Onboard battery state reported: ${(vehicleData?.batteryVolts || 13.8).toFixed(1)} Volts. Charger performance optimized at 48A.`;
      } else if (lower.includes("speed") || lower.includes("fast")) {
        replyText = `Current instantaneous speeds scaled: ${Math.round(vehicleData?.speed || 0)} MPH at ${Math.round(vehicleData?.rpm || 2100)} RPM. Normal range.`;
      } else if (lower.includes("temp") || lower.includes("coolant")) {
        replyText = `Coolant sensor registering ${Math.round(vehicleData?.coolantTemp || 92)}°C. Intake manifold registered at ${Math.round(vehicleData?.intakeTemp || 35)}°C.`;
      } else if (lower.includes("clear") || lower.includes("code") || lower.includes("reset")) {
        replyText = "Gateway resetting. DTC trouble codes cleared from non-volatile storage register successfully.";
      }

      setMessages(prev => [...prev, { sender: "copilot" as const, text: replyText, time: "10:11 AM" }]);
    }, 700);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-zinc-950 font-mono">
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 pb-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-[85%] flex flex-col gap-1 ${m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
            <span className="text-[8px] text-gray-500 uppercase font-black">{m.sender === 'user' ? 'DRIVER' : 'CO-PILOT_AI'}</span>
            <div className={`p-3 rounded-xl border text-[10px] uppercase leading-normal tracking-wide ${m.sender === 'user' ? 'bg-[#3b82f6]/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/5 text-white'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="h-[50px] border-t border-white/10 pt-3 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="SEND AI COMMAND (E.G. 'BATTERY'..."
          className="flex-1 bg-black text-xs text-white border border-white/10 rounded-xl px-4 uppercase font-bold focus:outline-none focus:border-sky-500 transition-all font-mono"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-5 bg-sky-500 text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-sky-400 transition-all"
        >
          SEND
        </button>
      </div>
    </div>
  );
};


/* ==========================================
   MINI-APP_6: SAFETY BACKUP CAMERA HELPER
   ========================================== */
interface BackupCamProps {
  theme: ThemeConfig;
  playSound: (freq?: number) => void;
  vehicleData: VehicleData | null;
}

const BackupCam: React.FC<BackupCamProps> = ({ theme, playSound, vehicleData }) => {
  const [radarPercent, setRadarPercent] = useState(85);

  useEffect(() => {
    // animate proximity warnings
    const interval = setInterval(() => {
      setRadarPercent(prev => {
        if (prev <= 25) return 85;
        return prev - 5;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-start bg-black relative p-4">
      <div className="w-full flex-1 border border-white/10 rounded-xl overflow-hidden relative bg-[#06100c] flex items-center justify-center">
        {/* Static lines for realistic car look */}
        <div className="absolute inset-0 bg-[#0f1f18]/15 z-10 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,100,0.02)_2px,rgba(0,255,100,0.02)_4px)]" />

        {/* Dynamic active guidelines */}
        <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full z-20 pointer-events-none opacity-85">
          <defs>
            <linearGradient id="curveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffff00" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ff0000" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Green Trajectory */}
          <path d="M50 300 L 160 150 M 350 300 L 240 150" stroke="#00ff00" strokeWidth="2" strokeDasharray="5,5" />
          
          {/* Yellow Warning Guideline */}
          <path d="M80 250 L 320 250" stroke="#ffff00" strokeWidth="3" />
          <text x="150" y="242" fill="#ffff00" fontSize="8" fontWeight="bold">STOP_PROXIMITY_ALERT</text>

          {/* Red Ultimate Stop Guideline */}
          <path d="M110 200 L 290 200" stroke="#ff0055" strokeWidth="4" />
          <path d="M125 180 L 275 180" stroke="#ff0000" strokeWidth="1" />
        </svg>

        {/* Back radar warnings */}
        <div className="absolute top-4 left-4 z-30 p-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black tracking-widest uppercase rounded-lg animate-pulse flex items-center gap-2">
          <AlertTriangle size={14} /> REAR_COLLISION_RADAR
        </div>

        <div className="flex flex-col items-center justify-center text-center z-10">
          <Eye size={44} className="text-emerald-500/40 animate-pulse mb-2" />
          <span className="text-[10px] font-mono tracking-widest text-[#00ffcc] font-black uppercase">REAR_CAMERA_SIMULATOR_ACTIVE</span>
          <span className="text-[9px] text-gray-500 uppercase mt-1">Sensor safe. Proximity clear ({radarPercent}CM)</span>
        </div>
      </div>
    </div>
  );
};
