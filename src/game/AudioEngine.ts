// Web Audio API implementation for realistic engine sounds
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  private windBuffer: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;

  private initialized = false;

  constructor() {}

  public init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Engine sound
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth'; // Rough sound for engine
      
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 1000;
      
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0; // Start silent

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();

      // Wind noise (white noise)
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0;
      this.windGain.connect(this.ctx.destination);
      
      this.windBuffer = this.ctx.createBufferSource();
      this.windBuffer.buffer = buffer;
      this.windBuffer.loop = true;
      this.windBuffer.connect(this.windGain);
      this.windBuffer.start();

      this.initialized = true;
    } catch (e) {
      console.warn('AudioContext not supported or blocked');
    }
  }

  public update(speedRatio: number, isAccelerating: boolean) {
    if (!this.initialized || !this.ctx || !this.engineOsc || !this.engineGain || !this.windGain || !this.engineFilter) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Map speed ratio (0 to 1) to Engine RPM frequency (approx 50Hz to 300Hz)
    const minFreq = 40;
    const maxFreq = 250 + (isAccelerating ? 50 : 0); 
    const freq = minFreq + (speedRatio * (maxFreq - minFreq));
    
    // Smooth frequency transition
    this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
    
    // Filter opens up at higher speeds
    this.engineFilter.frequency.setTargetAtTime(500 + (speedRatio * 2000), this.ctx.currentTime, 0.1);

    // Engine volume
    const targetEngineVolume = Math.max(0.05, speedRatio * 0.15);
    this.engineGain.gain.setTargetAtTime(targetEngineVolume, this.ctx.currentTime, 0.1);

    // Wind volume exponentially increases with speed
    const targetWindVolume = Math.pow(speedRatio, 3) * 0.3;
    this.windGain.gain.setTargetAtTime(targetWindVolume, this.ctx.currentTime, 0.2);
  }

  public stop() {
    if (this.engineGain) this.engineGain.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.5);
    if (this.windGain) this.windGain.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.5);
  }

  public destroy() {
    this.engineOsc?.stop();
    this.windBuffer?.stop();
    this.ctx?.close();
    this.initialized = false;
  }
}
