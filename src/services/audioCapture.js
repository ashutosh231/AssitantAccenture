/**
 * Mobile-First Audio Capture & Processing Service
 * Captures microphone audio using MediaDevices & Web Audio API,
 * downsamples to 16kHz mono 16-bit Linear PCM required by Amazon Transcribe,
 * and provides real-time RMS/frequency analysis for live waveform visualization.
 */

export class AudioCaptureService {
  constructor({ onAudioChunk, onAudioLevel, onError }) {
    this.onAudioChunk = onAudioChunk;
    this.onAudioLevel = onAudioLevel;
    this.onError = onError;

    this.mediaStream = null;
    this.audioContext = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.analyserNode = null;
    this.silentGainNode = null;

    this.isListening = false;
    this.isPaused = false;
    this.animFrameId = null;

    this.targetSampleRate = 16000;
  }

  /**
   * Check if browser supports required audio APIs
   */
  static isSupported() {
    return !!(
      typeof window !== 'undefined' &&
      navigator?.mediaDevices?.getUserMedia &&
      (window.AudioContext || window.webkitAudioContext)
    );
  }

  /**
   * Request microphone permission and initialize audio pipeline
   */
  async start() {
    if (this.isListening) return;

    if (!AudioCaptureService.isSupported()) {
      const err = new Error('Browser does not support MediaDevices or Web Audio API.');
      this.onError?.(err);
      throw err;
    }

    try {
      // Laptop speech capture settings:
      // Turn off echoCancellation and noiseSuppression so laptop speaker output is not filtered as background noise.
      const constraints = {
        audio: {
          channelCount: 1,
          sampleRate: this.targetSampleRate,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create Web Audio Context
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx({
        sampleRate: this.targetSampleRate,
        latencyHint: 'interactive'
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Setup AnalyserNode for audio visualization
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;
      this.sourceNode.connect(this.analyserNode);

      // Setup ScriptProcessorNode for audio PCM conversion
      // 2048 buffer size = ~46ms at 44.1kHz, ~128ms at 16kHz
      const bufferSize = 2048;
      this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      const actualSampleRate = this.audioContext.sampleRate;

      this.processorNode.onaudioprocess = (event) => {
        if (!this.isListening || this.isPaused) return;

        const inputChannelData = event.inputBuffer.getChannelData(0);
        // Resample and convert to 16-bit linear PCM little-endian
        const pcmBytes = this.downsampleTo16kPCM(inputChannelData, actualSampleRate);
        if (pcmBytes && pcmBytes.length > 0) {
          this.onAudioChunk?.(pcmBytes);
        }
      };

      // Mute output so microphone doesn't echo back through phone speaker
      this.silentGainNode = this.audioContext.createGain();
      this.silentGainNode.gain.value = 0;

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.silentGainNode);
      this.silentGainNode.connect(this.audioContext.destination);

      this.isListening = true;
      this.isPaused = false;

      // Start level meter loop
      this.startLevelLoop();
    } catch (err) {
      this.cleanup();
      let friendlyMessage = err.message;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyMessage = 'No microphone device found on this phone.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        friendlyMessage = 'Microphone is already in use by another app.';
      }
      const wrapped = new Error(friendlyMessage);
      wrapped.originalError = err;
      this.onError?.(wrapped);
      throw wrapped;
    }
  }

  /**
   * Downsamples input float array to 16000Hz 16-bit Linear PCM Little-Endian
   * @param {Float32Array} floatBuffer
   * @param {number} inputSampleRate
   * @returns {Uint8Array}
   */
  downsampleTo16kPCM(floatBuffer, inputSampleRate) {
    let pcmInt16;
    if (inputSampleRate === 16000) {
      pcmInt16 = new Int16Array(floatBuffer.length);
      for (let i = 0; i < floatBuffer.length; i++) {
        const s = Math.max(-1, Math.min(1, floatBuffer[i]));
        pcmInt16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
    } else {
      const ratio = inputSampleRate / 16000;
      const targetLength = Math.round(floatBuffer.length / ratio);
      pcmInt16 = new Int16Array(targetLength);
      let offsetResult = 0;
      let offsetBuffer = 0;

      while (offsetResult < targetLength) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
        let accum = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < floatBuffer.length; i++) {
          accum += floatBuffer[i];
          count++;
        }
        const sample = count > 0 ? accum / count : 0;
        const s = Math.max(-1, Math.min(1, sample));
        pcmInt16[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7fff;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
    }

    return new Uint8Array(pcmInt16.buffer);
  }

  /**
   * Loop to extract audio volume & frequency spectrum for visualization
   */
  startLevelLoop() {
    const dataArray = new Uint8Array(this.analyserNode?.frequencyBinCount || 128);

    const update = () => {
      if (!this.isListening) return;

      if (this.isPaused) {
        this.onAudioLevel?.({ volume: 0, frequencyData: new Uint8Array(32) });
      } else if (this.analyserNode) {
        this.analyserNode.getByteFrequencyData(dataArray);

        // Compute average volume level (0 - 1)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalizedVolume = Math.min(1, average / 128);

        // Sample 32 frequency bands for the waveform bars
        const bands = new Uint8Array(32);
        const step = Math.floor(dataArray.length / 32);
        for (let b = 0; b < 32; b++) {
          bands[b] = dataArray[b * step] || 0;
        }

        this.onAudioLevel?.({ volume: normalizedVolume, frequencyData: bands });
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    update();
  }

  /**
   * Pause audio capture
   */
  pause() {
    this.isPaused = true;
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend().catch(() => {});
    }
  }

  /**
   * Resume audio capture
   */
  async resume() {
    this.isPaused = false;
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    }
  }

  /**
   * Stop and cleanup all resources
   */
  stop() {
    this.cleanup();
  }

  cleanup() {
    this.isListening = false;
    this.isPaused = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.processorNode) {
      this.processorNode.onaudioprocess = null;
      try {
        this.processorNode.disconnect();
      } catch {}
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect();
      } catch {}
      this.analyserNode = null;
    }

    if (this.silentGainNode) {
      try {
        this.silentGainNode.disconnect();
      } catch {}
      this.silentGainNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.onAudioLevel?.({ volume: 0, frequencyData: new Uint8Array(32) });
  }
}
