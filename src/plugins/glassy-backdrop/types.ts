import type { MusicPlayer } from '@/types/music-player';

export type GlassyBackdropConfig = {
  enabled: boolean;
};

export type GlassyBackdropRenderer = {
  applyArtwork(playerApi: MusicPlayer): Promise<boolean>;
  applyArtworkWithRetry(playerApi: MusicPlayer): Promise<void>;
};
