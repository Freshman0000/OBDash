import React from 'react';

export const Ticker: React.FC<{
  data?: any;
  navState?: any;
  theme?: any;
  className?: string;
}> = ({ data, navState, theme, className = '' }) => {
  const fuelConsumpRaw = data?.fuelConsumption ?? data?.fuelEconomy ?? 18.4;
  const fuelEcon = typeof fuelConsumpRaw === 'number' ? fuelConsumpRaw.toFixed(1) : parseFloat(fuelConsumpRaw).toFixed(1);
  const range = Math.round((data?.fuelLevel || 100) / 100 * 320);
  const heading = navState?.heading || 0;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dir = dirs[Math.round(heading / 45) % 8];

  const messages = [
    `SYS-OK`,
    `FUEL CONS: ${fuelEcon} MPG`,
    `DIR: ${dir}`,
    `RNG: ${range} MI`,
    `PWR: OPTIMAL`,
    `LAT: 34.05`,
    `LON: -118.24`
  ];

  return (
    <div className={`overflow-hidden whitespace-nowrap flex items-center bg-black/40 border-t border-white/10 backdrop-blur-md px-2 ${className}`}>
      <div className="animate-[ticker_30s_linear_infinite] inline-block font-dot text-[1cqw] text-[#00FFFF] drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] tracking-[0.2em] uppercase py-1 not-italic">
        {[...messages, ...messages, ...messages].map((msg, i) => (
          <span key={i} className="mx-4">
            <span className="text-white/30 mr-4">•</span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
};
