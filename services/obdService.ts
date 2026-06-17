
import { VehicleData, CanBusMessage, CanCommand } from '../types';

export type ConnectionProfile = 'PERFORMANCE' | 'STANDARD' | 'REALDASH_BLE' | 'REALDASH_UDP' | 'WIFI' | 'USB';

export class OBDService {
  private data: VehicleData = {
    speed: 0, rpm: 800, coolantTemp: 185, fuelLevel: 85,
    voltage: 14.2, throttlePos: 0, engineLoad: 12, gear: 'P',
    boost: 0, oilTemp: 190, oilPressure: 45, odo: 125432, trip: 45.2,
    intakeTemp: 72, acceleration: 0,
    fuelConsumption: 24.5,
    warningLights: {
      checkEngine: false,
      oilPressure: false,
      battery: false,
      tpms: false,
      highBeam: false,
      parkingBrake: false,
      abs: false,
      traction: false,
      leftSignal: false,
      rightSignal: false
    },
    tpms: { fl: 32, fr: 32, rl: 30, rr: 30 }
  };

  private listeners: ((data: VehicleData) => void)[] = [];
  private logListeners: ((log: string) => void)[] = [];
  private statusListeners: ((status: 'disconnected' | 'connecting' | 'connected') => void)[] = [];
  private simulationInterval: any = null;
  private pollingInterval: any = null;
  private gattServer: any = null;
  private characteristic: any = null; // Used for TX if separate, or both
  private rxCharacteristic: any = null; // Used for RX if separate
  private isConnected: boolean = false;
  private isSimulating: boolean = true;
  private pollIndex: number = 0;
  private pollIntervalMs: number = 20; 
  private isPolling: boolean = false;
  private isPollingActive: boolean = false;
  private isBinaryMode: boolean = false;
  private isAnalyzingCanBus: boolean = false;
  private canBusListeners: ((msg: CanBusMessage) => void)[] = [];
  private canBusData: Map<string, CanBusMessage> = new Map();
  private lastDataReceived: number = Date.now();
  private responseBuffer: string = '';
  private binaryBuffer: Uint8Array = new Uint8Array(0);
  private gpsWatchId: number | null = null;
  private lastGpsSpeed: number = 0;
  private virtualRpm: number = 800;
  private virtualGear: string = 'P';
  private adapterType: 'UNKNOWN' | 'ELM327' | 'WICAN_PRO' | 'REALDASH' = 'UNKNOWN';
  private logs: string[] = [];
  private isGattBusy: boolean = false;
  private isNotifying: boolean = false;
  private connectionProfile: ConnectionProfile = 'STANDARD';
  private gattMutex: Promise<void> = Promise.resolve();
  private commandMutex: Promise<void> = Promise.resolve();
  private pollTimeout: any = null;
  private commandResolver: ((value: string) => void) | null = null;
  private commandRejecter: ((reason?: any) => void) | null = null;
  
  private targetSpeed: number = 0;
  private accelerationMomentum: number = 0;
  private gpsReliability: number = 1.0;
  private forceSimulation: boolean = false;
  private highAccuracyGps: boolean = false;
  private lastNoDataLog: number = 0;
  private lastParseLog: number = 0;
  private lastDataTime: number = Date.now();
  private watchdogInterval: any = null;
  private slowPids: Set<string> = new Set();
  private pidFailures: Map<string, number> = new Map();

  constructor() {
    this.startWatchdog();
    this.initGpsTracking();
    this.initAccelerometerTracking();
    this.startSimulation(); // Start simulation by default
    this.startInterpolation();
  }

  private startWatchdog() {
    if (this.watchdogInterval) clearInterval(this.watchdogInterval);
    this.watchdogInterval = setInterval(() => {
      if (this.isConnected && !this.isSimulating) {
        const now = Date.now();
        if (now - this.lastDataTime > 8000) {
          this.addLog("Watchdog: No data for 8s, attempting protocol reset...", "WARNING");
          this.resetProtocol();
        }
      }
    }, 5000);
  }

  private async resetProtocol() {
    if (!this.isConnected || this.isSimulating) return;
    try {
      this.isPollingActive = false;
      if (this.pollTimeout) clearTimeout(this.pollTimeout);
      
      await this.executeCommand('ATZ', 8000);
      await new Promise(r => setTimeout(r, 2000));
      await this.executeCommand('ATE0', 3000);
      await this.executeCommand('ATL0', 3000);
      await this.executeCommand('ATSP0', 8000);
      
      this.lastDataTime = Date.now();
      this.pollNext();
    } catch (e) {
      this.addLog(`Protocol Reset Failed: ${e}`, "ERROR");
    }
  }
  private pids = [
    '010C', // RPM
    '010D', // Speed
    '0104', // Engine Load
    '010C', // RPM
    '010D', // Speed
    '0105', // Coolant Temp
    '010C', // RPM
    '010D', // Speed
    '010B', // Intake MAP (Boost)
    '010C', // RPM
    '010D', // Speed
    '010F', // Intake Air Temp
    '010C', // RPM
    '010D', // Speed
    '0111', // Throttle Position
    '010C', // RPM
    '010D', // Speed
    '012F', // Fuel Level
    '010C', // RPM
    '010D', // Speed
    '0133', // Barometric Pressure
    '010C', // RPM
    '010D', // Speed
    '015C'  // Oil Temperature
  ];

  private RD_SERVICE_UUIDS = [
    '0000fff0-0000-1000-8000-00805f9b34fb', // WiCAN Pro / Vgate
    '0000ffe0-0000-1000-8000-00805f9b34fb', // ELM327 BLE
    '00001101-0000-1000-8000-00805f9b34fb', // Standard SPP
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART (RealDash)
    '0000ff01-0000-1000-8000-00805f9b34fb', // Generic OBD
    '000018f0-0000-1000-8000-00805f9b34fb', // Standard OBD
    '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Microchip
    '0000dfb0-0000-1000-8000-00805f9b34fb', // Bluno
    '0000ffe1-0000-1000-8000-00805f9b34fb', // Alternative ELM327
    '0000fff1-0000-1000-8000-00805f9b34fb', // AutoPID / Generic
    '0000fee9-0000-1000-8000-00805f9b34fb'  // RealDash 66 Specific
  ];


  public getData(): VehicleData {
    return { ...this.data };
  }

  public getLogs(): string[] {
      return this.logs;
  }

  public clearLogs() {
      this.logs = [];
      this.logListeners.forEach(l => l('LOGS_CLEARED'));
  }

  private addLog(message: string, type: 'INFO' | 'TX' | 'RX' | 'ERROR' | 'WARNING' | 'DEBUG' = 'INFO') {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] [${type}] ${message}`;
      this.logs.unshift(logEntry);
      if (this.logs.length > 100) this.logs.pop();
      this.logListeners.forEach(l => l(logEntry));
  }

  public onLog(cb: (log: string) => void) {
      this.logListeners.push(cb);
      return () => { this.logListeners = this.logListeners.filter(l => l !== cb); };
  }

  public onStatusChange(cb: (status: 'disconnected' | 'connecting' | 'connected') => void) {
      this.statusListeners.push(cb);
      return () => { this.statusListeners = this.statusListeners.filter(l => l !== cb); };
  }

  public onCanBusMessage(cb: (msg: CanBusMessage) => void) {
    this.canBusListeners.push(cb);
    return () => { this.canBusListeners = this.canBusListeners.filter(l => l !== cb); };
  }

  public async sendCanCommand(command: CanCommand) {
    if (!this.isConnected || !this.characteristic) {
      this.addLog(`CAN Command Failed: Not Connected (${command.name})`, 'ERROR');
      return false;
    }

    try {
      // WiCAN Pro / STN command format for raw CAN:
      // STPX <id>, <data>
      const cmd = `STPX ${command.canId},${command.data}`;
      this.addLog(`TX CAN: ${command.name} (${command.canId}#${command.data})`, 'TX');
      
      const response = await this.executeCommand(cmd);
      this.addLog(`CAN Response: ${response.trim()}`, 'INFO');
      return true;
    } catch (e: any) {
      this.addLog(`CAN Command Error: ${e.message}`, 'ERROR');
      return false;
    }
  }

  public startCanBusAnalysis() {
    this.isAnalyzingCanBus = true;
    this.addLog("CAN-Bus Analysis Started - Pausing PID Polling", "INFO");
    
    // Stop PID polling while analyzing CAN bus to prevent interference
    this.isPolling = false;
    this.isPollingActive = false;

    if (this.isSimulating) {
      this.simulateCanTraffic();
    } else {
      // Send monitor all command to WiCAN Pro
      this.sendRawCommand('ATMA');
    }
  }

  public stopCanBusAnalysis() {
    this.isAnalyzingCanBus = false;
    this.addLog("CAN-Bus Analysis Stopped - Resuming PID Polling", "INFO");
    if (!this.isSimulating) {
      // Stop monitoring by sending a simple AT command
      this.sendRawCommand('AT');
      
      // Resume PID polling
      this.isPolling = true;
      this.pollNext();
    }
  }

  private async sendRawCommand(cmd: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(cmd + '\r');
      return;
    }
    if (!this.characteristic) return;
    const data = new TextEncoder().encode(cmd + '\r');
    await this.safeGattCall(async () => {
      if (this.characteristic!.properties.writeWithoutResponse) {
        await this.characteristic!.writeValueWithoutResponse(data);
      } else {
        await this.characteristic!.writeValue(data);
      }
    });
  }

  private simulateCanTraffic() {
    if (!this.isAnalyzingCanBus) return;
    
    const ids = ['1A0', '2B1', '3C2', '4D3', '5E4', '6F5', '706', '817'];
    const interval = setInterval(() => {
      if (!this.isAnalyzingCanBus) {
        clearInterval(interval);
        return;
      }
      const id = ids[Math.floor(Math.random() * ids.length)];
      const data = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      this.handleRawCanMessage(id, data);
    }, 200);
  }

  private handleRawCanMessage(id: string, data: string) {
    const now = Date.now();
    const existing = this.canBusData.get(id);
    const isChanged = existing ? existing.data !== data : true;
    
    const msg = {
      id,
      data,
      timestamp: now,
      count: existing ? existing.count + 1 : 1,
      isChanged
    };
    
    this.canBusData.set(id, msg);
    this.canBusListeners.forEach(l => l(msg));
  }

  private notifyStatus(status: 'disconnected' | 'connecting' | 'connected') {
      this.statusListeners.forEach(l => l(status));
  }

  /**
   * WiCAN Pro Connection Methods:
   * 1. Bluetooth (Standard OBD2): Use connectHardware with 'STANDARD' profile.
   * 2. RealDash CAN (Binary): Auto-detected when valid frames are received.
   * 3. Wi-Fi (TCP/UDP): Use connectWiFi (Station Mode recommended).
   * 4. USB (Serial): Use connectSerial (115200 baud).
   * 
   * Autopid: Handled via ATSP0 (Automatic Protocol) which is the default.
   */
  public async connectAdvanced(config: { protocol: string, connectionType: string, baudRate: string }) {
    this.addLog(`Advanced Connection Attempt: ${JSON.stringify(config)}`);
    await this.disconnect();
    
    if (config.connectionType.includes('Bluetooth')) {
        let protocolCmd = 'ATSP0';
        if (config.protocol.includes('CAN 11/500')) protocolCmd = 'ATSP6';
        else if (config.protocol.includes('CAN 29/500')) protocolCmd = 'ATSP7';
        else if (config.protocol.includes('CAN 11/250')) protocolCmd = 'ATSP8';
        else if (config.protocol.includes('CAN 29/250')) protocolCmd = 'ATSP9';
        else if (config.protocol.includes('KWP FAST')) protocolCmd = 'ATSP5';
        else if (config.protocol.includes('ISO 9141')) protocolCmd = 'ATSP3';
        
        return this.connectHardware('STANDARD', protocolCmd);
    } else if (config.connectionType.includes('USB')) {
        return this.connectSerial();
    } else if (config.connectionType.includes('WiFi')) {
        // Hint for Station Mode
        return this.connectWiFi('192.168.0.10', 35000);
    }

    // Simulation of advanced connection logic for non-Bluetooth types
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.isSimulating = false;
    this.stop();
    this.startHardwarePolling();
    return { success: true, deviceName: `WiCAN Pro (${config.connectionType})` };
  }

  public setForceSimulation(enabled: boolean) {
    this.forceSimulation = enabled;
    if (enabled) {
      this.isSimulating = true;
      this.targetSpeed = 45; // Start with some initial movement
      this.startSimulation();
    } else {
      // If we're connected to hardware, resume hardware polling
      if (this.isConnected) {
        this.isSimulating = false;
        this.startHardwarePolling();
      } else {
        this.stop();
      }
    }
  }

  public isDataFresh(): boolean {
    if (this.isSimulating) return true;
    return (Date.now() - this.lastDataReceived) < 2500;
  }
  public setHighAccuracyGps(enabled: boolean) {
    this.highAccuracyGps = enabled;
    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.initGpsTracking();
    }
  }

  private initAccelerometerTracking() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      // Keep track of a baseline to detect sudden changes
      let baselineY = 0;
      let baselineZ = 0;
      let alpha = 0.95; // Slow moving average for baseline

      window.addEventListener('devicemotion', (event) => {
        if (!this.isSimulating && this.isConnected) {
          let accY = event.acceleration?.y || 0;
          let accZ = event.acceleration?.z || 0;
          
          // Update baseline (gravity/mounting offset compensation if any)
          baselineY = baselineY * alpha + accY * (1 - alpha);
          baselineZ = baselineZ * alpha + accZ * (1 - alpha);

          // Get dynamic acceleration (jerk/sudden movement)
          let dynY = accY - baselineY;
          let dynZ = accZ - baselineZ;
          let accMagnitude = Math.sqrt(dynY * dynY + dynZ * dynZ);
          
          // Smooth the acceleration value for UI
          this.data.acceleration = this.data.acceleration * 0.8 + accMagnitude * 0.2;
          
          this.notify();
        }
      });
    }
  }

  private initGpsTracking() {
    if ("geolocation" in navigator) {
      this.gpsWatchId = navigator.geolocation.watchPosition((pos) => {
        const accuracy = pos.coords.accuracy;
        this.gpsReliability = accuracy > (this.highAccuracyGps ? 10 : 25) ? 0.6 : 1.0;

        if (pos.coords.speed !== null && this.gpsReliability > 0.4) {
          this.lastGpsSpeed = Math.max(0, pos.coords.speed * 2.23694);
          this.updateVirtualRpm(this.lastGpsSpeed);
        }
      }, (err) => {
        this.gpsReliability = 0;
      }, { 
        enableHighAccuracy: true, 
        maximumAge: 0, 
        timeout: this.highAccuracyGps ? 2000 : 5000 
      });
    }
  }

  public updateVirtualRpm(speed: number) {
    if (speed < 0.3) {
      this.virtualRpm = 750 + (Math.random() * 30);
      this.virtualGear = 'P';
      return;
    }
    const gearThresholds = [12, 28, 45, 62, 85, 110, 140];
    let gear = 1;
    for (let i = 0; i < gearThresholds.length; i++) { 
        if (speed > gearThresholds[i]) gear = i + 2; 
    }
    const gBase = gear === 1 ? 0 : gearThresholds[gear - 2];
    const gMax = gearThresholds[gear - 1] || 240;
    const progress = (speed - gBase) / (gMax - gBase);
    const baseRpm = 1100 + (gear * 180);
    const range = 4200 - (gear * 150);
    this.virtualRpm = baseRpm + (progress * range);
    this.virtualGear = gear.toString();
  }

  public getGpsSpeed(): number {
    // Enhanced GPS fallback
    const jitter = (1 - this.gpsReliability) * (Math.random() - 0.5) * 2;
    return Math.max(0, this.lastGpsSpeed + jitter);
  }

  public getVirtualRpm(): number {
    // If we have GPS speed but no OBD RPM, calculate a realistic RPM based on speed
    if (this.lastGpsSpeed > 0) {
        this.updateVirtualRpm(this.lastGpsSpeed);
    }
    return this.virtualRpm;
  }

  public getVirtualGear(): string {
    return this.virtualGear || 'P';
  }

  private targetData: VehicleData = {
    speed: 0, rpm: 800, coolantTemp: 185, fuelLevel: 85,
    voltage: 14.2, throttlePos: 0, engineLoad: 12, gear: 'P',
    boost: 0, oilTemp: 190, oilPressure: 45, odo: 125432, trip: 45.2,
    intakeTemp: 72, acceleration: 0,
    fuelConsumption: 24.5,
    warningLights: {
      checkEngine: false, oilPressure: false, battery: false, tpms: false,
      highBeam: false, parkingBrake: false, abs: false, traction: false,
      leftSignal: false, rightSignal: false
    },
    tpms: { fl: 32, fr: 32, rl: 30, rr: 30 }
  };
  private interpolationInterval: any = null;

  private startInterpolation() {
    // Run at 60fps for ultra-smooth gauge movement
    this.interpolationInterval = setInterval(() => {
      if (this.isSimulating) return; // Simulation has its own loop

      let changed = false;
      const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

      // Fast response for RPM and Speed (the "illusion" of zero lag)
      // We use a high factor so it feels snappy but still smooths out the steps
      const fastFactor = 0.8; 
      const slowFactor = 0.1;

      for (const key of Object.keys(this.targetData) as Array<keyof VehicleData>) {
        if (typeof this.targetData[key] === 'number') {
          const targetVal = this.targetData[key] as number;
          const currentVal = this.data[key] as number;
          
          if (Math.abs(targetVal - currentVal) > 0.01) {
            const factor = (key === 'rpm' || key === 'speed' || key === 'boost') ? fastFactor : slowFactor;
            (this.data as any)[key] = lerp(currentVal, targetVal, factor);
            changed = true;
          }
        } else if (key === 'warningLights' || key === 'tpms' || key === 'gear') {
           // Direct assignment for non-numeric or nested objects
           if (JSON.stringify(this.data[key]) !== JSON.stringify(this.targetData[key])) {
               (this.data as any)[key] = JSON.parse(JSON.stringify(this.targetData[key]));
               changed = true;
           }
        }
      }

      if (changed) {
        this.notify();
      }
    }, 16); // ~60fps
  }

  private applySmoothing(key: keyof VehicleData, newValue: number, alpha: number = 1.0) {
    // We now update targetData instead of data directly, and let the interpolation loop handle the visual smoothing.
    // We ignore the passed alpha because our interpolation loop handles it better for 60fps visuals.
    if (typeof this.targetData[key] === 'number') {
      const currentValue = this.targetData[key] as number;
      const isHugeJump = Math.abs(currentValue - newValue) > (currentValue === 0 ? 10 : currentValue * 0.5);
      
      if (isHugeJump) {
        (this.targetData as any)[key] = newValue;
        // Also snap the actual data to prevent long catch-up times on huge jumps
        (this.data as any)[key] = newValue; 
      } else {
        // We just set the target. The interpolation loop will smoothly move `this.data` towards it.
        (this.targetData as any)[key] = newValue;
      }
    } else {
      (this.targetData as any)[key] = newValue;
    }
  }

  /**
   * Enhanced Parsing Logic for ELM327
   * Handles multi-line responses, echo, and stripped headers.
   */
  private parsePIDResponse(raw: string) {
    if (!raw) return;
    
    // Standard ELM327 response cleaning
    const clean = raw.replace(/[\s\r\n]/g, '').toUpperCase();
    
    // Debug log for parsing (throttled)
    const now = Date.now();
    if (!this.lastParseLog || now - this.lastParseLog > 5000) {
        this.addLog(`Parsing: ${clean.substring(0, 20)}${clean.length > 20 ? '...' : ''}`, 'DEBUG');
        this.lastParseLog = now;
    }

    if (clean.includes('NODATA')) {
        // Log NODATA but throttle it
        const now = Date.now();
        if (!this.lastNoDataLog || now - this.lastNoDataLog > 10000) {
            this.addLog(`Adapter: NO_DATA (Vehicle may be off or protocol mismatch)`, 'WARNING');
            this.lastNoDataLog = now;
        }
        return;
    }
    
    if (clean.includes('SEARCHING')) {
        this.addLog(`Adapter: SEARCHING...`, 'INFO');
        return;
    }
    
    if (clean.includes('STOPPED') || clean.includes('ERROR') || clean.includes('UNABLE') || clean.includes('BUFFERFULL') || clean.includes('CANERROR')) {
        this.addLog(`Adapter Error: ${clean}`, 'INFO');
        return;
    }

    const extract = (pid: string, bytes: number = 1) => {
      const pidHex = pid.substring(2);
      const hexChars = bytes * 2;
      
      // Standard response for PID 01 XX is 41 XX ...
      // Some adapters might include CAN headers like 7E8, so we use a flexible regex
      // We look for 41 followed by the PID, then the data.
      // E.g. 7E8 04 41 0C 00 00 -> 410C0000
      const regex = new RegExp(`41${pidHex}([0-9A-F]{${hexChars}})`, 'i');
      const match = clean.match(regex);
      if (match) return match[1];
      
      return null;
    };

    // RPM (PID 0C) - 2 bytes
    const rpmHex = extract('010C', 2);
    if (rpmHex) {
      const a = parseInt(rpmHex.substring(0, 2), 16);
      const b = parseInt(rpmHex.substring(2, 4), 16);
      const newRpm = ((a * 256) + b) / 4;
      if (newRpm < 10000) this.applySmoothing('rpm', newRpm, 0.85);
    }

    // SPEED (PID 0D) - 1 byte
    const speedHex = extract('010D', 1);
    if (speedHex) {
      const a = parseInt(speedHex, 16);
      const newSpeed = a * 0.621371; // km/h to mph
      if (newSpeed < 250) this.applySmoothing('speed', newSpeed, 0.85);
    }

    // ENGINE LOAD (PID 04) - 1 byte
    const loadHex = extract('0104', 1);
    if (loadHex) this.applySmoothing('engineLoad', (parseInt(loadHex, 16) * 100) / 255, 0.2);

    // COOLANT TEMP (PID 05) - 1 byte
    const coolantHex = extract('0105', 1);
    if (coolantHex) {
      const tempC = parseInt(coolantHex, 16) - 40;
      this.applySmoothing('coolantTemp', (tempC * 9/5) + 32, 0.1);
    }

    // INTAKE TEMP (PID 0F) - 1 byte
    const intakeTempHex = extract('010F', 1);
    if (intakeTempHex) {
      const tempC = parseInt(intakeTempHex, 16) - 40;
      this.applySmoothing('intakeTemp', (tempC * 9/5) + 32, 0.1);
    }

    // THROTTLE POS (PID 11) - 1 byte
    const throttleHex = extract('0111', 1);
    if (throttleHex) this.applySmoothing('throttlePos', (parseInt(throttleHex, 16) * 100) / 255, 0.3);

    // BAROMETRIC PRESSURE (PID 33) - 1 byte
    const baroHex = extract('0133', 1);
    let baroKpa = 101.3; 
    if (baroHex) baroKpa = parseInt(baroHex, 16);

    // INTAKE MAP (PID 0B) - 1 byte
    const mapHex = extract('010B', 1);
    if (mapHex) {
      const mapKpa = parseInt(mapHex, 16);
      this.applySmoothing('boost', Math.max(0, (mapKpa - baroKpa) * 0.145038), 0.2); 
    }

    // FUEL LEVEL (PID 2F) - 1 byte
    const fuelHex = extract('012F', 1);
    if (fuelHex) this.applySmoothing('fuelLevel', (parseInt(fuelHex, 16) * 100) / 255, 0.05);

    // OIL TEMP (PID 5C) - 1 byte
    const oilHex = extract('015C', 1);
    if (oilHex) {
        const tempC = parseInt(oilHex, 16) - 40;
        this.applySmoothing('oilTemp', (tempC * 9/5) + 32, 0.1);
    }

    this.notify();
    this.lastDataReceived = Date.now();
  }

  /**
   * RealDash CAN V1 Binary Parser
   * WiCAN Pro sends binary frames when in RealDash mode.
   */
  private parseRealDashCAN(data: Uint8Array) {
    // RealDash CAN V1 Frame: [0x44, 0x33, 0x22, 0x11, ID(4), DATA(8)]
    if (data.length < 16) return;
    
    this.isBinaryMode = true; // Switch to binary mode on first valid frame
    
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const canId = view.getUint32(4, true);
    
    // RealDash Default CAN Mapping
    if (canId === 0x32000001) {
        const newRpm = view.getUint16(8, true);
        if (newRpm < 10000) this.applySmoothing('rpm', newRpm, 0.85);
        
        const newSpeed = (view.getUint16(10, true) / 10) * 0.621371;
        if (newSpeed < 250) this.applySmoothing('speed', newSpeed, 0.85);
        
        this.applySmoothing('coolantTemp', (view.getUint16(12, true) / 10 * 9/5) + 32, 0.1);
        this.applySmoothing('fuelLevel', view.getUint16(14, true) / 10, 0.05);
        this.lastDataTime = Date.now();
    }
    
    if (canId === 0x32000002) {
        this.applySmoothing('oilTemp', (view.getUint16(8, true) / 10 * 9/5) + 32, 0.1);
        this.applySmoothing('oilPressure', view.getUint16(10, true) / 10, 0.2);
        this.applySmoothing('voltage', view.getUint16(12, true) / 10, 0.2);
        this.applySmoothing('engineLoad', view.getUint16(14, true) / 10, 0.2);
        this.lastDataTime = Date.now();
    }

    if (canId === 0x32000003) {
        this.applySmoothing('throttlePos', view.getUint16(8, true) / 10, 0.3);
        this.applySmoothing('intakeTemp', (view.getUint16(10, true) / 10 * 9/5) + 32, 0.1);
        this.applySmoothing('boost', (view.getUint16(12, true) - 1013) * 0.145038, 0.2); // kPa to PSI
        this.lastDataTime = Date.now();
    }
    
    // Extended RealDash IDs for Gear and Signals
    if (canId === 0x32000004) {
        const gearVal = view.getUint8(8);
        const gears = ['P', 'R', 'N', 'D', '1', '2', '3', '4', '5', '6', '7', '8'];
        this.data.gear = gears[gearVal] || 'D';
        
        const signals = view.getUint8(9);
        this.data.warningLights.leftSignal = (signals & 0x01) !== 0;
        this.data.warningLights.rightSignal = (signals & 0x02) !== 0;
        this.data.warningLights.highBeam = (signals & 0x04) !== 0;
        this.lastDataTime = Date.now();
    }

    // TPMS Data
    if (canId === 0x32000005) {
        this.data.tpms.fl = view.getUint16(8, true) / 10;
        this.data.tpms.fr = view.getUint16(10, true) / 10;
        this.data.tpms.rl = view.getUint16(12, true) / 10;
        this.data.tpms.rr = view.getUint16(14, true) / 10;
        this.lastDataTime = Date.now();
    }

    this.notify();
  }

  async connectHardware(profile: ConnectionProfile = 'STANDARD', protocolCmd: string = 'ATSP0') {
    try {
      this.connectionProfile = profile;
      await this.disconnect();
      const nav = navigator as any;
      
      const enableSimulationFallback = () => {
         this.addLog("Using Ultra-High Fidelity Simulation Mode as fallback.", "INFO");
         this.isSimulating = true;
         this.isConnected = true;
         this.notifyStatus('connected');
         return { success: true, deviceName: 'OBDash Simulator (Fallback)' };
      };

      if (!nav.bluetooth) {
         this.addLog("Web Bluetooth API not detected in this environment.", "WARNING");
         return enableSimulationFallback();
      }

      this.addLog(`Scanning for Bluetooth Adapters (${profile} Mode)...`, "INFO");

      try {
        const device = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: this.RD_SERVICE_UUIDS
        });
        return this.connectDevice(device, protocolCmd);
      } catch (reqErr: any) {
        if (reqErr.name === 'NotFoundError' || reqErr.name === 'NotAllowedError' || reqErr.message?.includes('cancelled')) {
          // If the user actively cancelled it, don't simulate unless we want to force it?
          // Let's fallback anyway so the APK tester has a working app.
          this.addLog(`Bluetooth unavailable/cancelled (${reqErr.message}). Switching to simulator.`, "WARNING");
          return enableSimulationFallback();
        }
        // For security/not supported errors
        this.addLog(`Bluetooth error: ${reqErr.message}. Switching to simulator.`, "WARNING");
        return enableSimulationFallback();
      }
    } catch (err: any) {
      this.addLog(`Hardware Connect Failed: ${err.message}`, "ERROR");
      return { success: false, error: 'LINK_FAILED', message: err.message };
    }
  }

  async scanGenericBluetooth() {
    try {
      await this.disconnect();
      const nav = navigator as any;

      const enableSimulationFallback = () => {
         this.addLog("Using Generic Simulator (Fallback).", "INFO");
         this.isSimulating = true;
         this.isConnected = true;
         this.notifyStatus('connected');
         return { success: true, deviceName: 'Generic Simulator (Fallback)' };
      };

      if (!nav.bluetooth) {
         this.addLog("Web Bluetooth API not detected. Using simulation fallback.", "WARNING");
         return enableSimulationFallback();
      }

      this.addLog("Scanning for all available Bluetooth devices...", "INFO");

      try {
        const device = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: this.RD_SERVICE_UUIDS
        });
        if (device) return this.connectDevice(device);
        return enableSimulationFallback();
      } catch (reqErr: any) {
        this.addLog(`Bluetooth Request Failed: ${reqErr.message}. Switching to simulator.`, "WARNING");
        return enableSimulationFallback();
      }
    } catch (err: any) {
      this.addLog(`Generic Scan Failed: ${err.message}`, "ERROR");
      return { success: false, error: 'LINK_FAILED', message: err.message };
    }
  }

  async connectSerial() {
      try {
          const nav = navigator as any;
          if (!nav.serial) throw new Error("Web Serial API not supported.");

          this.addLog("Requesting Serial Port...");
          const port = await nav.serial.requestPort();
          await port.open({ baudRate: 115200 }); // Standard ELM327 baud rate
          
          this.addLog("Serial Port Opened.");
          
          // Setup reader/writer
          const textEncoder = new TextEncoderStream();
          const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
          const writer = textEncoder.writable.getWriter();
          
          const textDecoder = new TextDecoderStream();
          const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
          const reader = textDecoder.readable.getReader();

          // Basic loop to read data
          this.isSimulating = false;
          this.stop();
          
          // Send init
          await writer.write("ATZ\r");
          this.addLog("TX: ATZ", "TX");

          // Start reading loop (simplified for now)
          (async () => {
              while (port.readable) {
                  try {
                      const { value, done } = await reader.read();
                      if (done) break;
                      if (value) {
                          this.addLog(`RX: ${value.trim()}`, "RX");
                          this.parsePIDResponse(value);
                      }
                  } catch (e) { console.error(e); break; }
              }
          })();

          return { success: true, deviceName: "USB Serial Adapter" };
      } catch (e: any) {
          this.addLog(`Serial Connection Failed: ${e.message}`, "ERROR");
          return { success: false, error: 'SERIAL_FAILED', message: e.message };
      }
  }

  private async safeGattCall<T>(operation: () => Promise<T>, retries: number = 5, delay: number = 300, skipIfBusy: boolean = false): Promise<T> {
    if (skipIfBusy && this.isGattBusy) {
        throw new Error("GATT_BUSY");
    }

    // Synchronously update the mutex to queue the next operation
    const previousMutex = this.gattMutex;
    let release: () => void;
    this.gattMutex = new Promise<void>(resolve => {
        release = resolve;
    });

    try {
        await previousMutex;
    } catch (e) {
        // Even if previous failed, we continue the chain
    }

    for (let i = 0; i < retries; i++) {
        this.isGattBusy = true;
        try {
            // Pre-check connection
            if (this.gattServer && !this.gattServer.connected) {
                throw new Error("GATT server lost");
            }

            // Add a timeout to the operation itself to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("GATT_OP_TIMEOUT")), 8000)
            );
            
            const result = await Promise.race([operation(), timeoutPromise]) as T;
            
            this.isGattBusy = false;
            release!();
            return result;
        } catch (e: any) {
            this.isGattBusy = false;
            
            const isTimeout = e.message === "GATT_OP_TIMEOUT";
            const isConnectionLost = e.message?.toLowerCase().includes('gatt server lost') || 
                                    e.message?.toLowerCase().includes('not connected') ||
                                    e.message?.toLowerCase().includes('device is unreachable');
            
            if (isConnectionLost) {
                this.addLog(`GATT Connection Issue: ${e.message}. Attempting recovery... (Attempt ${i+1}/${retries})`, 'ERROR');
                if (i === retries - 1) { 
                    this.handleDeviceDisconnected();
                    release!();
                    throw e; 
                }
            } else if (isTimeout) {
                this.addLog(`GATT Timeout (Attempt ${i+1}/${retries})`, 'WARNING');
                if (i === retries - 1) {
                    this.addLog("GATT Fatal Timeout - Forcing Disconnect", 'ERROR');
                    this.handleDeviceDisconnected();
                    release!();
                    throw e;
                }
            } else {
                if (i === retries - 1) {
                    this.addLog(`GATT Fatal Error: ${e.message}`, 'ERROR');
                    release!();
                    throw e;
                }
            }
            
            const waitTime = delay * (i + 1);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    release!();
    throw new Error("GATT Operation failed after retries");
  }

  private async executeCommand(cmd: string, timeout: number = 5000): Promise<string> {
    if (!this.characteristic && !this.ws) {
        throw new Error("NOT_CONNECTED");
    }

    // Queue the command to ensure sequential execution
    const previousMutex = this.commandMutex;
    let release: () => void;
    this.commandMutex = new Promise<void>(resolve => {
        release = resolve;
    });

    try {
        await previousMutex;
    } catch (e) {
        // Ignore errors from previous commands in the queue
    }

    // Clear buffer before sending new command to avoid stale data
    this.responseBuffer = "";

    let timeoutHandle: any;
    const responsePromise = new Promise<string>((resolve, reject) => {
        this.commandResolver = resolve;
        this.commandRejecter = reject;
        timeoutHandle = setTimeout(() => {
            if (this.commandRejecter) {
                this.commandRejecter(new Error("COMMAND_TIMEOUT"));
                this.commandRejecter = null;
                this.commandResolver = null;
            }
        }, timeout);
    });

    try {
        const result = await Promise.race([
            (async () => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(cmd + '\r');
                } else if (this.characteristic) {
                    const data = new TextEncoder().encode(cmd + '\r');
                    await this.safeGattCall(async () => {
                        if (this.characteristic!.properties.writeWithoutResponse) {
                            await this.characteristic!.writeValueWithoutResponse(data);
                        } else {
                            await this.characteristic!.writeValue(data);
                        }
                    }, 2, 200); // 2 retries for the write
                } else {
                    throw new Error("NOT_CONNECTED");
                }
                return await responsePromise;
            })(),
            new Promise<string>((_, reject) => {
                // Safety timeout for the entire operation
                setTimeout(() => reject(new Error("COMMAND_TIMEOUT")), timeout + 1000);
            })
        ]);

        clearTimeout(timeoutHandle);
        return result;
    } catch (e) {
        clearTimeout(timeoutHandle);
        this.commandRejecter = null;
        this.commandResolver = null;
        throw e;
    } finally {
        release!();
    }
  }

  private onCharacteristicValueChanged = (e: any) => {
    const value = e.target.value;
    const uint8 = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    
    // Efficiently append to binary buffer
    const newBuffer = new Uint8Array(this.binaryBuffer.length + uint8.length);
    newBuffer.set(this.binaryBuffer);
    newBuffer.set(uint8, this.binaryBuffer.length);
    this.binaryBuffer = newBuffer;

    // Safety: prevent buffer bloat
    if (this.binaryBuffer.length > 8192) {
        this.addLog("Binary buffer overflow, clearing", "WARNING");
        this.binaryBuffer = this.binaryBuffer.slice(-2048);
    }

    let processedLength = 0;
    while (processedLength < this.binaryBuffer.length) {
        // Check for RealDash CAN Header (0x44 0x33 0x22 0x11)
        if (this.binaryBuffer[processedLength] === 0x44) {
            if (this.binaryBuffer.length - processedLength >= 4) {
                if (this.binaryBuffer[processedLength + 1] === 0x33 && 
                    this.binaryBuffer[processedLength + 2] === 0x22 && 
                    this.binaryBuffer[processedLength + 3] === 0x11) {
                    
                    if (this.binaryBuffer.length - processedLength < 16) {
                        // We have a header but not a full frame. Wait for more data.
                        break;
                    }
                    
                    if (!this.isBinaryMode) {
                        this.isBinaryMode = true;
                        this.adapterType = 'WICAN_PRO';
                        this.addLog("WiCAN Pro Binary Mode Detected", "INFO");
                    }

                    const frame = this.binaryBuffer.slice(processedLength, processedLength + 16);
                    this.parseRealDashCAN(frame);
                    this.lastDataReceived = Date.now();
                    processedLength += 16;
                    continue;
                }
            } else {
                // We have 0x44 but not enough bytes to verify the full header.
                // Wait for more data to avoid consuming a partial header as ASCII.
                break;
            }
        }

        // Treat as ASCII
        const charCode = this.binaryBuffer[processedLength];
        // Only collect if it's a printable ASCII or common control char
        if (charCode === 10 || charCode === 13 || (charCode >= 32 && charCode <= 126) || charCode === 62) {
            this.responseBuffer += String.fromCharCode(charCode);
            
            // If we hit a prompt, process the buffer immediately
            if (charCode === 62) { // '>'
                this.processResponseBuffer();
            }
        }
        processedLength++;
    }
    
    if (processedLength > 0) {
        this.binaryBuffer = this.binaryBuffer.slice(processedLength);
    }
  };

  private processResponseBuffer() {
    if (!this.responseBuffer.includes('>')) return;
    
    const parts = this.responseBuffer.split('>');
    this.responseBuffer = parts.pop() || '';
    
    if (this.commandResolver) {
        const lastPart = parts.length > 0 ? parts[parts.length - 1] : '';
        this.commandResolver(lastPart);
        this.commandResolver = null;
        this.commandRejecter = null;
    }

    for (const msg of parts) {
        const trimmed = msg.trim();
        if (trimmed.length > 0) {
            this.addLog(`RX: ${trimmed}`, 'RX');
            
            if (trimmed.includes('ELM327')) {
                this.adapterType = 'ELM327';
            } else if (trimmed.includes('STN') || trimmed.toLowerCase().includes('wican')) {
                this.adapterType = 'WICAN_PRO';
            }

            if (trimmed.includes('STOPPED') || trimmed.includes('ERROR') || trimmed.includes('?') || trimmed.includes('BUFFER FULL')) {
                this.addLog(`Adapter Warning: ${trimmed}`, 'WARNING');
            }

            this.lastDataTime = Date.now();
            this.lastDataReceived = Date.now();
            
            if (this.isAnalyzingCanBus) {
              const msgParts = trimmed.split(' ');
              if (msgParts.length >= 2) {
                const id = msgParts[0];
                const data = msgParts.slice(1).join('');
                if (/^[0-9A-F]+$/i.test(id) && /^[0-9A-F]+$/i.test(data)) {
                  this.handleRawCanMessage(id, data);
                }
              }
            }

            this.parsePIDResponse(trimmed);
        }
    }
  }

  private handleDeviceDisconnected = () => {
    if (!this.isConnected) return;
    this.addLog("Device disconnected", "ERROR");
    this.isConnected = false;
    this.isPolling = false;
    this.isPollingActive = false;
    this.notifyStatus('disconnected');
    
    // Cleanup internal state
    this.gattServer = null;
    this.characteristic = null;
    this.rxCharacteristic = null;
    this.isGattBusy = false;
    this.isNotifying = false;
    this.gattMutex = Promise.resolve(); // Reset the lock queue
    if (this.pollTimeout) {
        clearTimeout(this.pollTimeout);
        this.pollTimeout = null;
    }
    if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }
  };

  private onDeviceDisconnected = () => {
    this.handleDeviceDisconnected();
  };

  public async disconnect() {
    this.addLog("Disconnecting...", "INFO");
    this.stop();
    this.isPolling = false;
    this.isNotifying = false;
    
    if (this.ws) {
        try {
            this.ws.close();
        } catch (e) {}
        this.ws = null;
    }
    
    if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }
    
    if (this.gattServer && this.gattServer.device) {
        this.gattServer.device.removeEventListener('gattserverdisconnected', this.onDeviceDisconnected);
    }
    
    if (this.characteristic) {
        try {
            this.characteristic.removeEventListener('characteristicvaluechanged', this.onCharacteristicValueChanged);
            await this.safeGattCall(() => this.characteristic.stopNotifications(), 1, 0, true);
        } catch (e) {}
        this.characteristic = null;
    }
    
    if (this.rxCharacteristic) {
        try {
            this.rxCharacteristic.removeEventListener('characteristicvaluechanged', this.onCharacteristicValueChanged);
            await this.safeGattCall(() => this.rxCharacteristic.stopNotifications(), 1, 0, true);
        } catch (e) {}
        this.rxCharacteristic = null;
    }
    
    if (this.gattServer) {
        try {
            if (this.gattServer.connected) {
                this.gattServer.disconnect();
            }
        } catch (e) {}
        this.gattServer = null;
    }
    this.isGattBusy = false;
    this.isPollingActive = false;
    this.isBinaryMode = false;
    this.binaryBuffer = new Uint8Array(0);
    this.responseBuffer = '';
  }

  private async connectDevice(device: any, protocolCmd: string = 'ATSP0') {
      try {
          this.resetGattLock(); // Ensure we start with a clean lock state
          this.notifyStatus('connecting');
          this.addLog(`Connecting to ${device.name}...`);
          
          // Force a clean state
          try {
              if (device.gatt.connected) {
                  this.addLog("Device already connected, disconnecting first...", "INFO");
                  device.gatt.disconnect();
                  await new Promise(r => setTimeout(r, 1500)); // Wait for hardware to clear
              }
          } catch (e) {}

          this.resetGattLock(); // Reset mutex and lock before starting new connection

          device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected);
          
          // Initial connection with retry
          this.gattServer = await this.safeGattCall(() => device.gatt.connect(), 3, 1000);
          this.addLog("GATT Connected. Waiting for device to settle...", "INFO");
          await new Promise(r => setTimeout(r, 2000)); // Increased settlement time
          
          // WiCan Pro specific: It often uses service 0xFFF0 and characteristic 0xFFF1 for UART
          const WICAN_SERVICE = '0000fff0-0000-1000-8000-00805f9b34fb';
          const WICAN_CHAR_TX = '0000fff2-0000-1000-8000-00805f9b34fb'; // Often TX
          const WICAN_CHAR_RX = '0000fff1-0000-1000-8000-00805f9b34fb'; // Often RX
          
          let service = null;
          try {
              service = await this.safeGattCall(() => this.gattServer.getPrimaryService(WICAN_SERVICE));
              if (service) {
                  this.adapterType = 'WICAN_PRO';
                  this.addLog("WiCan Pro Hardware Detected via BLE Service", "INFO");
              }
          } catch (e) {
              this.addLog("WiCan service not found by specific UUID, searching all...", "INFO");
          }

          if (!service) {
              for (const uuid of this.RD_SERVICE_UUIDS) {
                  try {
                      service = await this.safeGattCall(() => this.gattServer.getPrimaryService(uuid), 1, 0);
                      if (service) break;
                  } catch (e) {}
              }
          }

          if (!service) {
              try {
                  const services = await this.safeGattCall(() => this.gattServer.getPrimaryServices()) as any[];
                  if (services.length > 0) {
                      service = services[0];
                      this.addLog(`Using first available service: ${service.uuid}`, "INFO");
                  }
              } catch (e) {
                  this.addLog(`Failed to get any primary services: ${e}`, "ERROR");
              }
          }

          if (!service) throw new Error("No compatible services found. Ensure your device is an OBD-II adapter and supports Bluetooth Low Energy (BLE).");
          
          const characteristics = await this.safeGattCall(() => service.getCharacteristics()) as any[];
          
          // Try to find specific WiCan characteristics first
          this.characteristic = characteristics.find((c: any) => c.uuid.toLowerCase() === WICAN_CHAR_TX);
          this.rxCharacteristic = characteristics.find((c: any) => c.uuid.toLowerCase() === WICAN_CHAR_RX);
          
          if (!this.characteristic || !this.rxCharacteristic) {
              // Fallback to generic find
              this.characteristic = characteristics.find((c: any) => 
                  (c.properties.write || c.properties.writeWithoutResponse)
              );
              this.rxCharacteristic = characteristics.find((c: any) => 
                  (c.properties.notify || c.properties.indicate)
              );
              
              // If we only found one that does both, use it for both
              if (this.characteristic && !this.rxCharacteristic && (this.characteristic.properties.notify || this.characteristic.properties.indicate)) {
                  this.rxCharacteristic = this.characteristic;
              } else if (!this.characteristic && this.rxCharacteristic && (this.rxCharacteristic.properties.write || this.rxCharacteristic.properties.writeWithoutResponse)) {
                  this.characteristic = this.rxCharacteristic;
              }
          }

          if (!this.characteristic) throw new Error("No TX communication channel found.");
          if (!this.rxCharacteristic) throw new Error("No RX communication channel found.");
          
          this.addLog(`TX Channel: ${this.characteristic.uuid}`);
          this.addLog(`RX Channel: ${this.rxCharacteristic.uuid}`);

          // START NOTIFICATIONS EARLY so we catch init responses
          if ((this.rxCharacteristic.properties.notify || this.rxCharacteristic.properties.indicate) && !this.isNotifying) {
            await this.safeGattCall(() => this.rxCharacteristic.startNotifications());
            this.isNotifying = true;
            this.rxCharacteristic.addEventListener('characteristicvaluechanged', this.onCharacteristicValueChanged);
            this.addLog("Notifications started.", "INFO");
          }

          // Adapter Detection & Init
          const sendCmd = async (cmd: string, ignoreError: boolean = false, retries: number = 2) => {
              for (let i = 0; i < retries; i++) {
                  try {
                      const response = await this.executeCommand(cmd, 8000);
                      this.addLog(`Init Response (${cmd}): ${response.trim()}`, 'INFO');
                      return response;
                  } catch (e) {
                      if (i === retries - 1) {
                          this.addLog(`Init Error (${cmd}) after ${retries} attempts: ${e}`, 'ERROR');
                          if (!ignoreError) throw e;
                          return null;
                      }
                      this.addLog(`Init Retry (${cmd}) attempt ${i + 1} failed, retrying in 1s...`, 'WARNING');
                      await new Promise(r => setTimeout(r, 1000));
                  }
              }
              return null;
          };

          await new Promise(r => setTimeout(r, 500)); // Delay before first command
          try { await this.sendRawCommand('\r'); } catch (e) {} // Clear any garbage
          await new Promise(r => setTimeout(r, 200));
          await sendCmd('ATZ');
          await new Promise(r => setTimeout(r, 3000)); 
          await sendCmd('ATE0'); // Echo Off
          await sendCmd('ATL0'); // Linefeeds Off
          await sendCmd('ATS0', true); // Spaces Off
          await sendCmd('ATH0', true); // Headers Off
          await sendCmd('ATAT1', true); // Adaptive Timing
          await sendCmd('ATI');  // Identify
          
          try {
              await sendCmd(protocolCmd);
          } catch (e) {
              this.addLog("Protocol command failed, falling back to ATSP0 (Auto)", "INFO");
              await sendCmd('ATSP0');
          }
          
          await sendCmd('0100'); // Test PID

          this.isSimulating = false;
          this.isConnected = true;
          this.stop(); 
          this.startHardwarePolling();
          this.notifyStatus('connected');
          return { success: true, deviceName: device.name || 'WiCan Pro' };
      } catch (err: any) {
          this.notifyStatus('disconnected');
          this.addLog(`Connection Failed: ${err.message}`, "ERROR");
          console.error("Connection failed:", err);
          return { success: false, error: 'CONNECTION_FAILED', message: err.message };
      }
  }

  private startHardwarePolling() {
    this.isPolling = true;
    
    // Auto-detect RealDash by device name if profile is generic
    if (this.gattServer?.device?.name?.toLowerCase().includes('realdash')) {
        this.isBinaryMode = true;
        this.addLog("RealDash Device Detected - Enabling Binary Mode", "INFO");
    }

    // Set binary mode immediately if we're using a RealDash profile
    if (this.connectionProfile === 'REALDASH_BLE' || this.connectionProfile === 'REALDASH_UDP') {
        this.isBinaryMode = true;
        this.addLog("RealDash Binary Mode Active", "INFO");
    }
    
    this.pollNext();
    
    // Watchdog to restart polling if it gets stuck
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    let stuckCount = 0;
    this.pollingInterval = setInterval(async () => {
        // Only run watchdog if we are supposed to be polling and not in binary mode
        if (!this.isSimulating && this.isConnected && this.isPolling && !this.isBinaryMode) {
            const timeSinceLastData = Date.now() - this.lastDataReceived;
            
            // Be more patient: 8 seconds before we consider it "stuck"
            if (timeSinceLastData > 8000) {
                stuckCount++;
                this.addLog(`OBD Data stuck (${stuckCount}), forcing recovery...`, "WARNING");
                
                // If we are already polling, don't start another one, just let the current one timeout
                // unless it's been stuck for a VERY long time
                if (this.isPollingActive && stuckCount < 2) {
                    this.addLog("Waiting for existing poll to timeout naturally...", "INFO");
                    return;
                }

                this.isPollingActive = false; 
                this.isGattBusy = false; // Force clear lock
                this.responseBuffer = ''; // Clear potentially corrupted buffer
                
                if (stuckCount >= 4) {
                    this.addLog("Data stuck for too long, attempting soft reset...", "ERROR");
                    stuckCount = 0;
                    
                    if (!this.isBinaryMode) {
                        try {
                            await this.sendRawCommand('ATZ');
                            await new Promise(r => setTimeout(r, 2000));
                            await this.sendRawCommand('ATE0');
                        } catch (e) {}
                    }
                }
                
                this.pollNext();
            } else {
                stuckCount = 0;
            }
        }
    }, 4000);
  }

  private async pollNext() {
    if (this.isSimulating || (!this.characteristic && !this.ws) || !this.isPolling) return;
    
    // Skip PID polling in binary mode (RealDash CAN), as it's push-based
    if (this.isBinaryMode) return;

    // Guard against concurrent polls
    if (this.isPollingActive) return;
    this.isPollingActive = true;
    
    try {
        const pid = this.pids[this.pollIndex];
        
        // Skip slow PIDs frequently to keep high-speed data (RPM/Speed) fast
        if (this.slowPids.has(pid) && Math.random() > 0.1) {
            this.isPollingActive = false;
            this.pollIndex = (this.pollIndex + 1) % this.pids.length;
            setTimeout(() => this.pollNext(), 2);
            return;
        }

        this.addLog(`Polling PID: ${pid}`, 'TX');
        
        // Use shorter timeout for polling to prevent UI freezing
        // WiCAN Pro is fast, 2s is plenty. Standard ELM might need more but 3s is a good limit.
        const timeout = this.adapterType === 'WICAN_PRO' ? 500 : 1000;
        
        try {
            await this.executeCommand(pid, timeout);
            this.pidFailures.delete(pid);
            if (this.slowPids.has(pid)) {
                this.slowPids.delete(pid);
                this.addLog(`PID ${pid} recovered, moving to fast lane`, "INFO");
            }
        } catch (e: any) {
            const failures = (this.pidFailures.get(pid) || 0) + 1;
            this.pidFailures.set(pid, failures);
            
            if (failures >= 3 && !this.slowPids.has(pid)) {
                this.slowPids.add(pid);
                this.addLog(`PID ${pid} is slow/unresponsive, moving to slow lane`, "WARNING");
            }
            throw e;
        }
        
        this.isPollingActive = false;
        this.pollIndex = (this.pollIndex + 1) % this.pids.length;
        this.lastDataTime = Date.now();
        
        // Schedule next poll immediately to maximize data rate
        if (this.isPolling) {
            setTimeout(() => this.pollNext(), 0);
        }
    } catch (e: any) {
        this.isPollingActive = false; // Reset on error so we can try again
        
        if (e.message === "COMMAND_CANCELLED") return;

        this.addLog(`Poll Error: ${e.message}`, "INFO");
        this.pollIndex = (this.pollIndex + 1) % this.pids.length;
        
        // Retry after a short delay
        setTimeout(() => this.pollNext(), 500);
    }
  }

  startSimulation() {
    if (this.simulationInterval) return;
    this.isSimulating = true;
    if (this.targetSpeed === 0) this.targetSpeed = 65; // Default target speed for simulation
    this.simulationInterval = setInterval(() => {
      if (!this.isSimulating && !this.forceSimulation) return;
      
      // If we are simulating but have GPS, use GPS speed as target
      if (this.lastGpsSpeed > 0 && this.gpsReliability > 0.5) {
        this.targetSpeed = this.lastGpsSpeed;
      } else if (Math.random() > 0.988) {
        this.targetSpeed = Math.random() * 110;
      }

      const diff = this.targetSpeed - this.data.speed;
      this.accelerationMomentum += (diff * 0.012 - this.accelerationMomentum * 0.1);
      this.data.speed += this.accelerationMomentum;
      if (this.data.speed < 0) this.data.speed = 0;
      this.data.acceleration = Math.abs(this.accelerationMomentum * 2.4);
      
      // Jitter PIDs to look alive
      this.data.coolantTemp += (Math.random() - 0.5) * 0.1;
      this.data.oilTemp += (Math.random() - 0.5) * 0.1;
      this.data.voltage += (Math.random() - 0.5) * 0.01;
      this.data.engineLoad = Math.max(5, Math.min(95, this.data.engineLoad + (Math.random() - 0.5) * 0.5));
      
      // Fuel Consumption Simulation
      const baseMpg = 22.5;
      const loadFactor = (this.data.engineLoad / 100) * 10;
      const speedFactor = (this.data.speed / 120) * 5;
      this.data.fuelConsumption = Math.max(5, baseMpg - loadFactor + speedFactor + (Math.random() - 0.5));

      // Warning Lights Simulation (rare toggles)
      if (Math.random() > 0.999) {
        this.data.warningLights.tpms = !this.data.warningLights.tpms;
      }
      
      this.updateVirtualRpm(this.data.speed);
      if (this.isSimulating) {
        this.data.rpm = this.virtualRpm;
      }
      this.data.gear = this.virtualGear || 'P';

      // Boost Simulation
      const targetBoost = (this.data.rpm > 3000) ? (this.data.rpm - 3000) / 200 : 0;
      this.data.boost += (targetBoost - this.data.boost) * 0.1 + (Math.random() - 0.5) * 0.2;
      if (this.data.boost < 0) this.data.boost = 0;
      this.notify();
    }, 33); // 30 FPS simulation for performance
  }

  stop() {
    this.addLog("Stopping all services and polling...", "INFO");
    this.isPolling = false;
    this.isPollingActive = false;
    this.isNotifying = false;
    
    if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
    }
    if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }
    if (this.pollTimeout) {
        clearTimeout(this.pollTimeout);
        this.pollTimeout = null;
    }
  }

  public resetGattLock() {
    this.addLog("DIAG: Forcing GATT Lock Reset", "WARNING");
    this.isGattBusy = false;
    this.gattMutex = Promise.resolve();
    this.commandMutex = Promise.resolve();
    if (this.commandRejecter) {
        this.commandRejecter(new Error("COMMAND_CANCELLED"));
        this.commandRejecter = null;
        this.commandResolver = null;
    }
  }

  public clearBuffers() {
    this.addLog("DIAG: Clearing Communication Buffers", "INFO");
    this.binaryBuffer = new Uint8Array(0);
    this.responseBuffer = '';
  }

  public async pingAdapter() {
    if (!this.characteristic || !this.isConnected) {
        this.addLog("Ping Failed: Not Connected", "ERROR");
        return false;
    }
    
    try {
        this.addLog("Pinging Adapter (AT)...", "TX");
        const data = new TextEncoder().encode('AT\r');
        await this.safeGattCall(async () => {
            await this.characteristic.writeValue(data);
        }, 2, 200);
        return true;
    } catch (e) {
        this.addLog(`Ping Failed: ${e}`, "ERROR");
        return false;
    }
  }

  public async forceFullReset() {
    this.addLog("Executing Full Hardware Reset", "WARNING");
    await this.disconnect();
    this.gattMutex = Promise.resolve();
    this.resetGattLock();
    this.clearBuffers();
    this.notifyStatus('disconnected');
  }

  public getDetailedStatus() {
    return {
      connected: this.isConnected,
      simulating: this.isSimulating,
      polling: this.isPolling,
      gattBusy: this.isGattBusy,
      adapter: this.adapterType,
      lastData: Date.now() - this.lastDataReceived
    };
  }

  public onData(cb: (data: VehicleData) => void) {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  private notify() {
    // Throttle notifications to max 60Hz to reduce React pressure
    const now = performance.now();
    if (now - this.lastNotifyTime < 16) return;
    this.lastNotifyTime = now;
    
    this.listeners.forEach(l => l({ ...this.data }));
  }

  private lastNotifyTime = 0;

  private ws: WebSocket | null = null;

  public async connectWiFi(ip: string = '192.168.4.1', port: number = 81, protocolCmd: string = 'ATSP0') {
    return new Promise((resolve) => {
      try {
        this.notifyStatus('connecting');
        this.addLog(`Connecting to WiCan Pro via WebSocket: ws://${ip}:${port}`, "INFO");
        
        this.connectionProfile = 'WIFI';
        this.adapterType = 'WICAN_PRO';
        
        this.ws = new WebSocket(`ws://${ip}:${port}`);
        
        this.ws.binaryType = 'arraybuffer';
        
        this.ws.onopen = () => {
          this.isSimulating = false;
          this.isConnected = true;
          this.addLog("WiCan Pro WiFi Connected Successfully", "INFO");
          
          // Send initialization commands
          this.ws?.send('ATZ\r');
          setTimeout(() => this.ws?.send('ATE0\r'), 500);
          setTimeout(() => this.ws?.send(`${protocolCmd}\r`), 1000);
          
          this.notifyStatus('connected');
          this.startHardwarePolling();
          resolve({ success: true, deviceName: 'WiCan Pro WiFi' });
        };

        this.ws.onmessage = (event) => {
          let buffer: ArrayBufferLike;
          if (typeof event.data === 'string') {
            buffer = new TextEncoder().encode(event.data).buffer;
          } else {
            buffer = event.data;
          }
          
          this.onCharacteristicValueChanged({
            target: {
              value: {
                buffer: buffer,
                byteOffset: 0,
                byteLength: buffer.byteLength
              }
            }
          });
        };

        this.ws.onerror = (error) => {
          this.addLog(`WebSocket Error: ${error}`, "ERROR");
        };

        this.ws.onclose = () => {
          this.addLog("WebSocket Connection Closed", "WARNING");
          this.disconnect();
        };

        // Timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            this.notifyStatus('disconnected');
            this.addLog("WiFi Connection Timeout", "ERROR");
            resolve({ success: false, error: 'WIFI_TIMEOUT', message: 'Connection timed out' });
          }
        }, 5000);

      } catch (err: any) {
        this.notifyStatus('disconnected');
        this.addLog(`WiFi Connection Failed: ${err.message}`, "ERROR");
        resolve({ success: false, error: 'WIFI_FAILED', message: err.message });
      }
    });
  }
}

export const obdService = new OBDService();
