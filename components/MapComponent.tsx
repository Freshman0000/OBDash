import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ThemeConfig, NavigationState } from '../types';
import { Layers, Navigation2, Navigation as NavIcon, CornerUpRight, CornerUpLeft, ArrowUp } from 'lucide-react';

// Fix Leaflet icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const MAP_STYLES = [
  { id: 'night', name: 'NIGHT', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', description: 'HIGH_CONTRAST_DARK' },
  { id: 'day', name: 'DAY', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', description: 'HIGH_CONTRAST_LIGHT' },
  { id: 'satellite', name: 'SATELLITE', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', description: 'REAL_WORLD_IMAGERY' },
  { id: 'topo', name: '3D TOPO', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', description: 'TERRAIN_ELEVATION' },
  { id: 'voyager', name: 'VOYAGER', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', description: 'DETAILED_STREETS' },
  { id: 'positron', name: 'POSITRON', url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', description: 'MINIMAL_CLEAN' }
];

const MapUpdater: React.FC<{ center?: [number, number], zoom?: number, bounds?: L.LatLngBoundsExpression, is3D?: boolean, isOverview?: boolean }> = ({ center, zoom, bounds, is3D, isOverview }) => {
  const map = useMap();
  const lastCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    // Safety check for bounds
    if (bounds && bounds instanceof L.LatLngBounds && bounds.isValid()) {
      try {
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
        lastCenter.current = center || null;
        return;
      } catch (e) {
        console.error("Leaflet flyToBounds error:", e);
      }
    }

    // Safety check for center - ensure it's a valid LatLng array
    if (center && Array.isArray(center) && center.length === 2 &&
        typeof center[0] === 'number' && !isNaN(center[0]) && isFinite(center[0]) && 
        typeof center[1] === 'number' && !isNaN(center[1]) && isFinite(center[1])) {
      let shouldAnimate = false;
      if (lastCenter.current && Array.isArray(lastCenter.current) && lastCenter.current.length === 2) {
        const dLat = Math.abs(center[0] - lastCenter.current[0]);
        const dLng = Math.abs(center[1] - lastCenter.current[1]);
        if (dLat > 0.01 || dLng > 0.01) {
          shouldAnimate = true;
        }
      } else {
        shouldAnimate = true;
      }

      try {
        const currentZoom = map.getZoom();
        const targetZoom = (typeof zoom === 'number' && !isNaN(zoom) && isFinite(zoom)) ? zoom : currentZoom;
        
        if (shouldAnimate) {
          map.flyTo(center as L.LatLngExpression, targetZoom, { animate: true, duration: 0.5 });
        } else {
          map.panTo(center as L.LatLngExpression, { animate: true, duration: 0.1, easeLinearity: 1 });
          if (targetZoom !== currentZoom) {
            map.setZoom(targetZoom, { animate: true });
          }
        }
        lastCenter.current = center;
      } catch (e) {
        console.error("Leaflet panTo/flyTo error:", e);
      }
    }
  }, [center, zoom, bounds, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [is3D, isOverview, map]);

  return null;
};

interface MapComponentProps {
  theme: ThemeConfig;
  navState: NavigationState;
  coords: { lat: number; lng: number } | null;
  heading: number;
  routeCoordinates: [number, number][];
  isOverview?: boolean;
  mini?: boolean;
  onMapStyleChange?: (index: number) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ theme, navState, coords, heading, routeCoordinates, isOverview = false, mini = false, onMapStyleChange }) => {
  const [localMapStyleIndex, setLocalMapStyleIndex] = useState(0);
  const mapStyleIndex = navState.mapStyleIndex !== undefined ? navState.mapStyleIndex : localMapStyleIndex;
  const [is3D, setIs3D] = useState(true);
  const currentStyle = MAP_STYLES[mapStyleIndex];
  
  const mapCenter: [number, number] = useMemo(() => {
    // Check navState destination first (if not in overview mode)
    if (!isOverview && navState.isNavigating && navState.destination) {
      const dest = navState.destination;
      if (typeof dest.lat === 'number' && !isNaN(dest.lat) && isFinite(dest.lat) &&
          typeof dest.lng === 'number' && !isNaN(dest.lng) && isFinite(dest.lng)) {
        return [dest.lat, dest.lng];
      }
    }

    // Fallback to current vehicle position
    if (coords && typeof coords.lat === 'number' && !isNaN(coords.lat) && isFinite(coords.lat) && 
        typeof coords.lng === 'number' && !isNaN(coords.lng) && isFinite(coords.lng)) {
      return [coords.lat, coords.lng];
    }
    
    return [40.7128, -74.0060]; // Default fallback to NY
  }, [coords?.lat, coords?.lng, isOverview, navState.destination]);

  const overviewZoom = useMemo(() => {
    return navState.isNavigating ? (mini ? 15 : 17) : (mini ? 14 : 15);
  }, [navState.isNavigating, mini]);

  const initialCenter: [number, number] = useMemo(() => {
    if (Array.isArray(mapCenter) && mapCenter.length === 2 && 
        !isNaN(mapCenter[0]) && !isNaN(mapCenter[1])) {
      return mapCenter;
    }
    return [40.7128, -74.0060];
  }, [mapCenter]);
  
  const routeBounds = useMemo(() => {
    if (isOverview && routeCoordinates && routeCoordinates.length > 0) {
      const validCoords = routeCoordinates.filter(c => 
        c && Array.isArray(c) && 
        typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) && 
        typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1])
      );
      if (validCoords.length > 0) {
        try {
          return L.latLngBounds(validCoords as L.LatLngExpression[]);
        } catch (e) {
          return undefined;
        }
      }
    }
    return undefined;
  }, [isOverview, routeCoordinates]);

  // Bounds for PA, NJ, NY, DE
  const regionBounds: L.LatLngBoundsExpression = [
    [38.4, -80.5], // SouthWest
    [45.0, -71.8]  // NorthEast
  ];

  const getTurnIcon = (instruction: string) => {
    const lower = instruction.toLowerCase();
    if (lower.includes('left')) return <CornerUpLeft size={mini ? 20 : 60} />;
    if (lower.includes('right')) return <CornerUpRight size={mini ? 20 : 60} />;
    if (lower.includes('straight') || lower.includes('continue')) return <ArrowUp size={mini ? 20 : 60} />;
    return <NavIcon size={mini ? 20 : 60} />;
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#000] shadow-inner flex-1 font-micro group">
      <div className={`absolute inset-0 opacity-100 z-0 ${(navState.isNavigating && !isOverview && is3D) ? 'perspective-map' : ''}`}
           style={{ 
             perspective: (navState.isNavigating && !isOverview && is3D) ? '1000px' : 'none',
             transformStyle: 'preserve-3d',
             transition: 'perspective 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
           }}>
        <div className="absolute"
             style={{
               top: (navState.isNavigating && !isOverview && is3D) ? '-320%' : '0',
               left: (navState.isNavigating && !isOverview && is3D) ? '-250%' : '0',
               width: (navState.isNavigating && !isOverview && is3D) ? '600%' : '100%',
               height: (navState.isNavigating && !isOverview && is3D) ? '700%' : '100%',
               transform: (navState.isNavigating && !isOverview && is3D) 
                 ? `rotateX(82deg) rotateZ(${-heading}deg) translateY(20%) scale(2.2)` 
                 : 'none',
               transformOrigin: '50% 65%',
               transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
             }}>
          <MapContainer 
            center={initialCenter} 
            zoom={overviewZoom} 
            scrollWheelZoom={false} 
            zoomControl={false}
            maxBounds={regionBounds}
            maxBoundsViscosity={1.0}
            minZoom={6}
            className="w-full h-full"
            style={{ height: '100%', width: '100%', background: '#000' }}
          >
            <TileLayer key={currentStyle.id} url={currentStyle.url} />
            {routeCoordinates && routeCoordinates.length > 0 && (
              <>
                {/* 3D Drop shadow for route */}
                <Polyline positions={routeCoordinates.filter(c => c && typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) && typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1])).map(c => [c[0] - 0.0001, c[1] + 0.0001])} color="#000000" weight={mini ? 22 : 36} opacity={0.4} lineCap="round" lineJoin="round" />
                
                <Polyline positions={routeCoordinates.filter(c => c && typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) && typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1]))} color="#000000" weight={mini ? 18 : 26} opacity={0.8} lineCap="round" lineJoin="round" />
                <Polyline positions={routeCoordinates.filter(c => c && typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) && typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1]))} color="#8b5cf6" weight={mini ? 12 : 20} opacity={0.9} lineCap="round" lineJoin="round" />
                <Polyline positions={routeCoordinates.filter(c => c && typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) && typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1]))} color="#c084fc" weight={mini ? 6 : 10} opacity={1} lineCap="round" lineJoin="round" />
                <Polyline positions={routeCoordinates.filter(c => c && typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) && typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1]))} color="#ffffff" weight={mini ? 2 : 4} opacity={0.9} dashArray="12, 24" lineCap="round" lineJoin="round" className="animate-[dash_1s_linear_infinite]" />
              </>
            )}
            {isOverview && coords && typeof coords.lat === 'number' && !isNaN(coords.lat) && isFinite(coords.lat) && typeof coords.lng === 'number' && !isNaN(coords.lng) && isFinite(coords.lng) && (
              <Marker position={[coords.lat, coords.lng]} icon={L.divIcon({
                className: 'custom-vehicle-marker',
                html: `<div style="width: 24px; height: 24px; background: #a855f7; border: 3px solid white; border-radius: 50%; box-shadow: 0 5px 15px rgba(0,0,0,0.8), 0 0 20px rgba(168,85,247,0.8); animation: pulse-digital 2s infinite alternate;"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })} />
            )}
            {isOverview && navState.destination && typeof navState.destination.lat === 'number' && !isNaN(navState.destination.lat) && isFinite(navState.destination.lat) && typeof navState.destination.lng === 'number' && !isNaN(navState.destination.lng) && isFinite(navState.destination.lng) && (
              <Marker position={[navState.destination.lat, navState.destination.lng]} icon={L.divIcon({
                className: 'custom-dest-marker',
                html: `<div style="position: relative; width: 32px; height: 32px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 5px 15px rgba(0,0,0,0.8), 0 0 20px rgba(59,130,246,0.8); display: flex; align-items: center; justify-content: center;"><div style="width: 12px; height: 12px; background: white; border-radius: 50%;"></div></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })} />
            )}
            <MapUpdater center={mapCenter} zoom={overviewZoom} bounds={routeBounds} is3D={is3D} isOverview={isOverview} />
          </MapContainer>
        </div>
        <div className={`absolute inset-x-0 bottom-0 top-[15%] bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-[1001] ${(!isOverview && is3D && navState.isNavigating) ? '' : 'hidden'}`} />
        <div className={`absolute inset-x-0 top-0 bottom-[85%] bg-gradient-to-b from-[#02040a] via-[#050a14] to-transparent pointer-events-none z-[1000] ${(!isOverview && is3D && navState.isNavigating) ? '' : 'hidden'}`} />
        <div className={`absolute inset-x-0 top-0 bottom-[82%] pointer-events-none z-[1001] ${(!isOverview && is3D && navState.isNavigating) ? '' : 'hidden'}`} style={{ background: `radial-gradient(circle at 50% 100%, ${theme.primaryColor}20 0%, transparent 70%)` }} />
        <div className={`absolute inset-x-0 top-[18%] h-[3px] bg-sky-500/60 shadow-[0_0_30px_rgba(14,165,233,1)] pointer-events-none z-[1002] ${(!isOverview && is3D && navState.isNavigating) ? '' : 'hidden'}`} />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-[1002]" />
      </div>

      <div className={`absolute ${navState.isNavigating ? (mini ? 'top-20' : 'top-32') : 'top-4'} ${mini ? 'right-2' : 'right-4'} z-[100] flex flex-col gap-2 opacity-70 hover:opacity-100 transition-opacity`}>
        {/* Compass */}
        <div className="w-10 h-10 bg-black/80 rounded-sm border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl relative overflow-hidden ring-1 ring-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="relative w-full h-full flex items-center justify-center" style={{ transform: `rotate(${-heading}deg)`, transition: 'transform 1.2s linear' }}>
            <div className="absolute top-0.5 text-[8px] font-black text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">N</div>
            <div className="absolute bottom-0.5 text-[8px] font-black text-white/50">S</div>
            <div className="absolute right-1 text-[8px] font-black text-white/50">E</div>
            <div className="absolute left-1 text-[8px] font-black text-white/50">W</div>
            <div className="w-1 h-1 rounded-sm bg-white/30 shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            const nextIndex = (mapStyleIndex + 1) % MAP_STYLES.length;
            setLocalMapStyleIndex(nextIndex);
            if (onMapStyleChange) onMapStyleChange(nextIndex);
          }}
          className="bg-black/80 hover:bg-black backdrop-blur-2xl border border-white/10 p-2.5 rounded-xl transition-all flex items-center justify-center shadow-2xl ring-1 ring-white/5 pointer-events-auto w-10 h-10"
        >
          <Layers size={16} className="text-white/70" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIs3D(!is3D);
          }}
          className="bg-black/80 hover:bg-black backdrop-blur-2xl border border-white/10 p-2.5 rounded-xl transition-all flex items-center justify-center shadow-2xl ring-1 ring-white/5 pointer-events-auto w-10 h-10"
        >
          <span className="text-[9px] font-black text-white tracking-widest uppercase">{is3D ? '2D' : '3D'}</span>
        </button>
      </div>

      {!isOverview && (
        <div className={`absolute ${navState.isNavigating ? 'top-[75%]' : 'top-1/2'} left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] transition-all duration-1000`}>
          <div className={`${mini ? 'w-12 h-12' : 'w-24 h-24'} flex items-center justify-center drop-shadow-[0_0_20px_rgba(59,130,246,0.9)]`} style={{ transform: `rotate(${(navState.isNavigating && is3D) ? 0 : heading}deg)`, transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div className="relative w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] relative z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                <defs>
                   <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#ffffff" />
                     <stop offset="100%" stopColor="#3b82f6" />
                   </linearGradient>
                </defs>
                <path d="M50,5 L95,90 L50,75 L5,90 Z" fill="url(#arrowGrad)" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
                <path d="M50,15 L80,80 L50,70 L20,80 Z" fill="#ffffff" opacity="0.9" />
                <line x1="50" y1="15" x2="50" y2="70" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {navState.isNavigating && (
        <>
          <div className={`absolute ${mini ? 'top-2 left-2 right-2' : 'top-8 left-1/2 -translate-x-1/2 w-[850px] max-w-[95vw]'} z-[100] flex flex-col gap-3`}>
            <div className={`flex items-center gap-6 bg-[#006633]/95 backdrop-blur-2xl text-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.2)] border border-white/20 ${mini ? 'p-2' : 'p-6'}`}>
              <div className={`${mini ? 'w-10 h-10' : 'w-24 h-24'} flex items-center justify-center bg-black/30 rounded-[1.5rem] border border-white/10 shadow-inner`}>
                {getTurnIcon(navState.instruction || '')}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className={`${mini ? 'text-lg' : 'text-6xl'} font-black tracking-tighter leading-none drop-shadow-md`}>
                  {navState.upcomingManeuvers?.[0]?.distance || navState.distanceRemaining}
                </span>
                <span className={`${mini ? 'text-[10px]' : 'text-2xl'} font-bold text-white/90 truncate leading-none mt-2 uppercase tracking-widest`}>
                  {navState.instruction.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            
            {/* Next Upcoming Maneuvers */}
            {navState.upcomingManeuvers && navState.upcomingManeuvers.length > 1 && !mini && (
              <div className="bg-black/80 backdrop-blur-xl rounded-[2rem] p-5 border border-white/10 shadow-2xl flex flex-col gap-4 w-[450px] mt-2 self-start">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-1">
                  <Layers size={16} className="text-sky-400" />
                  <span className="text-xs font-black text-white/50 tracking-[0.2em] uppercase">Step-by-Step</span>
                </div>
                {navState.upcomingManeuvers.slice(1, 4).map((m, i) => (
                  <div key={i} className="flex items-center gap-5">
                    <div className="w-10 h-10 flex items-center justify-center text-white/90 bg-white/10 rounded-xl border border-white/10 shrink-0">
                      {getTurnIcon(m.instruction)}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-lg font-black text-white/90 leading-none">{m.distance}</span>
                      <span className="text-sm font-bold text-white/60 truncate uppercase tracking-wider mt-1">{m.instruction.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`absolute ${mini ? 'bottom-2 left-2 right-2' : 'bottom-10 left-10 right-10'} z-[100] flex justify-between items-end ${mini ? 'gap-2' : 'gap-6'}`}>
            <div className={`flex-1 bg-black/80 backdrop-blur-2xl text-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15 flex flex-col justify-center ${mini ? 'p-3' : 'p-8'}`}>
              <div className="flex items-baseline gap-4">
                <span className={`${mini ? 'text-xl' : 'text-6xl'} font-black text-green-500 leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]`}>{navState.timeRemaining}</span>
                <span className={`${mini ? 'text-xs' : 'text-2xl'} font-bold text-white/50 tracking-widest`}>({navState.distanceRemaining})</span>
              </div>
              <span className={`${mini ? 'text-[9px]' : 'text-xl'} font-bold text-white/80 truncate mt-3 uppercase tracking-[0.2em]`}>
                TO {navState.destinationName}
              </span>
            </div>

            <div className={`${mini ? 'w-12 h-16' : 'w-28 h-36'} bg-white rounded-2xl border-4 border-black flex flex-col items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.8)] shrink-0`}>
              <span className={`${mini ? 'text-[7px]' : 'text-sm'} font-black text-black uppercase leading-none tracking-widest`}>SPEED</span>
              <span className={`${mini ? 'text-[7px]' : 'text-sm'} font-black text-black uppercase leading-none tracking-widest`}>LIMIT</span>
              <span className={`${mini ? 'text-2xl' : 'text-6xl'} font-black text-black leading-none mt-1`}>65</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
