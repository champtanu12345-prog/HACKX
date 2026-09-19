/**
 * Tactical Maritime Audio Subsystem using Native Web Audio API
 * Synthesizes authentic naval sonar acoustics and tactical chimes without external media dependencies.
 */

class TacticalAudioEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Load persisted sound preference
    try {
      const stored = localStorage.getItem('hackx_sound_enabled');
      if (stored !== null) {
        this.soundEnabled = stored === 'true';
      }
    } catch {
      this.soundEnabled = true;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('hackx_sound_enabled', String(enabled));
    } catch {}
  }

  /**
   * Classic Naval Sonar Ping:
   * High-frequency sine wave starting at ~1450 Hz with exponential frequency sweep and long reverberant decay
   */
  public playSonarPing(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Bandpass filter to simulate underwater reverberation
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(8, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1480, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.35);

      // Acoustic envelope: sharp attack, long resonant tail
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.65);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Tactical Urgency Chime:
   * Dual ascending harmonic pulse (880Hz -> 1174Hz) for priority incident escalation
   */
  public playTacticalChime(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [
        { freq: 880, delay: 0 },
        { freq: 1174.66, delay: 0.12 },
      ].forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.65);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Confirmation Chime:
   * Smooth major third chime for successful dispatch transmission
   */
  public playSuccessChime(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [
        { freq: 523.25, delay: 0 },    // C5
        { freq: 659.25, delay: 0.08 }, // E5
        { freq: 783.99, delay: 0.16 }, // G5
      ].forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.5);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }
}

export const tacticalAudio = new TacticalAudioEngine();
