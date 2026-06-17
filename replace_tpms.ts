import * as fs from 'fs';

let content = fs.readFileSync('services/obdService.ts', 'utf8');

if (!content.includes('tpms: { fl: 32 + (Math.random() * 2 - 1)')) {
  // Replace static tpms update with simulated data in the hardware polling / simulation
  // There is a method `updateSimulatedData`
  const oldSim = `    this.data = {
      ...this.data,
      rpm: targetRpm,
      speed: simSpeed,
      coolantTemp: 180 + Math.sin(time / 20000) * 10,
      oilTemp: 210 + Math.sin(time / 25000) * 15,
      fuelLevel: Math.max(0, 75 - (time / 60000) * 0.1),
      engineLoad: Math.min(100, Math.max(0, 40 + acceleration * 20 + noise * 10)),
      throttlePos: Math.min(100, Math.max(0, (acceleration > 0 ? acceleration * 50 : 5) + noise * 5)),
      boost: Math.max(-10, acceleration * 20 + noise * 2)
    };`;
    
  const newSim = `    this.data = {
      ...this.data,
      rpm: targetRpm,
      speed: simSpeed,
      coolantTemp: 180 + Math.sin(time / 20000) * 10,
      oilTemp: 210 + Math.sin(time / 25000) * 15,
      fuelLevel: Math.max(0, 75 - (time / 60000) * 0.1),
      engineLoad: Math.min(100, Math.max(0, 40 + acceleration * 20 + noise * 10)),
      throttlePos: Math.min(100, Math.max(0, (acceleration > 0 ? acceleration * 50 : 5) + noise * 5)),
      boost: Math.max(-10, acceleration * 20 + noise * 2),
      tpms: {
        fl: Math.round(32 + Math.sin(time / 5000) * 0.5),
        fr: Math.round(32 + Math.cos(time / 6000) * 0.5),
        rl: Math.round(30 + Math.sin(time / 7000) * 0.5),
        rr: Math.round(30 + Math.cos(time / 8000) * 0.5)
      }
    };`;
    
  content = content.replace(oldSim, newSim);
  
  // also hardware simulation update
  const oldHardwareSim = `    this.data = {
      ...this.data,
      rpm: Math.max(800, Math.min(8000, this.data.rpm + (Math.random() - 0.5) * 500)),
      speed: Math.max(0, Math.min(160, this.data.speed + (Math.random() - 0.5) * 5)),
      coolantTemp: Math.max(160, Math.min(220, this.data.coolantTemp + (Math.random() - 0.5) * 2)),
      engineLoad: Math.random() * 100,
      throttlePos: Math.random() * 100,
      boost: (Math.random() * 20) - 10,
      voltage: 13.5 + Math.random() * 1.5,
      oilPressure: 30 + Math.random() * 20,
    };`;
    
  const newHardwareSim = `    this.data = {
      ...this.data,
      rpm: Math.max(800, Math.min(8000, this.data.rpm + (Math.random() - 0.5) * 500)),
      speed: Math.max(0, Math.min(160, this.data.speed + (Math.random() - 0.5) * 5)),
      coolantTemp: Math.max(160, Math.min(220, this.data.coolantTemp + (Math.random() - 0.5) * 2)),
      engineLoad: Math.random() * 100,
      throttlePos: Math.random() * 100,
      boost: (Math.random() * 20) - 10,
      voltage: 13.5 + Math.random() * 1.5,
      oilPressure: 30 + Math.random() * 20,
      tpms: {
        fl: Math.round(32 + (Math.random() * 2 - 1)),
        fr: Math.round(32 + (Math.random() * 2 - 1)),
        rl: Math.round(30 + (Math.random() * 2 - 1)),
        rr: Math.round(30 + (Math.random() * 2 - 1))
      }
    };`;
    
  content = content.replace(oldHardwareSim, newHardwareSim);
  
  fs.writeFileSync('services/obdService.ts', content, 'utf8');
  console.log("Updated TPMS");
}
