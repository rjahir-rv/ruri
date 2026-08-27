export type GlassyQuality = 'high' | 'low';

export type GlassyThemeConfig = {
  enabled: boolean;
  quality: GlassyQuality;
  /* Select the lyrics tab automatically when the player goes fullscreen. */
  fullscreenLyrics: boolean;
};
