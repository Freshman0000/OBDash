
import { AudioProfile } from '../types';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;
  private initialized = false;

  private currentSourceType: string = 'microphone';
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  async initialize(sourceType: string = 'microphone') {
    if (this.initialized && this.currentSourceType === sourceType) return true;
    
    this.currentSourceType = sourceType;
    
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }

    if (sourceType === 'simulated') {
      this.initialized = true;
      return true; // Use fake data in Equalizer
    }

    try {
      if (sourceType === 'media') {
        // To capture system audio, we often need to request display media (screen sharing) with audio
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: true // Typically required by browsers to prompt for system audio
        });
      } else {
        // microphone or aux (essentially both map to getUserMedia in standard web APIs unless specific devices are selected)
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 2,
          } 
        });
      }

      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.0;

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.7;
        
        this.gainNode.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
      this.sourceNode.connect(this.gainNode!);

      this.initialized = true;
      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.message === 'Permission denied') {
         console.warn("Audio access denied.");
      } else {
         console.error("AudioService initialization failed:", err);
      }
      this.initialized = false;
      return false;
    }
  }

  setSensitivity(value: number) {
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.1);
    }
  }

  // Sound profile logic removed per user request
  setSoundProfile(profile: AudioProfile) {}

  getAnalyser() {
    return this.analyser;
  }

  getDataArray() {
    return this.dataArray;
  }

  isInitialized() {
    return this.initialized;
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const audioService = new AudioService();
