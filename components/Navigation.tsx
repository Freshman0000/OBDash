
import React, { useState, useEffect, useMemo } from 'react';
import { ThemeConfig, VehicleData, NavigationState } from '../types';
import { Search, Navigation as NavIcon, X, Play, MapPin, Locate, Navigation2, Clock, Mic, CornerUpRight, CornerUpLeft, ArrowUp, ArrowUpRight } from 'lucide-react';
import { MapComponent } from './MapComponent';

interface NavigationProps {
  theme: ThemeConfig;
  data: VehicleData;
  navState: NavigationState;
  onUpdateNav: (state: Partial<NavigationState>) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ theme, navState, onUpdateNav }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [isOverview, setIsOverview] = useState(false);

  const getTurnIcon = (instruction: string, size: number = 48) => {
    const lower = instruction.toLowerCase();
    if (lower.includes('left')) return <CornerUpLeft size={size} className="text-sky-400" />;
    if (lower.includes('right')) return <CornerUpRight size={size} className="text-sky-400" />;
    if (lower.includes('straight') || lower.includes('continue')) return <ArrowUp size={size} className="text-sky-400" />;
    return <NavIcon size={size} className="text-sky-400" />;
  };

  // ... (keep existing logic for search, geolocation, routing, etc.)
  // Actually, I need to keep the logic for search, geolocation, routing, etc.
  // I will just replace the map rendering part.

  // Real-time search suggestions
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&countrycodes=us&addressdetails=1`;
        if (coords) {
          const left = coords.lng - 0.5;
          const right = coords.lng + 0.5;
          const top = coords.lat + 0.5;
          const bottom = coords.lat - 0.5;
          url += `&viewbox=${left},${top},${right},${bottom}&bounded=1`;
        } else {
          // Default to PA, NJ, NY, DE bounds
          url += `&viewbox=-80.5,45.0,-71.8,38.4&bounded=1`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, coords]);

  const searchHistory = [
    { name: 'HOME', address: '123_SILICON_VALLEY_DR' },
    { name: 'OFFICE', address: '456_INNOVATION_WAY' },
    { name: 'GYM', address: '789_POWER_LIFT_ST' },
    { name: 'GAS_STATION', address: '321_FUEL_CORNER' },
  ];

  useEffect(() => {
    let lastCoords: { lat: number; lng: number } | null = null;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (isNaN(pos.coords.latitude) || isNaN(pos.coords.longitude)) return;
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        
        if (pos.coords.heading !== null && !Number.isNaN(pos.coords.heading)) {
          setHeading(pos.coords.heading);
        } else if (lastCoords) {
          const dLat = newCoords.lat - lastCoords.lat;
          const dLng = newCoords.lng - lastCoords.lng;
          if (Math.abs(dLat) > 0.0001 || Math.abs(dLng) > 0.0001) {
            const dLon = dLng * Math.PI / 180;
            const lat1Rad = lastCoords.lat * Math.PI / 180;
            const lat2Rad = newCoords.lat * Math.PI / 180;
            const y = Math.sin(dLon) * Math.cos(lat2Rad);
            const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
            let brng = Math.atan2(y, x) * 180 / Math.PI;
            setHeading((brng + 360) % 360);
          }
        }
        lastCoords = newCoords;
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (navState.isNavigating && navState.destination && coords) {
      const destLat = navState.destination.lat;
      const destLng = navState.destination.lng;
      
      if (isNaN(destLat) || isNaN(destLng) || isNaN(coords.lat) || isNaN(coords.lng)) return;
      
      const R = 3958.8;
      const dLat = (destLat - coords.lat) * (Math.PI / 180);
      const dLon = (destLng - coords.lng) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coords.lat * (Math.PI / 180)) * Math.cos(destLat * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      const distance = R * c;
      
      const timeMin = Math.round((distance / 30) * 60);
      
      const currentDistStr = `${distance.toFixed(1)} MI`;
      const currentMinStr = `${timeMin} MIN`;
      
      if (navState.distanceRemaining !== currentDistStr || navState.timeRemaining !== currentMinStr) {
        if (distance < 0.05) {
          onUpdateNav({
            isNavigating: false,
            instruction: "ARRIVED",
            distanceRemaining: "0 MI",
            timeRemaining: "0 MIN"
          });
          setTimeout(() => {
            onUpdateNav({
              destination: null,
              destinationName: 'No Destination',
              instruction: 'DRIVE_SAFE',
              upcomingManeuvers: [],
              routeCoordinates: []
            });
            setRouteCoordinates([]);
          }, 5000);
        } else {
          onUpdateNav({
            distanceRemaining: currentDistStr,
            timeRemaining: currentMinStr
          });
        }
      }
    }
  }, [coords, navState.isNavigating, navState.destination]);

  const startNavigation = async (dest?: any) => {
    let destination = dest;
    
    if (!destination) {
      if (searchResults.length > 0) {
        destination = searchResults[0];
      } else if (searchQuery.length >= 3) {
        // Try to fetch synchronously
        setIsSearching(true);
        try {
          let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=us&addressdetails=1`;
          if (coords) {
            const left = coords.lng - 0.5;
            const right = coords.lng + 0.5;
            const top = coords.lat + 0.5;
            const bottom = coords.lat - 0.5;
            url += `&viewbox=${left},${top},${right},${bottom}&bounded=1`;
          }
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.length > 0) {
            destination = data[0];
          }
        } catch (err) {
          console.error("Search error during navigation start:", err);
        } finally {
          setIsSearching(false);
        }
      }
    }

    if (!destination || !destination.lat || (!destination.lon && !destination.lng)) {
      destination = navState.destination 
        ? { lat: navState.destination.lat, lon: navState.destination.lng, display_name: navState.destinationName } 
        : { lat: 34.0522, lon: -118.2437, display_name: searchQuery || "MUSEUM_OF_ART" };
    }

    const destLat = parseFloat(destination.lat);
    const destLng = parseFloat(destination.lon || destination.lng);
    
    if (isNaN(destLat) || isNaN(destLng)) {
      console.error("Invalid destination coordinates", destination);
      return;
    }
    
    setShowSearchHistory(false);
    setSearchResults([]);
    setSearchQuery(destination.display_name.split(',')[0]);
    setIsOverview(true); // Automatically show overview when starting navigation

    // Use actual coords or fallback to LA for demo purposes
    const startLng = coords ? coords.lng : -118.2437;
    const startLat = coords ? coords.lat : 34.0522;

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`);
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordsList = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
        setRouteCoordinates(coordsList);
        
        const distanceMi = (route.distance * 0.000621371).toFixed(1);
        const timeMin = Math.round(route.duration / 60);
        
        let firstInstruction = "CONTINUE_STRAIGHT";
        let upcoming = [];
        
        if (route.legs && route.legs[0] && route.legs[0].steps) {
            const steps = route.legs[0].steps;
            if (steps.length > 1) {
              firstInstruction = steps[1].maneuver.modifier ? `TURN_${steps[1].maneuver.modifier.toUpperCase()}` : "CONTINUE";
            }
            upcoming = steps.slice(1, 4).map((s: any) => ({
              instruction: s.maneuver.modifier ? `TURN_${s.maneuver.modifier.toUpperCase()}` : "CONTINUE",
              distance: (s.distance * 0.000621371).toFixed(1) + " MI"
            }));
        }

        onUpdateNav({
          isNavigating: true,
          instruction: firstInstruction.replace(/-/g, '_'),
          destinationName: (destination.display_name || destination.name || "DESTINATION").split(',')[0].toUpperCase(),
          distanceRemaining: `${distanceMi} MI`,
          timeRemaining: `${timeMin} MIN`,
          destination: { lat: destLat, lng: destLng },
          upcomingManeuvers: upcoming,
          routeCoordinates: coordsList
        });
        return;
      }
    } catch (err) {
      console.error("Routing error:", err);
    }

    // Fallback if routing fails
    const fallbackRoute: [number, number][] = [[startLat, startLng], [destLat, destLng]];
    onUpdateNav({
      isNavigating: true,
      instruction: "CONTINUE_STRAIGHT",
      destinationName: (destination.display_name || destination.name || "DESTINATION").split(',')[0].toUpperCase(),
      distanceRemaining: "4.2 MI",
      timeRemaining: "12 MIN",
      destination: { lat: destLat, lng: destLng },
      upcomingManeuvers: [
        { instruction: "TURN_RIGHT_ON_MAIN_ST", distance: "1.2 MI" },
        { instruction: "CONTINUE_STRAIGHT", distance: "2.5 MI" }
      ],
      routeCoordinates: fallbackRoute
    });
    setRouteCoordinates(fallbackRoute);
  };

  const clearRoute = () => {
    onUpdateNav({
      isNavigating: false, instruction: "DRIVE_SAFE", destination: null,
      destinationName: 'No Destination', distanceRemaining: '-- MI', timeRemaining: '-- MIN',
      upcomingManeuvers: [],
      routeCoordinates: []
    });
    setSearchQuery('');
    setRouteCoordinates([]);
    setIsOverview(false);
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-[#0a0a0a] overflow-hidden font-micro">
      
      <MapComponent 
        theme={theme}
        navState={navState}
        coords={coords}
        heading={heading}
        routeCoordinates={routeCoordinates}
        isOverview={isOverview}
        onMapStyleChange={(index) => onUpdateNav({ mapStyleIndex: index })}
      />

      {/* Exit Navigation Button */}
      {navState.isNavigating && (
        <>
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[2000] flex gap-4">
            <button 
              onClick={clearRoute}
              className="bg-rose-600/90 hover:bg-rose-500 backdrop-blur-xl text-white px-8 py-4 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_20px_50px_rgba(225,29,72,0.4)] border border-white/20 flex items-center gap-4 transition-all active:scale-95"
            >
              <X size={32} />
              EXIT
            </button>
            
            <button 
              onClick={() => setIsOverview(!isOverview)}
              className="bg-black/80 hover:bg-black backdrop-blur-xl text-white px-8 py-4 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-2xl border border-white/20 flex items-center gap-4 transition-all active:scale-95"
            >
              <MapPin size={32} />
              {isOverview ? 'RESUME' : 'OVERVIEW'}
            </button>
          </div>
        </>
      )}

      {/* Search Header */}
      {!navState.isNavigating && (
        <div className="absolute top-10 left-12 z-[2000] w-[800px] pointer-events-none">
            <div className="relative pointer-events-auto flex flex-col gap-4">
              <div className="bg-black/90 p-6 px-10 rounded-[3rem] flex items-center gap-8 w-full shadow-[0_50px_120px_rgba(0,0,0,0.9)] backdrop-blur-3xl border border-white/10 ring-1 ring-white/10 group focus-within:ring-sky-500/50 transition-all">
                 <Search className="text-white/40 group-focus-within:text-sky-400 transition-colors" size={36} />
                 <input 
                   type="text" placeholder="SEARCH_DESTINATION..."
                   className="bg-transparent outline-none font-black text-3xl uppercase w-full text-white placeholder:opacity-20 italic tracking-tighter leading-none py-2"
                   value={searchQuery} 
                   onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setShowSearchHistory(true);
                   }}
                   onFocus={() => setShowSearchHistory(true)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && searchQuery) {
                       if (searchResults.length > 0) {
                         startNavigation(searchResults[0]);
                       } else {
                         startNavigation();
                       }
                     }
                   }}
                 />
                 <div className="flex items-center gap-4">
                   {searchQuery && (
                     <button 
                       onClick={() => {
                         if (searchResults.length > 0) {
                           startNavigation(searchResults[0]);
                         } else {
                           startNavigation();
                         }
                       }}
                       className="bg-sky-500 text-white px-6 py-3 rounded-2xl font-black text-xl hover:bg-sky-400 transition-colors"
                     >
                       SELECT
                     </button>
                   )}
                   {isSearching && (
                     <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-sm" />
                   )}
                   <button 
                     onClick={() => {
                       setIsVoiceSearching(true);
                       setTimeout(() => setIsVoiceSearching(false), 3000);
                     }}
                     className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${isVoiceSearching ? 'bg-sky-500 border-sky-400 text-white' : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10'}`}
                   >
                      <Mic size={28} />
                   </button>
                   {(navState.destination || searchQuery) && (
                      <button onClick={clearRoute} className="w-14 h-14 bg-rose-900/50 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/30 active:scale-90 transition-all hover:bg-rose-900/70">
                         <X size={28} />
                      </button>
                   )}
                 </div>
              </div>

              {isVoiceSearching && (
                <div className="bg-sky-500/20 backdrop-blur-3xl p-8 rounded-[2rem] border border-sky-500/30 flex items-center gap-6">
                  <div className="flex gap-1 items-end h-8">
                    <div className="w-1 bg-sky-400" style={{ height: '60%' }} />
                    <div className="w-1 bg-sky-400" style={{ height: '100%' }} />
                    <div className="w-1 bg-sky-400" style={{ height: '80%' }} />
                    <div className="w-1 bg-sky-400" style={{ height: '40%' }} />
                  </div>
                  <span className="text-2xl font-black text-sky-400 uppercase italic tracking-widest">LISTENING_FOR_COMMAND...</span>
                </div>
              )}

              {showSearchHistory && (
                <div className="bg-black/95 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-4xl overflow-hidden">
                  <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 tracking-[0.6em] uppercase italic">
                      {searchResults.length > 0 ? 'SEARCH_RESULTS' : 'RECENT_SEARCHES'}
                    </span>
                    {isSearching && <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-sm" />}
                  </div>
                  
                  {searchResults.length > 0 ? (
                    searchResults.map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => startNavigation(item)}
                        className="w-full p-8 flex items-center gap-8 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 transition-all">
                          <MapPin size={24} />
                        </div>
                        <div className="flex flex-col flex-1 truncate">
                          <span className="text-2xl font-black text-white group-hover:text-sky-400 transition-colors uppercase italic truncate">{item.display_name.split(',')[0]}</span>
                          <span className="text-sm font-bold text-white/20 uppercase tracking-widest truncate">{item.display_name}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    searchHistory.map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setSearchQuery(item.name);
                          setShowSearchHistory(false);
                          startNavigation();
                        }}
                        className="w-full p-8 flex items-center gap-8 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-sky-400 group-hover:bg-sky-500/10 transition-all">
                          <Clock size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white group-hover:text-sky-400 transition-colors uppercase italic">{item.name}</span>
                          <span className="text-sm font-bold text-white/20 uppercase tracking-widest">{item.address}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
};

const MAP_STYLES = [
  { id: 'night', name: 'NIGHT', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', description: 'HIGH_CONTRAST_DARK' },
  { id: 'day', name: 'DAY', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', description: 'HIGH_CONTRAST_LIGHT' },
  { id: 'satellite', name: 'SATELLITE', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', description: 'REAL_WORLD_IMAGERY' },
  { id: 'topo', name: '3D TOPO', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', description: 'TERRAIN_ELEVATION' },
  { id: 'voyager', name: 'VOYAGER', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', description: 'DETAILED_STREETS' },
  { id: 'positron', name: 'POSITRON', url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', description: 'MINIMAL_CLEAN' }
];

export const MiniMap: React.FC<{ theme: ThemeConfig; navState: NavigationState; bearing?: number; onMapStyleChange?: (index: number) => void }> = ({ theme, navState, bearing = 0, onMapStyleChange }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    let lastCoords: { lat: number; lng: number } | null = null;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (isNaN(pos.coords.latitude) || isNaN(pos.coords.longitude)) return;
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        
        if (pos.coords.heading !== null && !Number.isNaN(pos.coords.heading)) {
          setHeading(pos.coords.heading);
        } else if (lastCoords) {
          const dLat = newCoords.lat - lastCoords.lat;
          const dLng = newCoords.lng - lastCoords.lng;
          if (Math.abs(dLat) > 0.0001 || Math.abs(dLng) > 0.0001) {
            const dLon = dLng * Math.PI / 180;
            const lat1Rad = lastCoords.lat * Math.PI / 180;
            const lat2Rad = newCoords.lat * Math.PI / 180;
            const y = Math.sin(dLon) * Math.cos(lat2Rad);
            const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
            let brng = Math.atan2(y, x) * 180 / Math.PI;
            setHeading((brng + 360) % 360);
          }
        }
        lastCoords = newCoords;
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <MapComponent 
      theme={theme}
      navState={navState}
      coords={coords}
      heading={heading}
      routeCoordinates={navState.routeCoordinates || []}
      mini={true}
      onMapStyleChange={onMapStyleChange}
    />
  );
};
