import * as fs from 'fs';
let content = fs.readFileSync('App.tsx', 'utf8');

// Vehicle Name Logic
if (!content.includes('const [vehicleName, setVehicleName]')) {
  content = content.replace(
    'const App: React.FC = () => {', 
    `const App: React.FC = () => {\n  const [vehicleName, setVehicleName] = useState(() => localStorage.getItem('vehicleName') || 'KIA TELLURIDE');`
  );
}

content = content.replace(
  '<span className="text-2xl lg:text-3xl font-black tracking-tighter uppercase text-white/95 leading-none font-tech drop-shadow-lg">Kia Telluride</span>',
  `<span 
    onClick={() => {
      const newName = prompt('Enter Vehicle Name:', vehicleName);
      if (newName) {
        setVehicleName(newName.toUpperCase());
        localStorage.setItem('vehicleName', newName.toUpperCase());
      }
    }}
    className="text-2xl lg:text-3xl font-black tracking-tighter uppercase text-white/95 leading-none font-tech drop-shadow-lg cursor-pointer hover:text-white transition-colors"
  >
    {vehicleName}
  </span>`
);

// Middle section with Fuel Gauge
const oldMiddle = `<div className="flex-1 flex flex-col items-center justify-center border-x border-white/10 h-full bg-white/[0.03] px-[2vw] overflow-hidden relative">
            <div className="w-full overflow-hidden relative h-full flex items-center justify-center">
               <span className="text-lg lg:text-xl font-black tracking-widest uppercase text-white whitespace-nowrap block leading-none font-micro drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  {navState.isNavigating ? navState.instruction : currentStreet}
               </span>
            </div>
         </div>`;

const newMiddle = `<div className="flex-1 flex items-center justify-between border-x border-white/10 h-full bg-white/[0.03] overflow-hidden relative">
            <div className="flex-1 overflow-hidden relative h-full flex items-center px-[2vw]">
               <span className="text-lg lg:text-xl font-black tracking-widest uppercase text-white whitespace-nowrap block leading-none font-micro drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] truncate">
                  {navState.isNavigating ? navState.instruction : currentStreet}
               </span>
            </div>
            {/* Fuel Bar (in between street and weather) */}
            <div className="h-full flex flex-col justify-center px-[2vw] border-l border-white/5 bg-black/20 min-w-[120px] shrink-0">
               <div className="flex justify-between w-full mb-1 items-center">
                  <Fuel size={14} className="text-white/40" />
                  <span className="text-xs font-black tabular-nums text-white/60">{Math.round(currentData?.fuelLevel || 0)}%</span>
               </div>
               <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: \`\${currentData?.fuelLevel || 0}%\` }} />
               </div>
            </div>
         </div>`;

content = content.replace(oldMiddle, newMiddle);

// Android Permissions
const autoPerm = `
  useEffect(() => {
    const checkPermissions = async () => {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
        if (!localStorage.getItem('android_permissions_requested')) {
          try {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(() => {}, () => {});
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
`;
if (!content.includes('android_permissions_requested')) {
  // insert before the checkKey
  content = content.replace('// Check for paid API key on mount', autoPerm + '\n  // Check for paid API key on mount');
}

fs.writeFileSync('App.tsx', content, 'utf8');
