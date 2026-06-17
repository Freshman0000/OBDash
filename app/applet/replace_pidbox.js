import fs from 'fs';

const content = fs.readFileSync('./components/Gauge.tsx', 'utf8');

const newPidBox = `
const AVAILABLE_PIDS = [
  { label: 'SPEED', key: 'speed', unit: 'MPH' },
  { label: 'RPM', key: 'rpm', unit: 'RPM' },
  { label: 'COOLANT', key: 'coolantTemp', unit: '°F' },
  { label: 'FUEL', key: 'fuelLevel', unit: '%' },
  { label: 'VOLTS', key: 'voltage', unit: 'V' },
  { label: 'THROTTLE', key: 'throttlePos', unit: '%' },
  { label: 'LOAD', key: 'engineLoad', unit: '%' },
  { label: 'BOOST', key: 'boost', unit: 'PSI' },
  { label: 'OIL TEMP', key: 'oilTemp', unit: '°F' },
  { label: 'OIL PSI', key: 'oilPressure', unit: 'BAR' },
  { label: 'INTAKE', key: 'intakeTemp', unit: '°F' },
  { label: 'G-FORCE', key: 'acceleration', unit: 'G' },
  { label: 'FUEL CONS', key: 'fuelConsumption', unit: 'MPG' }
];

const PidBox: React.FC<{ label: string; value: string | number; unit: string; color: string; align?: 'left' | 'right'; borderSide?: 'left' | 'right'; data?: any }> = ({ label: initialLabel, value: initialValue, unit: initialUnit, color, align = 'left', borderSide = 'left', data }) => {
  const [currentPid, setCurrentPid] = React.useState<{label: string, unit: string, key?: string}>({ label: initialLabel, unit: initialUnit });

  const handleClick = () => {
    const randomPid = AVAILABLE_PIDS[Math.floor(Math.random() * AVAILABLE_PIDS.length)];
    setCurrentPid(randomPid);
  };

  let displayValue = initialValue;
  if (currentPid.key && data) {
    const val = data[currentPid.key];
    if (typeof val === 'number') {
      displayValue = val % 1 !== 0 ? val.toFixed(1) : Math.round(val);
    } else {
      displayValue = val || 0;
    }
  }

  return (
  <div onClick={handleClick} className={\`flex flex-col \${align === 'right' ? 'items-end text-right' : 'items-start text-left'} \${borderSide === 'left' ? 'border-l-[0.8cqw] pl-[2cqw]' : 'border-r-[0.8cqw] pr-[2cqw]'} py-[1.5cqh] bg-black/60 backdrop-blur-3xl shadow-2xl ring-1 ring-white/5 transition-all hover:bg-white/5 group min-w-[22cqw] relative overflow-hidden rounded-[1cqh] cursor-pointer\`} style={{ [borderSide === 'left' ? 'borderLeftColor' : 'borderRightColor']: color }}>
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    <div className="flex items-center gap-[1.5cqw] w-full">
      <div className="flex flex-col flex-1">
        <div className="flex items-baseline gap-[1cqw]">
          <span className="text-[7.5cqh] font-micro font-black text-white tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] leading-none refresh-flicker">
            <ResponsiveValue value={displayValue} />
          </span>
          <span className="text-[4.5cqh] font-black opacity-40 uppercase tracking-widest font-micro" style={{ color }}>{currentPid.unit}</span>
        </div>
        <span className="text-[2.2cqh] font-black opacity-60 uppercase tracking-[0.6em] italic group-hover:opacity-100 transition-opacity z-10 font-micro mt-[0.5cqh]">{currentPid.label}</span>
      </div>
    </div>
    <div className="mt-[1cqh] w-full h-[1px] bg-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-current animate-pulse opacity-20" style={{ color }} />
    </div>
  </div>
  );
};
`;

const oldPidBoxRegex = /const PidBox: React\.FC<\{ label: string; value: string \| number; unit: string; color: string; align\?: 'left' \| 'right'; borderSide\?: 'left' \| 'right' \}> = \(\{ label, value, unit, color, align = 'left', borderSide = 'left' \}\) => \([\s\S]*?\}\s*\}\s*\/>\s*<\/div>\s*<\/div>\s*\);/m;

let updatedContent = content.replace(oldPidBoxRegex, newPidBox);

// Add data={data} to all <PidBox calls
updatedContent = updatedContent.replace(/<PidBox /g, '<PidBox data={data} ');

fs.writeFileSync('./components/Gauge.tsx', updatedContent);
console.log('Done');
