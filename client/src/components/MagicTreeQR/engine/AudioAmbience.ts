export class AudioAmbience {
  private audio: HTMLAudioElement | null = null;
  private muted = true;

  setTrack(url: string | null): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (!url) return;
    this.audio = new Audio(url);
    this.audio.loop = true;
    this.audio.muted = this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.audio) {
      this.audio.muted = muted;
      if (!muted) {
        void this.audio.play().catch(() => undefined);
      }
    }
  }

  get isMuted(): boolean {
    return this.muted;
  }

  dispose(): void {
    this.setTrack(null);
  }
}
