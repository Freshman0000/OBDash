
import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig, StereoTheme } from '../types';
import { STEREO_THEMES } from '../constants';
import { audioService } from '../services/audioService';
import { ChevronLeft, ChevronRight, Mic, AudioLines, Layers, Zap } from 'lucide-react';

interface EqualizerProps {
  appTheme: ThemeConfig;
  mini?: boolean;
  gain?: number;
  forcedThemeIndex?: number;
  onThemeCycle?: () => void;
  onSetTheme?: (idx: number) => void;
  isAudioInitialized?: boolean;
  onInit?: () => void;
  isActive?: boolean;
  lowRes?: boolean;
  settings?: {
    sensitivity: number;
    decay: number;
    fluidity: number;
  };
}

export const Equalizer: React.FC<EqualizerProps> = ({ 
    mini = false, 
    gain = 1.0,
    forcedThemeIndex, 
    onSetTheme, 
    isAudioInitialized = false, 
    onInit,
    isActive = true,
    lowRes = false,
    settings = { sensitivity: 1.0, decay: 0.5, fluidity: 0.5 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const effectiveThemeIndex = forcedThemeIndex !== undefined ? forcedThemeIndex : 0;
  const activeStereo = STEREO_THEMES[effectiveThemeIndex];
  
  const themeRef = useRef(effectiveThemeIndex);
  useEffect(() => {
    themeRef.current = effectiveThemeIndex;
  }, [effectiveThemeIndex]);

  // Optimized for performance on Android head units
  const BAR_COUNT = 72;
  const peaksRef = useRef<Float32Array>(new Float32Array(72)); 
  const currentHeightsRef = useRef<Float32Array>(new Float32Array(72)); 
  const signalMaxRef = useRef<number>(64);

  const handleInit = async () => {
    const success = await audioService.initialize();
    if (success) {
      audioService.resume();
      onInit?.();
    }
  };

  const gradientCacheRef = useRef<{ height: number, gradient: CanvasGradient } | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { 
      alpha: false, 
      desynchronized: true 
    }); 
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    // Premium bezel padding
    const verticalPadding = canvasHeight * (mini ? 0.08 : 0.04); 
    const height = canvasHeight - (verticalPadding * 2);
    const startY = verticalPadding;

    // Pure Black Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, canvasHeight);
    
    if (!isActive) {
      animationRef.current = requestAnimationFrame(draw);
      return; // Stop animation loop to save CPU
    }
    
    // Sample optimization: check fewer bins
    const analyser = audioService.getAnalyser();
    const dataArray = audioService.getDataArray();
    
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        let frameMax = 0;
        // Sample optimization: check fewer bins
        for (let i = 0; i < dataArray.length; i += 16) {
          if (dataArray[i] > frameMax) frameMax = dataArray[i];
        }
        signalMaxRef.current = signalMaxRef.current * 0.85 + Math.max(32, frameMax) * 0.15;
      } else if (dataArray) {
        dataArray.fill(0);
      }

      const barTotalWidth = width / BAR_COUNT;
      const fftSize = dataArray?.length || 512;
      
      const sCount = activeStereo.segmentCount || 12; 
      const segHeight = height / sCount;
      const spacing = activeStereo.doubleBars ? 3 : 6; // Tighter spacing for double bars
      const barWidthActual = Math.max(4, barTotalWidth - spacing);

      // Pre-calculate common values
      const activeColor = activeStereo.barColor;
      const peakColor = activeStereo.peakColor;
      const isDotMatrix = activeStereo.style === 'dot-matrix';
      const isVfd = activeStereo.style === 'vfd-80s';
      const isLcd = activeStereo.style === 'segment-lcd';
      const hw = activeStereo.hardwareStyle;

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1.0;

      // Batch drawing operations
      ctx.beginPath();
      for (let i = 0; i < BAR_COUNT; i++) {
        const normalizedPos = i / BAR_COUNT;
        const minLogIdx = 2;
        const maxLogIdx = fftSize * 0.8; 
        const dataIndex = Math.floor(minLogIdx + (maxLogIdx - minLogIdx) * Math.pow(normalizedPos, 1.8));
        
        const rawVal = dataArray ? dataArray[Math.min(dataIndex, fftSize - 1)] : 0;
        
        // Increase base sensitivity and add high variance flutter/jitter similar to analog peak meters
        const baseSensitivity = 3.5 * settings.sensitivity; 
        const flutter = (Math.random() * 0.15) * (rawVal / 255);
        
        const targetVal = Math.min(1.0, ((rawVal / (signalMaxRef.current || 1)) * baseSensitivity) + flutter);
        
        // Enhance fluidity - faster rise, slower decay with slight randomness
        const baseEasing = 0.5 + Math.random() * 0.1; 
        const easing = targetVal > currentHeightsRef.current[i] ? 0.95 : baseEasing; 
        currentHeightsRef.current[i] += (targetVal - currentHeightsRef.current[i]) * easing; 
      
      const val = currentHeightsRef.current[i];
      const x = i * barTotalWidth;
      
      // Skip drawing if value is negligible
      if (val <= 0.01) continue;

      if (hw === 'mcintosh' || hw === 'nakamichi' || (!isDotMatrix && !isVfd && !isLcd && hw !== 'winamp')) {
          const barHeight = val * height;
          ctx.rect(x + spacing/2, startY + height - barHeight, barWidthActual, barHeight);
      } else {
          const currentSegments = Math.floor(val * sCount);
          if (currentSegments > 0) {
              const drawHeight = currentSegments * segHeight;
              ctx.rect(x + spacing/2, startY + height - drawHeight + 1, barWidthActual, drawHeight);
          }
      }
    }
    
    // Apply gradient if needed
    if (activeStereo.useGradient || hw === 'winamp') {
        if (!gradientCacheRef.current || gradientCacheRef.current.height !== height) {
            const gradient = ctx.createLinearGradient(0, startY + height, 0, startY);
            if (hw === 'winamp') {
                gradient.addColorStop(0, '#00FF00');
                gradient.addColorStop(0.6, '#00FF00');
                gradient.addColorStop(0.8, '#FFFF00');
                gradient.addColorStop(1, '#FF0000');
            } else {
                gradient.addColorStop(0, activeColor);
                gradient.addColorStop(0.6, activeColor);
                gradient.addColorStop(0.8, '#ffff00');
                gradient.addColorStop(1, '#ff0000');
            }
            gradientCacheRef.current = { height, gradient };
        }
        ctx.fillStyle = gradientCacheRef.current.gradient;
    } else {
        ctx.fillStyle = activeColor;
    }

    // Apply glow (reduced for performance)
    if (!lowRes) {
        ctx.shadowBlur = (activeStereo.glowIntensity || 1) * (hw === 'mcintosh' ? 15 : 8);
        ctx.shadowColor = activeColor;
    }
    ctx.fill();

    // Reset shadow for black lines
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Draw black lines for segments
    if (!(hw === 'mcintosh' || hw === 'nakamichi' || (!isDotMatrix && !isVfd && !isLcd && hw !== 'winamp'))) {
      ctx.beginPath();
      for (let i = 0; i < BAR_COUNT; i++) {
        const val = currentHeightsRef.current[i];
        if (val <= 0.01) continue;
        const currentSegments = Math.floor(val * sCount);
        const x = i * barTotalWidth;
        for (let s = 1; s < currentSegments; s++) {
            ctx.rect(x + spacing/2, startY + height - s * segHeight, barWidthActual, hw === 'winamp' ? 2 : 1);
        }
      }
      // Use source-over to draw black lines over the glowing bars
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000000';
      ctx.fill();
    }
    
    // Peak Tracking - Falloff feature
    if (!activeStereo.doubleBars || hw === 'winamp') {
      ctx.beginPath();
      for (let i = 0; i < BAR_COUNT; i++) {
        const val = currentHeightsRef.current[i];
        const currentY = val * height;
        const decayConstant = (mini ? 1.5 : 1.0) * (1.5 - settings.decay); 
        peaksRef.current[i] = currentY > peaksRef.current[i] ? currentY : Math.max(0, peaksRef.current[i] - decayConstant);
        
        if (peaksRef.current[i] > 2) {
          const x = i * barTotalWidth;
          // Winamp peak blocks are slightly thicker and snap to segments
          if (hw === 'winamp') {
             const peakSegs = Math.floor((peaksRef.current[i] / height) * sCount);
             const peakY = peakSegs * segHeight;
             ctx.rect(x + spacing/2, startY + height - peakY - segHeight + 1, barWidthActual, segHeight - 2);
          } else {
             ctx.rect(x + spacing/2, startY + height - peaksRef.current[i] - 2, barWidthActual, 2);
          }
        }
      }
      if (!lowRes) {
          ctx.shadowBlur = (activeStereo.glowIntensity || 1) * 5;
          ctx.shadowColor = hw === 'winamp' ? '#FFFFFF' : peakColor;
      }
      ctx.fillStyle = hw === 'winamp' ? '#FFFFFF' : peakColor;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
    
    animationRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = rect.width * dpr; 
        canvasRef.current.height = rect.height * dpr;
        const ctx = canvasRef.current.getContext('2d'); 
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.imageSmoothingEnabled = false;
        }
      }
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    handleResize();
    
    // Attempt auto-initialization on mount
    if (!isAudioInitialized) {
        handleInit();
    }

    if (isAudioInitialized && isActive) animationRef.current = requestAnimationFrame(draw);
    return () => { 
      resizeObserver.disconnect(); 
      if (animationRef.current) cancelAnimationFrame(animationRef.current); 
    };
  }, [isAudioInitialized, effectiveThemeIndex, mini, gain, settings, isActive]);

  return (
    <div ref={containerRef} className="absolute inset-0 flex flex-col bg-[#050505] overflow-hidden font-micro pointer-events-auto">
      {/* Hardware Frame / Bezel */}
      <div className="absolute inset-0 border-[12px] border-[#1a1a1a] rounded-[3.5rem] z-30 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
      <div className="absolute inset-2 border border-transparent rounded-[3rem] z-30 pointer-events-none" />

      <div className="absolute inset-4 bg-black rounded-[2.5rem] overflow-hidden z-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]">
        {/* Display Window Glass Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] z-10 pointer-events-none opacity-40" />
        
        {/* Intricate Grid Overlay */}
        <div className="absolute inset-0 z-[5] opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {!isAudioInitialized ? (
          <div className="w-full h-full flex items-center justify-center bg-black/95 backdrop-blur-2xl">
            <button 
              onClick={handleInit}
              className="flex flex-col items-center gap-6 group cursor-pointer"
            >
               <div className="p-10 rounded-sm bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:scale-110 transition-all shadow-4xl">
                 <AudioLines size={mini ? 42 : 80} className="text-white group-hover:text-sky-400 transition-colors" />
               </div>
               <div className="text-[10px] font-bold opacity-30 uppercase tracking-[0.5em] group-hover:opacity-100 transition-opacity">CLICK_TO_INITIALIZE_AUDIO_CORE</div>
            </button>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full pointer-events-none block" />
            <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          </div>
        )}
      </div>

      {/* Hardware Labels and Controls */}
      <div className="absolute top-8 left-10 right-10 flex justify-between z-[500] pointer-events-none items-center">
         <div className={`flex flex-col pointer-events-auto bg-black/80 p-1.5 lg:p-2 rounded-lg border border-white/10 backdrop-blur-3xl shadow-2xl transition-all hover:bg-black group ring-1 ring-white/5`}>
            <div className="flex items-center gap-1 mb-0.5">
               <span className={`font-bold tracking-[0.2em] opacity-30 uppercase text-white ${mini ? 'text-[3px]' : 'text-[4px]'}`}>
                  {activeStereo.dspProfile}_DATA
               </span>
            </div>
            <h2 className={`font-bold uppercase tracking-tighter text-white drop-shadow-2xl leading-none flex items-center gap-1.5 truncate max-w-[100px] ${mini ? 'text-[9px]' : 'text-[10px]'}`}>
                {activeStereo.name}
                <div className="w-1 h-1 bg-emerald-500 rounded-sm shadow-[0_0_5px_#10b981] shrink-0" />
            </h2>
         </div>

         {/* Theme Switcher Buttons */}
         {onSetTheme && (
           <div className="flex gap-2 pointer-events-auto">
             <button 
               onClick={() => onSetTheme((effectiveThemeIndex - 1 + STEREO_THEMES.length) % STEREO_THEMES.length)}
               className="w-10 h-10 rounded-xl bg-black/80 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-2xl ring-1 ring-white/5"
             >
               <ChevronLeft size={20} />
             </button>
             <button 
               onClick={() => onSetTheme((effectiveThemeIndex + 1) % STEREO_THEMES.length)}
               className="w-10 h-10 rounded-xl bg-black/80 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-2xl ring-1 ring-white/5"
             >
               <ChevronRight size={20} />
             </button>
           </div>
         )}
      </div>

      {/* Bottom Hardware Details */}
      <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center z-40 opacity-30 pointer-events-none">
         <div className="flex gap-6">
            <div className="flex flex-col"><span className="text-[7px] font-bold">L-CH</span><div className="w-16 h-0.5 bg-white/20"></div></div>
            <div className="flex flex-col"><span className="text-[7px] font-bold">R-CH</span><div className="w-16 h-0.5 bg-white/20"></div></div>
         </div>
         <span className="text-[8px] font-bold tracking-[0.5em] uppercase">HIGH_FIDELITY_COMPONENTS</span>
      </div>

      {activeStereo.scanlineEffect && (
        <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03] bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_1px,transparent_1px,transparent_2px)]" />
      )}
    </div>
  );
};
