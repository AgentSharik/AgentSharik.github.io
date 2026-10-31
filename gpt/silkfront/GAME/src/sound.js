// Tiny optional local audio cues, no downloaded audio and no autoplay before a gesture.
export class Sounds {
  unlock() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx && AC) this.ctx = new AC();
      if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
    } catch { /* Audio is optional; denied playback must not block the match. */ }
  }
  play(kind) {
    const c = this.ctx; if (!c || c.state !== 'running' || document.getElementById('mute')?.checked) return;
    const now = c.currentTime; if (now - (this.last ?? -1) < 0.07) return; this.last = now;
    const freq = { select: 440, move: 330, attack: 170, error: 100, win: 660 }[kind] || 220;
    const o = c.createOscillator(), v = c.createGain(); o.type = kind === 'attack' ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(freq, now); o.frequency.exponentialRampToValueAtTime(freq * 1.3, now + 0.09);
    v.gain.setValueAtTime(0.025, now); v.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    o.connect(v); v.connect(c.destination); o.start(now); o.stop(now + 0.14);
  }
}
