
import { Geolocation } from '@capacitor/geolocation';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Type as GenAIType } from "@google/genai";
import { THEMES, STEREO_THEMES, BACKGROUND_SHADES, HEADER_SHADES } from './constants';
import { VehicleData, NavigationState, BackgroundShade, ThemeConfig, WeatherDay, EqualizerSettings } from './types';
import { obdService, ConnectionProfile } from './services/obdService';
import { audioService } from './services/audioService';
import { GaugeDispatcher } from './components/Gauge';
import { Equalizer } from './components/Equalizer';
import { Navigation, MiniMap } from './components/Navigation';
import { CustomizationPage } from './components/CustomizationPage';
import { SkinDesigner } from './components/SkinDesigner';
import { 
  Settings as SettingsIcon, Music, Gauge as GaugeIcon, ChevronLeft, ChevronRight, 
  Map as MapIcon, Maximize2, Minimize2, X, Activity, Info, CloudSun, Speaker, Bluetooth, RadioReceiver, MapPin, Link as LinkIcon, Navigation2, Cpu, Radio, Palette, Wifi, Sliders, Zap,
  Sun, Cloud, CloudRain, Snowflake, CloudLightning, Wind, Layers, Lock, Trash2, RefreshCw, Droplet, Thermometer, Fuel, Phone, MessageSquare, User, Search, Car, Type, Terminal, AlertTriangle, LayoutGrid
} from 'lucide-react';

declare global {
  interface Window {
    Capacitor?: any;
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const darkenHex = (hex: string, percent: number): string => {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

const TopBarTPMS: React.FC<{ data: VehicleData['tpms'] }> = ({ data }) => {
  const Item = ({ label, val }: { label: string, val: number }) => (
    <div className="flex flex-col items-center justify-center px-4 border-r border-white/10 last:border-0 min-w-[60px] lg:min-w-[80px]">
      <span className={`text-xl lg:text-2xl font-bold tabular-nums leading-none transition-colors duration-300 ${val < 28 ? 'text-red-500' : 'text-sky-400'}`}>
        {val}
      </span>
      <span className="text-[8px] lg:text-[10px] opacity-40 font-bold uppercase tracking-[0.1em]">{label}</span>
    </div>
  );
  return (
    <div className="flex bg-white/5 rounded-xl border border-white/10 px-3 py-1.5 shadow-inner backdrop-blur-3xl shrink-0">
      <Item label="FL" val={data.fl} />
      <Item label="FR" val={data.fr} />
      <Item label="RL" val={data.rl} />
      <Item label="RR" val={data.rr} />
    </div>
  );
};

export const WarningLights: React.FC<{ lights?: VehicleData['warningLights'], data?: VehicleData, className?: string }> = ({ lights, data, className = "" }) => {
  const wl = lights || data?.warningLights || {} as any;
  const safeWl = {
    battery: wl?.battery || false,
    oilPressure: wl?.oilPressure || false,
    checkEngine: wl?.checkEngine || false,
    tpms: wl?.tpms || false,
    abs: wl?.abs || false,
    traction: wl?.traction || false,
    parkingBrake: wl?.parkingBrake || false,
    highBeam: wl?.highBeam || false,
    leftSignal: wl?.leftSignal || false,
    rightSignal: wl?.rightSignal || false,
  };
  const offClass = "text-white/10 transition-all duration-300 scale-90";
  const onClass = (color: string, shadow: string, pulse: boolean = false) => `${color} drop-shadow-[0_0_20px_${shadow}] transition-all duration-100 scale-100 ${pulse ? 'animate-pulse' : ''}`;

  return (
    <div className={`flex items-center justify-center gap-2 lg:gap-4 px-6 py-2 bg-[#020202] rounded-full border border-white/5 shadow-[inset_0_2px_5px_rgba(255,255,255,0.05),inset_0_-2px_10px_rgba(0,0,0,1)] ${className}`}>
      <Zap size={22} className={safeWl.battery ? onClass('text-red-500', 'rgba(239,68,68,1)') : offClass} />
      <Droplet size={22} className={safeWl.oilPressure ? onClass('text-red-500', 'rgba(239,68,68,1)') : offClass} />
      <Thermometer size={22} className={safeWl.checkEngine ? onClass('text-amber-500', 'rgba(245,158,11,1)') : offClass} />
      <AlertTriangle size={22} className={safeWl.tpms ? onClass('text-amber-500', 'rgba(245,158,11,1)') : offClass} />
      <Activity size={22} className={safeWl.abs ? onClass('text-amber-500', 'rgba(16,185,129,1)') : offClass} />
      <Car size={22} className={safeWl.traction ? onClass('text-amber-500', 'rgba(16,185,129,1)') : offClass} />
      <AlertTriangle size={22} className={safeWl.parkingBrake ? onClass('text-red-500', 'rgba(239,68,68,1)') : offClass} />
      <Sun size={22} className={safeWl.highBeam ? onClass('text-blue-500', 'rgba(59,130,246,1)') : offClass} />
      <ChevronLeft size={28} className={safeWl.leftSignal ? onClass('text-emerald-500', 'rgba(16,185,129,1)', true) : offClass} />
      <ChevronRight size={28} className={safeWl.rightSignal ? onClass('text-emerald-500', 'rgba(16,185,129,1)', true) : offClass} />
    </div>
  );
};

const PidMonitor: React.FC<{ data: VehicleData | null }> = ({ data }) => {
  if (!data) return null;
  const items = [
    { id: '010C', label: 'RPM', value: Math.round(data.rpm), unit: 'RPM' },
    { id: '010D', label: 'SPEED', value: Math.round(data.speed), unit: 'MPH' },
    { id: '0105', label: 'COOLANT', value: Math.round(data.coolantTemp), unit: '°F' },
    { id: '012F', label: 'FUEL', value: Math.round(data.fuelLevel), unit: '%' },
    { id: '010B', label: 'BOOST', value: (data.boost ?? 0).toFixed(1), unit: 'PSI' },
    { id: '015C', label: 'OIL TEMP', value: Math.round(data.oilTemp), unit: '°F' },
    { id: '0111', label: 'THROTTLE', value: Math.round(data.throttlePos), unit: '%' },
    { id: '0104', label: 'LOAD', value: Math.round(data.engineLoad), unit: '%' },
  ];

  return (
    <div className="flex flex-col gap-[2cqh] font-mono w-full" style={{ containerType: 'size' }}>
      <div className="grid grid-cols-2 gap-[2cqh]">
        {items.map((item) => (
          <div key={item.id} className="bg-black/40 p-[2cqh] rounded-xl border border-white/5 flex justify-between items-center shadow-xl">
            <div className="flex flex-col">
              <span className="text-[4cqh] text-white/30 font-black tracking-widest">{item.id}</span>
              <span className="text-[6cqh] text-sky-400 font-black uppercase">{item.label}</span>
            </div>
            <div className="text-right flex items-baseline gap-[1cqw]">
              <span className="text-[16cqh] font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{item.value}</span>
              <span className="text-[5cqh] opacity-30 uppercase font-black">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[1cqh] p-[2cqh] bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-[2cqw]">
          <div className="w-[3cqh] h-[3cqh] bg-emerald-500 rounded-sm shadow-[0_0_10px_#10b981]" />
          <span className="text-[3.6cqh] font-black text-emerald-400 uppercase tracking-[0.4em]">WICAN_PRO_STREAM_ACTIVE</span>
        </div>
        <span className="text-[3cqh] font-black opacity-30 uppercase tracking-widest">POLLING_RATE: 60HZ</span>
      </div>
    </div>
  );
};

const NavigationHUD: React.FC<{ navState: NavigationState }> = ({ navState }) => {
  if (!navState.isNavigating || !navState.upcomingManeuvers || navState.upcomingManeuvers.length === 0) return null;

  return (
    <div className="absolute top-10 left-10 z-[1000] flex flex-col gap-4 pointer-events-none">
      <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 shadow-4xl flex flex-col gap-3 min-w-[280px]">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
          <Navigation2 size={20} className="text-sky-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">UPCOMING</span>
        </div>
        <div className="flex flex-col gap-4">
          {navState.upcomingManeuvers.slice(0, 3).map((m, i) => (
            <div key={i} className={`flex items-center justify-between gap-4 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
              <div className="flex flex-col">
                <span className="text-lg font-black uppercase tracking-tighter text-white truncate max-w-[200px]">{m.instruction}</span>
                <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">NEXT</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-sky-400 tabular-nums">{m.distance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HUDOverlay: React.FC<{ data: VehicleData }> = ({ data }) => null;

const ConnectionLog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const unsubscribeLog = obdService.onLog((log) => {
        if (log === 'LOGS_CLEARED') {
            setLogs([]);
        } else {
            setLogs(prev => [log, ...prev].slice(0, 100));
        }
    });
    return () => unsubscribeLog();
  }, []);

  return (
    <div className="machined-container p-8 lg:p-12 rounded-[3rem] flex flex-col gap-8 col-span-full">
       <div className="flex justify-between items-center">
          <h3 className="text-2xl lg:text-3xl font-black opacity-40 uppercase tracking-[0.5em] flex items-center gap-4 text-white"><Terminal size={24} /> CONNECTION_LOG</h3>
          <button 
            onClick={() => setLogs([])}
            className="text-xs font-black text-rose-500/60 hover:text-rose-500 uppercase tracking-widest"
          >
            CLEAR_LOG
          </button>
       </div>
       <div className="h-48 overflow-y-auto bg-black/40 rounded-[2rem] p-6 font-mono text-xs space-y-2 custom-scrollbar border border-white/5">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 border-b border-white/5 pb-2">
              <span className="text-white/20 shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span className={log.includes('ERROR') ? 'text-rose-400' : log.includes('WARNING') ? 'text-amber-400' : 'text-emerald-400/60'}>
                {log}
              </span>
            </div>
          ))}
          {logs.length === 0 && <div className="text-white/10 italic">AWAITING_HARDWARE_EVENTS...</div>}
       </div>
    </div>
  );
};

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="text-4xl lg:text-5xl font-black tracking-tighter tabular-nums text-white drop-shadow-2xl leading-none font-micro">
      {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).split(' ')[0]}
    </span>
  );
};

const DashboardCluster: React.FC<{
  activeTheme: ThemeConfig;
  telemetrySource: 'OBD' | 'GPS';
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  customSkin: any;
  useGpsFallback: boolean;
  useGpsForSpeed: boolean;
  isSimulatingPids: boolean;
  navState: NavigationState;
}> = ({ activeTheme, telemetrySource, connectionStatus, customSkin, useGpsFallback, useGpsForSpeed, isSimulatingPids, navState }) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  const smoothSpeedRef = useRef<number>(0);
  const smoothRpmRef = useRef<number>(800);
  const lastUpdateTime = useRef<number>(performance.now());
  const lastAnimUpdateTime = useRef<number>(0);
  const rawDataRef = useRef<VehicleData>(obdService.getData());

  useEffect(() => {
    if (isSimulatingPids) {
      obdService.setForceSimulation(true);
    } else {
      obdService.setForceSimulation(false);
    }
    
    obdService.setHighAccuracyGps(useGpsFallback);
    
    let animFrame: number;
    const updateLoop = () => {
        const now = performance.now();
        const dt = Math.min(0.016, (now - lastUpdateTime.current) / 1000);
        lastUpdateTime.current = now;
        
        const data = rawDataRef.current;
        if (data) {
            const isObdFresh = obdService.isDataFresh();
            const useHardware = (connectionStatus === 'connected' || telemetrySource === 'OBD') && isObdFresh;
            
            const targetSpeed = useHardware && !useGpsForSpeed ? data.speed : obdService.getGpsSpeed();
            const targetRpm = useHardware ? data.rpm : obdService.getVirtualRpm();
            
            const speedLerp = 50; // Faster response
            const rpmLerp = 60; // Faster response
            
            const sDiff = targetSpeed - smoothSpeedRef.current;
            const rDiff = targetRpm - smoothRpmRef.current;
            
            smoothSpeedRef.current += sDiff * Math.min(1, dt * speedLerp);
            smoothRpmRef.current += rDiff * Math.min(1, dt * rpmLerp);

            // Throttle React state updates to ~60 FPS (every 16ms) for smooth animations
            if (now - lastAnimUpdateTime.current > 16) {
                setForceUpdate(v => v + 1);
                lastAnimUpdateTime.current = now;
            }
        }
        animFrame = requestAnimationFrame(updateLoop);
    };
    animFrame = requestAnimationFrame(updateLoop);
    const dataUnsubscribe = obdService.onData((data) => {
        rawDataRef.current = data;
    });
    return () => {
      dataUnsubscribe();
      cancelAnimationFrame(animFrame);
    };
  }, [telemetrySource, connectionStatus, useGpsFallback, isSimulatingPids, useGpsForSpeed]);

  const data = rawDataRef.current;
  if (!data) return null;
  const gear = (connectionStatus === 'connected' || telemetrySource === 'OBD') ? data.gear : obdService.getVirtualGear();
  return (
    <GaugeDispatcher
      value={smoothRpmRef.current / 1000} min={0} max={9}
      speed={smoothSpeedRef.current} gear={gear}
      theme={activeTheme} label="RPM" data={data} navState={navState}
      backlit={true}
      customSkin={customSkin}
    />
  );
};

const App: React.FC = () => {
  const [vehicleName, setVehicleName] = useState(() => localStorage.getItem('vehicleName') || 'OBDASH_ULTIMATE');
  const [themeOverrides, setThemeOverrides] = useState<Partial<ThemeConfig>>(() => {
    const saved = localStorage.getItem('themeOverrides');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });
  const [uiScale, setUiScale] = useState(() => {
    const saved = localStorage.getItem('uiScale');
    return saved ? parseFloat(saved) : 1;
  });
  const [audioInputSource, setAudioInputSource] = useState<'microphone' | 'aux' | 'media' | 'simulated'>(() => {
    const saved = localStorage.getItem('audioInputSource');
    return (saved as any) || 'microphone';
  });
  const [activeThemeRaw, setActiveTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('customSkin');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return THEMES[0];
  });
  const activeTheme = useMemo(() => ({ ...activeThemeRaw, ...themeOverrides }), [activeThemeRaw, themeOverrides]);
  const [currentData, setCurrentData] = useState<VehicleData>(obdService.getData());
  const rawDataRef = useRef<VehicleData>(obdService.getData());
  const lastStateUpdateTime = useRef<number>(0);
  const lastAnimUpdateTime = useRef<number>(0);
  const [currentPage, setCurrentPage] = useState<'dash' | 'gauge' | 'music' | 'navigation' | 'settings' | 'customization'>('dash');
  const [isScanningWifi, setIsScanningWifi] = useState(false);
  const [activeProfile, setActiveProfile] = useState<ConnectionProfile>('STANDARD');
  const [telemetrySource, setTelemetrySource] = useState<'OBD' | 'GPS'>('OBD');
  const [stereoThemeIndex, setStereoThemeIndex] = useState(0);
  const [temperature, setTemperature] = useState<string>('--');
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [showForecast, setShowForecast] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [enableEqualizer, setEnableEqualizer] = useState(true);
  const [bearing, setBearing] = useState(0);
  const [audioGain, setAudioGain] = useState(0.01);
  const [hasPaidKey, setHasPaidKey] = useState(false);
  const [isDesigningSkin, setIsDesigningSkin] = useState(false);
  const [previewDesignTheme, setPreviewDesignTheme] = useState<ThemeConfig | null>(null);

  const saveCustomTheme = (theme: ThemeConfig) => {
    // Generate a new ID if it doesn't have one
    const newTheme = { ...theme, id: `custom-${Date.now()}` };
    
    // Create a new instance of THEMES array with the custom skin
    // To make it selectable, it needs to be accessible in the UI but 
    // for simplicity here we just make it the active theme
    setActiveTheme(newTheme);
    localStorage.setItem('customSkin', JSON.stringify(newTheme));
    setIsDesigningSkin(false);
    setPreviewDesignTheme(null);
  };


  
  useEffect(() => {
    const checkPermissions = async () => {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
        if (!localStorage.getItem('android_permissions_requested')) {
          try {
            try {
              // First attempt logic via Capacitor if available
              if (window.Capacitor) {
                await Geolocation.requestPermissions();
              } else if (navigator.geolocation) {
                // Standard web
                navigator.geolocation.getCurrentPosition(() => {}, () => {});
              }
            } catch (e) {
              console.warn("Permission request failed", e);
            }
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
               await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
            }
            localStorage.setItem('android_permissions_requested', 'true');
          } catch(e) {}
        }
      }
    };
    checkPermissions();
  }, []);

  // Check for paid API key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasPaidKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success and update state to proceed
      setHasPaidKey(true);
    }
  };
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [currentStreet, setCurrentStreet] = useState<string>("CALIBRATING_GPS...");
  const [eqSettings, setEqSettings] = useState<EqualizerSettings>({ 
    sensitivity: 0.05, 
    decay: 0.5, 
    fluidity: 0.5,
    clarity: 0.5,
    treble: 0.5,
    bass: 0.5,
    soundProfile: 'REFERENCE'
  });
  const [useGpsFallback, setUseGpsFallback] = useState(true);
  const [isSimulatingPids, setIsSimulatingPids] = useState(true);
  const [useGpsForSpeed, setUseGpsForSpeed] = useState(false);
  const [navWidth, setNavWidth] = useState(28); // Percentage
  const [navHeight, setNavHeight] = useState(100); // Percentage
  const [gaugeWidth, setGaugeWidth] = useState(100); // Percentage
  const [gaugeHeight, setGaugeHeight] = useState(60); // Percentage
  const [eqWidth, setEqWidth] = useState(100); // Percentage
  const [eqHeight, setEqHeight] = useState(40); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Advanced Connection State
  const [advProtocol, setAdvProtocol] = useState('ISO 15765-4 (CAN 11/500)');
  const [advConnection, setAdvConnection] = useState('Bluetooth (BLE)');
  const [advBaud, setAdvBaud] = useState('500k');

  useEffect(() => {
     // Subscribe to status changes
     const unsubscribeStatus = obdService.onStatusChange((status) => {
         setConnectionStatus(status);
     });

     return () => {
         unsubscribeStatus();
     };
  }, []);

  const [navState, setNavState] = useState<NavigationState>({
    isNavigating: false, instruction: "DRIVE_SAFE", destinationName: "No Destination",
    distanceRemaining: "-- MI", timeRemaining: "-- MIN", destination: null
  });

  useEffect(() => {
    if (!navState.isNavigating) return;

    const interval = setInterval(() => {
      setNavState(prev => {
        if (!prev.isNavigating) return prev;
        
        const distNum = parseFloat(prev.distanceRemaining);
        const timeNum = parseInt(prev.timeRemaining);
        
        if (isNaN(distNum) || distNum <= 0.1) {
          return {
            ...prev,
            isNavigating: false,
            instruction: "ARRIVED",
            distanceRemaining: "0.0 MI",
            timeRemaining: "0 MIN"
          };
        }

        // Simulate moving
        const newDist = (distNum - 0.01).toFixed(1);
        const newTime = Math.max(1, Math.round(timeNum - (Math.random() > 0.8 ? 1 : 0)));
        
        // Change instruction occasionally
        let newInstruction = prev.instruction;
        if (distNum < 2.0 && prev.instruction === "CONTINUE_STRAIGHT") newInstruction = "TURN_RIGHT_IN_500FT";
        if (distNum < 1.5 && prev.instruction === "TURN_RIGHT_IN_500FT") newInstruction = "TURN_RIGHT_ON_MAIN_ST";
        if (distNum < 1.0 && prev.instruction === "TURN_RIGHT_ON_MAIN_ST") newInstruction = "CONTINUE_STRAIGHT";
        if (distNum < 0.5 && prev.instruction === "CONTINUE_STRAIGHT") newInstruction = "DESTINATION_ON_RIGHT";

        return {
          ...prev,
          distanceRemaining: `${newDist} MI`,
          timeRemaining: `${newTime} MIN`,
          instruction: newInstruction
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navState.isNavigating]);

  // Re-initialize audio based on user interaction and input source
  useEffect(() => {
    const initAudio = async () => {
        try {
            const success = await audioService.initialize(audioInputSource);
            if (success) {
                audioService.resume();
                setIsAudioInitialized(true);
            }
        } catch (e) {
            // Silent fail, will retry on interaction
        }
    };
    
    // Always re-init when the input source changes
    if (isAudioInitialized) {
        initAudio();
    }
    
    const handleInteraction = () => {
        if (!isAudioInitialized) {
            initAudio();
        }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    // Attempt immediate init
    initAudio();

    return () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isAudioInitialized, audioInputSource]);


  const [customSkin, setCustomSkin] = useState({
    fontSizeLarge: 9.2,
    fontSizeBottom: 3.6,
    primaryColor: activeTheme.primaryColor,
    fontFamily: 'Michroma'
  });

  // Layout engine state persistence
  useEffect(() => {
    const saved = localStorage.getItem('dash_layout');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNavWidth(parsed.navWidth);
      setGaugeHeight(parsed.gaugeHeight);
      setEqHeight(100 - parsed.gaugeHeight);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dash_layout', JSON.stringify({ navWidth, gaugeHeight }));
  }, [navWidth, gaugeHeight]);

  const [resizingType, setResizingType] = useState<'vertical' | 'horizontal' | null>(null);

  const handleResize = (e: MouseEvent | TouchEvent) => {
    if (!resizingType) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (resizingType === 'vertical') {
      const container = document.querySelector('.gauge-column');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const percentage = Math.max(20, Math.min(80, (relativeY / rect.height) * 100));
      setGaugeHeight(percentage);
      setEqHeight(100 - percentage);
    } else if (resizingType === 'horizontal') {
      const container = document.querySelector('.dash-layout');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const percentage = Math.max(15, Math.min(60, (relativeX / rect.width) * 100));
      setNavWidth(percentage);
    }
  };

  useEffect(() => {
    if (resizingType) {
      window.addEventListener('mousemove', handleResize as any);
      window.addEventListener('mouseup', () => setResizingType(null));
      window.addEventListener('touchmove', handleResize as any);
      window.addEventListener('touchend', () => setResizingType(null));
    }
    return () => {
      window.removeEventListener('mousemove', handleResize as any);
      window.removeEventListener('mouseup', () => setResizingType(null));
      window.removeEventListener('touchmove', handleResize as any);
      window.removeEventListener('touchend', () => setResizingType(null));
    };
  }, [resizingType]);

  const [showWifiDialog, setShowWifiDialog] = useState(false);
  const [wifiIp, setWifiIp] = useState('192.168.4.1');
  const [wifiPort, setWifiPort] = useState('81');
  const [forcedProtocol, setForcedProtocol] = useState('ATSP0');

  const handleConnectHardware = async (profile: ConnectionProfile, ip?: string, port?: string, protocol: string = forcedProtocol) => {
    setConnectionStatus('connecting');
    let result;
    if (profile === 'WIFI') {
        result = await obdService.connectWiFi(ip || wifiIp, parseInt(port || wifiPort), protocol);
    } else {
        result = await obdService.connectHardware(profile, protocol);
    }
    
    if (result.success) {
       setActiveProfile(profile);
       setConnectionStatus('connected');
       setTelemetrySource('OBD');
       setIsSimulatingPids(false);
    } else {
       setConnectionStatus('disconnected');
    }
  };

  const handleScanGeneric = async () => {
    setConnectionStatus('connecting');
    const result = await obdService.scanGenericBluetooth();
    if (result.success) {
       setConnectionStatus('connected');
       setTelemetrySource('OBD');
       setIsSimulatingPids(false);
    } else {
       setConnectionStatus('disconnected');
    }
  };

  const changeTheme = (offset: number) => {
    let allThemes = [...THEMES];
    const saved = localStorage.getItem('customSkin');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (!allThemes.find(t => t.id === parsed.id)) {
           allThemes = [parsed, ...allThemes];
        }
      } catch (e) {}
    }
    
    // First, try to find activeTheme.id in allThemes
    let currentIndex = allThemes.findIndex(t => t.id === activeThemeRaw.id);
    // If somehow not found (CustomizationPage overrides without ID), fallback to 0
    if (currentIndex === -1) currentIndex = 0;

    const nextIndex = (currentIndex + offset + allThemes.length) % allThemes.length;
    setActiveTheme(allThemes[nextIndex]);
  };



  useEffect(() => {
    if (isAudioInitialized) {
      audioService.setSensitivity(audioGain);
    }
  }, [audioGain, isAudioInitialized]);

  useEffect(() => {
    if (isSimulatingPids) {
      obdService.setForceSimulation(true);
    } else {
      obdService.setForceSimulation(false);
    }
    
    obdService.setHighAccuracyGps(useGpsFallback);
    
    const dataUnsubscribe = obdService.onData((data) => {
        rawDataRef.current = data;
        
        // Throttle state updates for telemetry to 60Hz for smooth updates
        const now = performance.now();
        if (now - lastStateUpdateTime.current > 16) {
            setCurrentData(data);
            lastStateUpdateTime.current = now;
        }
    });
    return () => {
      dataUnsubscribe();
    };
  }, [telemetrySource, connectionStatus, useGpsFallback, isSimulatingPids, useGpsForSpeed]);

  useEffect(() => {
    const fetchData = async () => {
      if (!("geolocation" in navigator)) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude, heading } = pos.coords;
        if (heading !== null) setBearing(heading);
        
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const street = geoData.address.road || geoData.address.suburb || geoData.address.city || "TRACKING_ACTIVE";
            setCurrentStreet(street.toUpperCase());
          }
        } catch (e) {}

        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto`);
          if (res.ok) {
            const data = await res.json();
            if (data?.current_weather) setTemperature(Math.round(data.current_weather.temperature).toString());
            if (data?.daily) {
              const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              const weatherCodes: Record<number, string> = { 0: 'Clear', 1: 'Cloudy', 2: 'Cloudy', 3: 'Cloudy', 45: 'Fog', 48: 'Fog', 51: 'Rain', 53: 'Rain', 55: 'Rain', 61: 'Rain', 63: 'Rain', 65: 'Rain', 71: 'Snow', 73: 'Snow', 75: 'Snow', 95: 'Storm' };
              
              setForecast(data.daily.time.map((t: string, i: number) => ({
                day: days[new Date(t).getDay()],
                high: Math.round(data.daily.temperature_2m_max[i]),
                low: Math.round(data.daily.temperature_2m_min[i]),
                condition: weatherCodes[data.daily.weathercode?.[i]] || 'Clear'
              })));
            }
          }
        } catch (e) {}
      });
    };
    fetchData();
    const weatherInt = setInterval(fetchData, 60000);
    return () => clearInterval(weatherInt);
  }, []);

  const dashboardCluster = useMemo(() => {
    return (
      <DashboardCluster
        activeTheme={activeTheme}
        telemetrySource={telemetrySource}
        connectionStatus={connectionStatus}
        customSkin={customSkin}
        useGpsFallback={useGpsFallback}
        useGpsForSpeed={useGpsForSpeed}
        isSimulatingPids={isSimulatingPids}
        navState={navState}
      />
    );
  }, [activeTheme, telemetrySource, connectionStatus, customSkin, useGpsFallback, useGpsForSpeed, isSimulatingPids, navState]);

  const getOverlayClass = () => {
    return '';
  };

  return (
    <div className={`fixed inset-0 flex flex-col overflow-hidden select-none text-white font-micro transition-all duration-1000 touch-none h-[100dvh] w-full bg-black`}>
      
      {/* 3D Scanning Tunnel Background (Persistent) */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none opacity-30 mix-blend-screen">
          <div className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.02)_180deg,transparent_360deg)] animate-[spin_60s_linear_infinite]" />
          <div className="absolute inset-x-0 bottom-0 top-[20%] flex justify-center items-end" style={{ transform: 'perspective(1500px) rotateX(75deg)' }}>
             <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
             <div className="w-[300%] h-[300%] bg-[linear-gradient(rgba(255,255,255,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.1)_2px,transparent_2px)] bg-[length:60px_60px] transform translate-y-1/4" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,1)_100%)] z-20" />
      </div>

      <div className={`fixed inset-0 pointer-events-none z-[1] opacity-30 bg-repeat bg-center transition-all duration-1000 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]`}></div>
      <div className="fixed inset-0 pointer-events-none z-[2] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.02)_1px,rgba(0,0,0,0.02)_2px)]"></div>
      <div className="fixed inset-0 pointer-events-none z-[3] bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
      
      {showForecast && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-8 lg:p-24 backdrop-blur-[40px] bg-black/70">
           <div className="machined-container w-full max-w-[1800px] h-full max-h-[850px] rounded-[5rem] border border-white/10 p-10 flex flex-col relative overflow-hidden">
              <button onClick={() => setShowForecast(false)} className="absolute top-10 right-10 p-6 bg-white/5 rounded-sm hover:bg-white/10 transition-all active:scale-90">
                <X size={42} />
              </button>
              <div className="flex items-center gap-10 mb-14">
                 <div className="p-10 bg-sky-500/20 text-sky-400 rounded-[2.5rem] border border-sky-500/30">
                    <CloudSun size={72} />
                 </div>
                 <h2 className="text-6xl lg:text-9xl font-black tracking-tighter uppercase font-tech leading-none">Weekly_Forecast</h2>
              </div>
              <div className="flex-1 grid grid-cols-7 gap-5 h-full">
                 {forecast.map((day, i) => (
                   <div key={i} className="flex flex-col items-center justify-center bg-white/[0.03] rounded-[3.5rem] border border-white/5 p-6 lg:p-10 transition-all hover:bg-white/10">
                      <span className="text-3xl lg:text-4xl font-black opacity-40 uppercase mb-10 tracking-widest">{day.day}</span>
                      <div className="mb-10 text-white/80">
                        {day.condition === 'Clear' && <Sun size={64} className="text-yellow-400" />}
                        {day.condition === 'Cloudy' && <Cloud size={64} className="text-gray-400" />}
                        {day.condition === 'Rain' && <CloudRain size={64} className="text-blue-400" />}
                        {day.condition === 'Snow' && <Snowflake size={64} className="text-sky-200" />}
                        {day.condition === 'Storm' && <CloudLightning size={64} className="text-purple-400" />}
                        {day.condition === 'Fog' && <Wind size={64} className="text-gray-300" />}
                      </div>
                      <div className="flex flex-col items-center gap-2">
                         <span className="text-5xl lg:text-7xl font-black text-orange-500 leading-none">{day.high}°</span>
                         <span className="text-5xl lg:text-7xl font-black text-sky-400 leading-none">{day.low}°</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Header - Refined Precision */}
      {!isFullScreen && (
      <div className="h-[58px] border-b border-white/10 flex items-center justify-between px-[2vw] z-[500] relative backdrop-blur-3xl shadow-4xl transition-colors duration-1000" style={{ backgroundColor: '#050505' }}>
         <div className="absolute inset-0 bg-black/70 z-[-1]"></div>
         <div className="flex items-center gap-10 lg:gap-14 w-[35%] shrink-0">
            <div className="flex items-center gap-6 shrink-0">
               <div className="flex flex-col">
                  <span 
    className="text-2xl lg:text-3xl font-black tracking-tighter uppercase text-white/95 leading-none font-tech drop-shadow-lg"
  >
    {vehicleName}
  </span>
                  {connectionStatus === 'connected' && (
                    <div className="flex items-center gap-3 mt-1 px-3 py-1 bg-emerald-500/10 rounded-sm border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-sm shadow-[0_0_10px_#10b981]" />
                       <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">LINK_ACTIVE</span>
                    </div>
                  )}
               </div>
            </div>
          {currentData && <TopBarTPMS data={currentData.tpms} />}
        </div>
         <div className="flex-1 flex items-center justify-center border-x border-white/10 h-full bg-white/[0.03] overflow-hidden relative">
            <div className="flex-1 overflow-hidden relative h-full flex items-center justify-center px-[2vw]">
               <span className="text-lg lg:text-xl font-black tracking-widest uppercase text-white whitespace-nowrap block leading-none font-micro drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] truncate text-center w-full">
                  {navState.isNavigating ? navState.instruction : currentStreet}
               </span>
            </div>
         </div>
         <div className="flex items-center justify-end gap-6 lg:gap-8 w-[35%] shrink-0">
            <button onClick={() => setShowForecast(true)} className="flex items-center gap-6 lg:gap-8 hover:scale-105 transition-all group">
               <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors shadow-lg">
                  <CloudSun size={28} className="text-sky-400" />
               </div>
               <span className="text-3xl lg:text-4xl font-black tabular-nums leading-none tracking-tighter font-micro">{temperature}°</span>
            </button>
            <button 
              className="flex flex-col items-end group"
            >
              <Clock />
            </button>
           <button onClick={() => { if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }} className="opacity-20 hover:opacity-100 p-2 bg-white/5 rounded-sm transition-all hover:scale-110 active:scale-95 border border-white/10"><Maximize2 size={24} /></button>
        </div>
      </div>
      )}

      <div className="flex-1 flex overflow-hidden relative z-10 w-full h-full" style={{ zoom: uiScale }}>
        {currentPage === 'dash' && (
            <div className="flex flex-col w-full h-full gap-0 ultrawide-optimized relative dash-layout">
               <div className="flex-1 flex gap-0 relative min-h-0">
                  <HUDOverlay data={currentData!} />
                  {/* Left Column: Navigation (Map) */}
                  <div className="h-full shrink-0 w-[22%] flex items-center justify-center relative">
                    <div 
                      onClick={() => setCurrentPage('navigation')} 
                      className={`machined-container overflow-hidden border border-white/10 transition-all cursor-pointer shadow-4xl group hover:border-white/20 relative w-full h-full ${getOverlayClass()}`}
                    >
                      <MiniMap theme={activeTheme} navState={navState} bearing={bearing} onMapStyleChange={(index) => setNavState(p => ({...p, mapStyleIndex: index}))} />
                      {/* Premium Gradient Overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />
                      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] z-10" />
                      {!navState.isNavigating && (
                        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-between items-end opacity-70 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">GPS_ACTIVE</span>
                            <span className="text-xs font-black text-emerald-400 tracking-tighter">TRACKING</span>
                          </div>
                          <MapIcon size={16} className="text-white/50" />
                        </div>
                      )}
                    </div>
                  </div>

              {/* Right Column: Gauges & Equalizer */}
              <div className="flex-1 h-full flex flex-col min-w-0 gauge-column relative">
                 {/* Top: Speedometer / Main Gauge Cluster */}
                 <div 
                   className={`relative flex items-center justify-center min-h-0 ${getOverlayClass()} flex-1 overflow-hidden`}
                 >
                    <div 
                      className="w-full h-full relative flex items-center justify-center p-0"
                    >
                        {dashboardCluster}
                    </div>
                 </div>

                 {/* Bottom: Equalizer / Audio Visualizer */}
                 <div 
                   className={`relative min-h-0 ${getOverlayClass()} flex-1 pointer-events-auto`}
                 >
                    <Equalizer 
                      appTheme={activeTheme} 
                      gain={audioGain}
                      forcedThemeIndex={stereoThemeIndex}
                      onSetTheme={setStereoThemeIndex}
                      settings={eqSettings}
                      isAudioInitialized={isAudioInitialized}
                      onInit={() => setIsAudioInitialized(true)}
                      isActive={enableEqualizer}
                      lowRes={false}
                    />
                 </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'gauge' && (
          <div className={`flex-1 flex items-center justify-center w-full h-full relative ${getOverlayClass()}`}>
            <div className="w-full h-full p-4">
              {dashboardCluster}
            </div>
          </div>
        )}



        {currentPage === 'music' && (
          <div className={`flex-1 machined-container rounded-[4rem] overflow-hidden border-8 border-[#1a1a1a] shadow-4xl animate-in fade-in h-full relative ${getOverlayClass()}`}>
             <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)] pointer-events-none z-10" />
             <Equalizer 
               appTheme={activeTheme} 
               gain={audioGain} 
               forcedThemeIndex={stereoThemeIndex} 
               onSetTheme={setStereoThemeIndex} 
               isAudioInitialized={isAudioInitialized} 
               onInit={() => setIsAudioInitialized(true)} 
               settings={eqSettings}
               isActive={enableEqualizer}
             />
          </div>
        )}

        {currentPage === 'navigation' && (
          <div className={`absolute inset-0 z-0 animate-in fade-in ${getOverlayClass()}`}>
             <Navigation theme={activeTheme} data={currentData!} navState={navState} onUpdateNav={(s) => setNavState(p => ({...p, ...s}))} />
          </div>
        )}

        {currentPage === 'customization' && (
          <CustomizationPage 
            themeOverrides={themeOverrides} 
            setThemeOverrides={setThemeOverrides} 
            uiScale={uiScale} 
            setUiScale={setUiScale} 
            vehicleName={vehicleName} 
            setVehicleName={setVehicleName} 
            audioInputSource={audioInputSource}
            setAudioInputSource={setAudioInputSource}
            onClose={() => setCurrentPage('dash')} 
          />
        )}

        {currentPage === 'settings' && (
           <div className={`flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto bg-black/99 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] shadow-4xl animate-in slide-in-from-bottom-10 h-full relative ${getOverlayClass()}`}>
              <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-8">
                 <div className="flex items-center gap-6">
                    <div className="p-4 lg:p-6 bg-white text-black rounded-[2rem] shadow-[0_0_30px_white]"><SettingsIcon size={32}/></div>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase font-tech text-white/90">PERFORMANCE_CORE</h2>
                 </div>
                 <button onClick={() => setCurrentPage('dash')} className="p-6 lg:p-8 rounded-sm bg-white/10 hover:bg-white/20 transition-all text-white"><X size={36}/></button>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-[2600px] mx-auto w-full pb-48">
                  {/* Connection Hub - Now First */}
                  <div className="glass-panel p-8 lg:p-12 rounded-futuristic flex flex-col gap-8 futuristic-glow cyber-border text-sky-400">
                     <h3 className="text-2xl lg:text-3xl font-black opacity-40 uppercase tracking-[0.5em] flex items-center gap-4 text-white"><Bluetooth size={24} /> CONNECTION_HUB</h3>
                     <div className="grid grid-cols-1 gap-4">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-2">
                            <div className="flex justify-between items-center mb-4">
                               <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">OBD_PROTOCOL</span>
                               <select 
                                 value={forcedProtocol} 
                                 onChange={(e) => setForcedProtocol(e.target.value)}
                                 className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-[10px] font-black text-sky-400 outline-none focus:border-sky-500/50"
                               >
                                 <option value="ATSP0">AUTO_DETECT</option>
                                 <option value="ATSP6">ISO_15765_4_CAN_11_500</option>
                                 <option value="ATSP7">ISO_15765_4_CAN_29_500</option>
                                 <option value="ATSP8">ISO_15765_4_CAN_11_250</option>
                                 <option value="ATSP9">ISO_15765_4_CAN_29_250</option>
                                 <option value="ATSP1">SAE_J1850_PWM</option>
                                 <option value="ATSP2">SAE_J1850_VPW</option>
                               </select>
                            </div>
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-4">WICAN_PRO_DEDICATED</span>
                           <div className="grid grid-cols-2 gap-4">
                              <button 
                                disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                                onClick={() => handleConnectHardware('PERFORMANCE', undefined, undefined, forcedProtocol)}
                                className="p-6 rounded-xl bg-sky-500/20 border border-sky-500/40 hover:bg-sky-500/30 transition-all flex flex-col items-center gap-2"
                              >
                                 <Bluetooth size={24} className="text-sky-400" />
                                 <span className="text-[10px] font-black uppercase text-white">WICAN_BLE</span>
                              </button>
                              <button 
                                disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                                onClick={() => setShowWifiDialog(true)}
                                className="p-6 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex flex-col items-center gap-2"
                              >
                                 <Wifi size={24} className="text-emerald-400" />
                                 <span className="text-[10px] font-black uppercase text-white">WICAN_WIFI</span>
                              </button>
                           </div>
                        </div>
                        <button 
                          disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                          onClick={() => handleConnectHardware('PERFORMANCE', undefined, undefined, forcedProtocol)}
                          className={`p-8 rounded-[2rem] border flex items-center justify-between transition-all group ${connectionStatus === 'connected' ? 'bg-emerald-500/20 border-emerald-500/40 opacity-80' : 'bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20'}`}
                        >
                           <div className="flex flex-col items-start">
                              <span className="text-xl font-black uppercase">
                                {connectionStatus === 'connected' ? 'SYSTEM_LINKED' : 'DEEP_SCAN'}
                              </span>
                              <span className="text-[9px] opacity-40 uppercase tracking-widest">
                                {connectionStatus === 'connected' ? 'HARDWARE_ACTIVE' : 'FULL_CAN_ANALYSIS'}
                              </span>
                           </div>
                           <Activity size={32} className={`${connectionStatus === 'connected' ? 'text-emerald-400' : 'text-sky-400'} group-hover:scale-110 transition-transform`} />
                        </button>

                        <button 
                          disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                          onClick={handleScanGeneric}
                          className={`p-8 rounded-[2rem] border flex items-center justify-between transition-all group ${connectionStatus === 'connected' ? 'bg-emerald-500/20 border-emerald-500/40 opacity-80' : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                        >
                           <div className="flex flex-col items-start">
                              <span className="text-xl font-black uppercase">
                                {connectionStatus === 'connected' ? 'DEVICE_PAIRED' : 'PAIR_NEW_DEVICE'}
                              </span>
                              <span className="text-[9px] opacity-40 uppercase tracking-widest">
                                {connectionStatus === 'connected' ? 'BT_LINK_STABLE' : 'BLUETOOTH_BLE_SCAN'}
                              </span>
                           </div>
                           <Bluetooth size={32} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                        </button>

                        {connectionStatus === 'connected' && (
                          <button 
                            onClick={async () => {
                              setConnectionStatus('disconnected');
                              await obdService.forceFullReset();
                            }}
                            className="p-8 rounded-[2rem] bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 flex items-center justify-between transition-all group"
                          >
                             <div className="flex flex-col items-start">
                                <span className="text-xl font-black uppercase">DISCONNECT_RESET</span>
                                <span className="text-[9px] opacity-40 uppercase tracking-widest">FORCE_HARDWARE_UNLINK</span>
                             </div>
                             <RefreshCw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
                          </button>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                           <button 
                             onClick={() => handleConnectHardware('PERFORMANCE')}
                             className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex flex-col items-center gap-2 hover:bg-amber-500/20 transition-all group"
                           >
                              <Zap size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-black uppercase">FAST_OBD</span>
                           </button>
                           <button 
                             onClick={() => handleConnectHardware('REALDASH_BLE')}
                             className="p-6 rounded-[2rem] bg-sky-500/10 border border-sky-500/20 flex flex-col items-center gap-2 hover:bg-sky-500/20 transition-all group"
                           >
                              <Cpu size={24} className="text-sky-400 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-black uppercase">REALDASH</span>
                           </button>
                           <button 
                             onClick={() => setShowWifiDialog(true)}
                             className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center gap-2 hover:bg-white/10 transition-all"
                           >
                              <Wifi size={24} className="text-white/40" />
                              <span className="text-[10px] font-black uppercase">WIFI_LINK</span>
                           </button>
                        </div>
                        <button 
                          onClick={() => obdService.connectSerial()}
                          className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center gap-4 hover:bg-white/10 transition-all w-full"
                        >
                           <LinkIcon size={24} className="text-white/40" />
                           <span className="text-[10px] font-black uppercase tracking-widest">USB_SERIAL_INTERFACE</span>
                        </button>
                     </div>
                  </div>
                 <div className="machined-container p-8 lg:p-12 rounded-[3rem] flex flex-col gap-8">
                    <h3 className="text-2xl lg:text-3xl font-black opacity-40 uppercase tracking-[0.5em] flex items-center gap-4 text-white"><Navigation2 size={24} /> TELEMETRY_SYNC</h3>
                    <div className="flex flex-col gap-4">
                       <button 
                        onClick={() => setTelemetrySource('OBD')}
                        className={`p-8 rounded-[2rem] border transition-all flex items-center justify-between group ${telemetrySource === 'OBD' || connectionStatus === 'connected' ? 'bg-[#7851A9] border-[#7851A9] shadow-2xl' : 'bg-white/5 border-white/5 opacity-50'}`}
                       >
                          <div className="flex flex-col items-start">
                             <span className="text-2xl font-black uppercase">OBD_HARDWARE</span>
                             <span className="text-[11px] opacity-40 uppercase tracking-[0.2em]">DIRECT_LINK</span>
                          </div>
                          <Cpu size={42} />
                       </button>

                       <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                          <div className="flex justify-between items-center mb-4">
                             <span className="text-sm font-black uppercase opacity-50">SIMULATE_PIDS</span>
                             <div 
                               onClick={() => { const ns = !isSimulatingPids; setIsSimulatingPids(ns); obdService.setForceSimulation(ns); }}
                               className={`w-16 h-8 rounded-sm p-1 cursor-pointer transition-colors ${isSimulatingPids ? 'bg-sky-500' : 'bg-white/10'}`}
                             >
                                <div className={`w-6 h-6 bg-white rounded-sm shadow-md transition-transform ${isSimulatingPids ? 'translate-x-8' : 'translate-x-0'}`} />
                             </div>
                          </div>
                          <p className="text-[10px] opacity-30 uppercase font-tech">GENERATE_VIRTUAL_TELEMETRY_DATA</p>
                       </div>


                       <div className="mt-4 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                          <div className="flex justify-between items-center mb-4">
                             <span className="text-sm font-black uppercase opacity-50">GPS_FALLBACK</span>
                             <div 
                               onClick={() => setUseGpsFallback(!useGpsFallback)}
                               className={`w-16 h-8 rounded-sm p-1 cursor-pointer transition-colors ${useGpsFallback ? 'bg-emerald-500' : 'bg-white/10'}`}
                             >
                                <div className={`w-6 h-6 bg-white rounded-sm shadow-md transition-transform ${useGpsFallback ? 'translate-x-8' : 'translate-x-0'}`} />
                             </div>
                          </div>
                          <p className="text-[10px] opacity-30 uppercase font-tech">AUTO_SWITCH_TO_GPS_IF_OBD_LOST</p>
                       </div>
                    </div>
                 </div>

                 <div className="glass-panel p-8 lg:p-12 rounded-futuristic flex flex-col gap-8 futuristic-glow cyber-border">
                    <h3 className="text-2xl lg:text-3xl font-black opacity-40 uppercase tracking-[0.5em] flex items-center gap-4 text-white"><Info size={24} /> LINK_STATUS</h3>
                    <div className="flex flex-col gap-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                             <span className="text-[8px] opacity-40 font-black uppercase">GATT_BUSY</span>
                             <span className={`text-sm font-black ${obdService.getDetailedStatus().gattBusy ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {obdService.getDetailedStatus().gattBusy ? 'ACTIVE' : 'IDLE'}
                             </span>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                             <span className="text-[8px] opacity-40 font-black uppercase">POLLING_STATE</span>
                             <span className={`text-sm font-black ${obdService.getDetailedStatus().polling ? 'text-sky-400' : 'text-white/40'}`}>
                                {obdService.getDetailedStatus().polling ? 'TRANSMITTING' : 'WAITING'}
                             </span>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                             <span className="text-[8px] opacity-40 font-black uppercase">ADAPTER_TYPE</span>
                             <span className="text-sm font-black text-white/80">
                                {obdService.getDetailedStatus().adapter}
                             </span>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                             <span className="text-[8px] opacity-40 font-black uppercase">LAST_RX</span>
                             <span className="text-sm font-black text-white/80 tabular-nums">
                                {Math.round(obdService.getDetailedStatus().lastData / 1000)}s AGO
                             </span>
                          </div>
                       </div>

                       <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                          <div className="flex items-center gap-3 mb-2">
                             <div className={`w-2 h-2 rounded-sm ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                             <span className="text-xs font-black uppercase tracking-widest">SYSTEM_INTEGRITY</span>
                          </div>
                          <p className="text-[10px] opacity-40 leading-relaxed uppercase">
                             {connectionStatus === 'connected' 
                               ? 'ALL_SYSTEMS_OPERATIONAL. HIGH_SPEED_DATA_LINK_ESTABLISHED.' 
                               : 'LINK_OFFLINE. ESTABLISH_HARDWARE_CONNECTION_TO_BEGIN.'}
                          </p>
                       </div>
                    </div>
                 </div>

                  {/* Connection Log - Restored */}
                  <ConnectionLog />

                  {/* Equalizer Gain Slider - Back in Settings */}
                  <div className="machined-container p-8 lg:p-12 rounded-[3rem] flex flex-col gap-8">
                     <h3 className="text-2xl lg:text-3xl font-black opacity-40 uppercase tracking-[0.5em] flex items-center gap-4 text-white"><Speaker size={24} /> SONIC_GAIN</h3>
                     
                     <div className="flex flex-col gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/10">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-black uppercase opacity-50">ENABLE_EQUALIZER</span>
                           <button 
                             onClick={() => setEnableEqualizer(!enableEqualizer)}
                             className={`w-16 h-8 rounded-sm transition-colors relative ${enableEqualizer ? 'bg-emerald-500' : 'bg-white/10'}`}
                           >
                              <div className={`absolute top-1 w-6 h-6 rounded-sm bg-white transition-all ${enableEqualizer ? 'left-9' : 'left-1'}`} />
                           </button>
                        </div>
                        <p className="text-[10px] opacity-30 uppercase font-tech">TURN_OFF_FOR_MAXIMUM_PERFORMANCE</p>
                     </div>

                     <div className={`flex flex-col gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/10 transition-opacity ${enableEqualizer ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-black uppercase opacity-50">AUDIO_GAIN</span>
                           <span className="text-2xl font-black text-amber-400 tabular-nums">{audioGain.toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.01" max="5.00" step="0.01" 
                          value={audioGain} 
                          onChange={(e) => setAudioGain(parseFloat(e.target.value))} 
                          className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                        />
                        <p className="text-[10px] opacity-30 uppercase font-tech">ADJUST_MICROPHONE_INPUT_GAIN</p>
                        
                        <div className="flex justify-between items-center mt-4">
                           <span className="text-sm font-black uppercase opacity-50">VISUAL_SENSITIVITY</span>
                           <span className="text-2xl font-black text-amber-400 tabular-nums">{eqSettings.sensitivity.toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.01" max="10.00" step="0.05" 
                          value={eqSettings.sensitivity} 
                          onChange={(e) => setEqSettings(prev => ({ ...prev, sensitivity: parseFloat(e.target.value) }))} 
                          className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                        />
                        <p className="text-[10px] opacity-30 uppercase font-tech">ADJUST_EQUALIZER_RESPONSE_INTENSITY</p>
                     </div>
                  </div>

                  {/* Connection Log Window Removed from here */}


              </div>
            </div>
        )}
      </div>

      {!isFullScreen && (
      <div className="h-[75px] bg-[#050505] border-t border-white/10 w-full flex items-center justify-between px-4 lg:px-8 z-[1000] relative shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          <button 
             onClick={() => {
               setIsFullScreen(true);
               if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => console.log(e));
             }} 
             className="h-[50px] w-[50px] shrink-0 bg-gradient-to-b from-[#2a2a2a] to-[#111111] border-t border-white/20 border-b border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_4px_8px_rgba(0,0,0,0.8)] rounded-xl flex items-center justify-center transition-all active:scale-95 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] hover:bg-white/5 hover:border-white/40"
          >
             <Maximize2 size={24} className="text-white/70" />
          </button>
          
          <div className="flex-1 flex justify-start lg:justify-center gap-2 h-full py-2 items-center mx-2 lg:mx-4 overflow-x-auto overflow-y-hidden no-scrollbar w-full relative touch-pan-x">
             <div className="flex gap-2 min-w-max px-2 w-full lg:w-auto lg:grid lg:grid-cols-6 h-[50px]">
                 <button onClick={() => setCurrentPage('dash')} className={`px-3 lg:px-6 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-[11px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 flex-1 min-w-[110px] lg:min-w-0 ${currentPage === 'dash' ? 'bg-[#1a1a1a] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),_0_0_15px_rgba(56,189,248,0.2)] text-sky-400 border border-sky-500/50' : 'bg-gradient-to-b from-[#2a2a2a] to-[#111111] border-t border-white/20 border-b border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_4px_8px_rgba(0,0,0,0.8)] text-white/70 hover:text-white hover:border-white/30'}`}>
                    <LayoutGrid size={16} /> <span className="pt-0.5">DASH</span>
                 </button>
                 <button onClick={() => setCurrentPage('gauge')} className={`px-3 lg:px-6 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-[11px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 flex-1 min-w-[110px] lg:min-w-0 ${currentPage === 'gauge' ? 'bg-[#1a1a1a] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),_0_0_15px_rgba(251,113,133,0.2)] text-rose-400 border border-rose-500/50' : 'bg-gradient-to-b from-[#2a2a2a] to-[#111111] border-t border-white/20 border-b border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_4px_8px_rgba(0,0,0,0.8)] text-white/70 hover:text-white hover:border-white/30'}`}>
                    <GaugeIcon size={16} /> <span className="pt-0.5">GAUGES</span>
                 </button>
                 <button onClick={() => setCurrentPage('navigation')} className={`px-3 lg:px-6 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-[11px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 flex-1 min-w-[110px] lg:min-w-0 ${currentPage === 'navigation' ? 'bg-[#1a1a1a] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),_0_0_15px_rgba(96,165,250,0.2)] text-blue-400 border border-blue-500/50' : 'bg-gradient-to-b from-[#2a2a2a] to-[#111111] border-t border-white/20 border-b border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_4px_8px_rgba(0,0,0,0.8)] text-white/70 hover:text-white hover:border-white/30'}`}>
                    <MapIcon size={16} /> <span className="pt-0.5">NAV</span>
                 </button>
                 <button onClick={() => setCurrentPage('music')} className={`px-3 lg:px-6 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-[11px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 flex-1 min-w-[110px] lg:min-w-0 ${currentPage === 'music' ? 'bg-[#1a1a1a] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),_0_0_15px_rgba(52,211,153,0.2)] text-emerald-400 border border-emerald-500/50' : 'bg-gradient-to-b from-[#2a2a2a] to-[#111111] border-t border-white/20 border-b border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_4px_8px_rgba(0,0,0,0.8)] text-white/70 hover:text-white hover:border-white/30'}`}>
                    <Music size={16} /> <span className="pt-0.5">DSP</span>
                 </button>
                 <button onClick={() => setCurrentPage('customization')} className={`px-3 lg:px-6 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-[11px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 flex-1 min-w-[110px] lg:min-w-0 ${currentPage === 'customization' ? 'bg-[#1a1a1a] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),_0_0_15px_rgba(251,191,36,0.2)] text-amber-400 border border-amber-500/50' : 'bg-gradient-to-b from-[#2a2a2a] to-[#111111] border-t border-white/20 border-b border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_4px_8px_rgba(0,0,0,0.8)] text-white/70 hover:text-white hover:border-white/30'}`}>
                    <Palette size={16} /> <span className="pt-0.5">TWEAKS</span>
                 </button>
                 <button onClick={() => setCurrentPage('settings')} className={`px-3 lg:px-6 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-[11px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 flex-1 min-w-[110px] lg:min-w-0 ${currentPage === 'settings' ? 'bg-[#1a1a1a] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),_0_0_15px_rgba(192,132,252,0.2)] text-purple-400 border border-purple-500/50' : 'bg-gradient-to-b from-[#2a2a2a] to-[#111111] border-t border-white/20 border-b border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_4px_8px_rgba(0,0,0,0.8)] text-white/70 hover:text-white hover:border-white/30'}`}>
                    <SettingsIcon size={16} /> <span className="pt-0.5">CONFIG</span>
                 </button>
             </div>
          </div>
          
          <div className="flex shrink-0 gap-4 items-center">
              <div className="w-[180px] h-[50px] flex flex-col justify-center px-4 bg-[#111] rounded-xl border border-white/10 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)]">
                 <div className="flex justify-between w-full mb-1 items-center">
                    <Fuel size={14} className="text-white/40" />
                    <span className="text-xs font-black tabular-nums text-white/60">{Math.round(currentData?.fuelLevel || 0)}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner relative">
                    <div 
                      className="h-full transition-all duration-700 ease-out" 
                      style={{ 
                        width: `${currentData?.fuelLevel || 0}%`,
                        background: `linear-gradient(90deg, #ff0000 0%, #ffff00 30%, #00ff00 100%)`,
                        backgroundSize: '200% 100%',
                        backgroundPosition: `${100 - (currentData?.fuelLevel || 0)}% 0%`
                      }} 
                    />
                 </div>
              </div>

              <div className="flex gap-2 h-[50px] items-center bg-[#050505] p-1.5 rounded-xl shadow-[0_0_20px_var(--theme-accent-20),inset_0_0_10px_rgba(0,0,0,0.8)] shrink-0">
                 <button onClick={() => changeTheme(-1)} className="h-full px-5 bg-[var(--theme-accent-20)] hover:bg-[var(--theme-accent)] rounded-lg text-[var(--theme-accent)] hover:text-black transition-all active:scale-95 shadow-[0_0_15px_var(--theme-accent-20)] border-none"><ChevronLeft size={24} strokeWidth={3} /></button>
                 <span className="text-[12px] font-black uppercase text-[var(--theme-accent)] tracking-[0.2em] px-2 text-shadow-glow filter drop-shadow-[0_0_5px_var(--theme-accent)]">SKIN</span>
                 <button onClick={() => changeTheme(1)} className="h-full px-5 bg-[var(--theme-accent-20)] hover:bg-[var(--theme-accent)] rounded-lg text-[var(--theme-accent)] hover:text-black transition-all active:scale-95 shadow-[0_0_15px_var(--theme-accent-20)] border-none"><ChevronRight size={24} strokeWidth={3} /></button>
                 
                 <div className="w-[2px] h-[30px] bg-[var(--theme-accent-20)] mx-1" />
                 <button 
                   onClick={() => setIsDesigningSkin(true)}
                   className="h-full px-5 bg-[var(--theme-accent-20)] hover:bg-[var(--theme-accent)] rounded-lg text-[var(--theme-accent)] hover:text-black transition-all active:scale-95 shadow-[0_0_15px_var(--theme-accent-20)] flex items-center gap-2 group border-none"
                 >
                   <Palette size={20} className="group-hover:animate-pulse" />
                   <span className="font-black text-[10px] uppercase">STUDIO</span>
                 </button>
              </div>
          </div>
      </div>
      )}
      
      {isFullScreen && (
        <>
          <button 
            onClick={() => {
              setIsFullScreen(false);
              if(document.fullscreenElement) document.exitFullscreen().catch(e => console.log(e));
            }} 
            className="absolute top-6 right-6 z-[9999] px-6 py-3 rounded-full flex items-center justify-center gap-3 border shadow-[0_0_40px_rgba(239,68,68,0.2)] active:scale-95 group border-red-500/20 hover:border-red-400 bg-black/60 hover:bg-red-500/20 backdrop-blur-2xl transition-all duration-300"
          >
            <Minimize2 size={20} className="text-red-400 group-hover:text-red-300" />
            <span className="text-sm font-black text-red-400 group-hover:text-red-300 tracking-[0.2em] uppercase">Exit HUD</span>
          </button>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-gradient-to-b from-[#111] to-[#000] backdrop-blur-3xl px-8 py-4 rounded-full border-t border-x border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.05)] opacity-40 hover:opacity-100 transition-opacity duration-500 group/skinbar ring-1 ring-black">
             <button onClick={() => changeTheme(-1)} className="w-[80px] h-[50px] rounded-l-full flex items-center justify-center border-r border-white/5 hover:bg-white/10 transition-all active:scale-95 group active:shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] overflow-hidden relative">
                <ChevronLeft size={28} className="text-white/40 group-hover:text-white transition-colors" />
             </button>
             <div className="flex flex-col items-center justify-center px-8 min-w-[200px]">
                <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] leading-none text-white/50 mb-1.5">MBUX / OS OVERRIDE</span>
                <span className="text-[16px] font-black uppercase tracking-[0.3em] leading-none text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-colors" style={{ color: activeTheme.primaryColor }}>{activeTheme.name.replace(/_/g, ' ')}</span>
             </div>
             <button onClick={() => changeTheme(1)} className="w-[80px] h-[50px] rounded-r-full flex items-center justify-center border-l border-white/5 hover:bg-white/10 transition-all active:scale-95 group active:shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] overflow-hidden relative">
                <ChevronRight size={28} className="text-white/40 group-hover:text-white transition-colors" />
             </button>
          </div>
        </>
      )}

      {isDesigningSkin && (
        <SkinDesigner 
          initialTheme={activeTheme}
          onSave={saveCustomTheme}
          onClose={() => {
             setIsDesigningSkin(false);
             setPreviewDesignTheme(null);
          }}
          onPreviewPreview={(t) => setPreviewDesignTheme(t)}
        />
      )}

      {/* WiFi Connection Dialog */}
      {showWifiDialog && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowWifiDialog(false)} />
          <div className="machined-container p-12 rounded-[3rem] w-full max-w-2xl relative z-10 flex flex-col gap-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black uppercase tracking-widest text-white flex items-center gap-4">
                <Wifi className="text-sky-400" /> WIFI_CONNECTION_SETUP
              </h3>
              <button onClick={() => setShowWifiDialog(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={32} />
              </button>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl flex gap-4 items-start">
              <AlertTriangle className="text-amber-400 shrink-0" size={24} />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-amber-400 uppercase">BROWSER_LIMITATION_NOTICE</span>
                <p className="text-[10px] text-amber-200/60 leading-relaxed uppercase">
                  DIRECT TCP/UDP CONNECTIONS ARE RESTRICTED BY MODERN BROWSERS. TO CONNECT VIA WIFI, ENSURE YOUR ADAPTER SUPPORTS WEBSOCKETS OR USE A WEBSOCKET-TO-TCP PROXY BRIDGE.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {!isScanningWifi ? (
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex flex-col items-center gap-6 group hover:border-sky-500/30 transition-all cursor-pointer" onClick={() => {
                  setIsScanningWifi(true);
                  setTimeout(() => setIsScanningWifi(false), 3000);
                }}>
                  <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform">
                    <Search className="text-sky-400" size={32} />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-black uppercase tracking-widest">SCAN_FOR_NETWORKS</span>
                    <span className="text-[10px] opacity-40 uppercase">SEARCH_FOR_WICAN_OBDII_ADAPTER</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-sky-500/30 p-8 rounded-[2rem] flex flex-col items-center gap-6 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-sky-500 animate-[marquee_2s_linear_infinite]" />
                  <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20 animate-pulse">
                    <Wifi className="text-sky-400" size={32} />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-black uppercase tracking-widest text-sky-400">ANALYZING_SPECTRUM...</span>
                    <span className="text-[10px] opacity-60 uppercase animate-pulse">DETECTING_LOCAL_OBDII_WLAN</span>
                  </div>
                  <div className="grid grid-cols-1 w-full gap-2 opacity-40">
                     <div className="h-12 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
                     <div className="h-12 bg-white/5 rounded-xl border border-white/5 animate-pulse" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase">OR_MANUAL_CONFIGURATION</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">IP_ADDRESS</label>
                  <input 
                    type="text" 
                    value={wifiIp} 
                    onChange={(e) => setWifiIp(e.target.value)}
                    className="bg-white/5 border border-white/10 p-5 rounded-2xl text-xl font-mono text-white outline-none focus:border-sky-500/50 transition-all"
                    placeholder="192.168.4.1"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">PORT</label>
                  <input 
                    type="text" 
                    value={wifiPort} 
                    onChange={(e) => setWifiPort(e.target.value)}
                    className="bg-white/5 border border-white/10 p-5 rounded-2xl text-xl font-mono text-white outline-none focus:border-sky-500/50 transition-all"
                    placeholder="81"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowWifiDialog(false);
                handleConnectHardware('WIFI', wifiIp, wifiPort, forcedProtocol);
              }}
              className="w-full p-8 bg-sky-500 rounded-[2rem] text-white font-black text-2xl uppercase italic hover:bg-sky-400 transition-all shadow-2xl shadow-sky-500/20 active:scale-95"
            >
              ESTABLISH_WIFI_LINK
            </button>
            
            <div className="flex flex-col gap-2 items-center">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">DEFAULT_WICAN_PRO_SETTINGS</span>
              <span className="text-[10px] font-mono text-sky-400/40">IP: 192.168.4.1 | PORT: 81</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{ icon: any, active: boolean, onClick: () => void }> = ({ icon: Icon, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-500 transform relative overflow-hidden group active:scale-90 ${active ? 'text-white scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3),inset_0_0_15px_rgba(255,255,255,0.2)] border-2 border-white/80' : 'bg-black/40 text-white/40 hover:text-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1),inset_0_0_10px_rgba(255,255,255,0.1)] border border-white/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]'}`}
  >
    {/* Rotating Border Glow for Active State */}
    {active && (
      <div className="absolute inset-[-50%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.8)_360deg)] pointer-events-none" />
    )}
    
    {/* Inner Background */}
    <div className={`absolute inset-[2px] rounded-full transition-colors duration-500 ${active ? 'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md' : 'bg-transparent'} pointer-events-none`} />

    <div className={`absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-150 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)] pointer-events-none`} />
    
    {active && (
      <>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-scanline pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 blur-[30px] rounded-full pointer-events-none" />
      </>
    )}
    <Icon size={18} strokeWidth={1.5} className={`relative z-10 transition-all duration-500 group-active:text-white group-active:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] ${active ? 'scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'group-hover:scale-110 group-active:scale-95 group-active:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]'}`} />
    <div className={`absolute bottom-1 w-1 h-1 rounded-full transition-all duration-500 z-10 ${active ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,1)] scale-150' : 'bg-white/30 scale-0 group-active:bg-white group-active:shadow-[0_0_20px_rgba(255,255,255,0.5)] group-active:scale-100'}`} />
  </button>
);

export default App;
