import type { MusicPlayer } from '@/types/music-player';

export type AlbumColorThemeConfig = {
  enabled: boolean;
  ratio: number;
  enableSeekbar: boolean;
  paintPageBackground: boolean;
};

export type AlbumColorThemeRenderer = {
  getMixedColor(
    color: string,
    key: string,
    alpha?: number,
    ratioMultiply?: number,
  ): string;
  publishAlbumColors(): Promise<void>;
  updateColor(alpha: number): Promise<void>;
  applyTheme(config: AlbumColorThemeConfig, alpha: number): Promise<void>;
  applyAlbumColor(playerApi: MusicPlayer): Promise<boolean>;
  applyAlbumColorWithRetry(playerApi: MusicPlayer): Promise<void>;
  onConfigChange(newConfig: AlbumColorThemeConfig): Promise<void>;
};
