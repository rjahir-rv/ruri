/** Static gallery metadata. Keep section/icon maps in sync when adding plugins.
 *  RESTART_NEEDED_PLUGIN_IDS mirrors PluginDef.restartNeeded (no virtual:plugins
 *  import from in-app-menu main — that circularly breaks the renderer bundle). */
export const PLUGINS_MENU_ID = 'plugins';
export const OPTIONS_MENU_ID = 'options';
export const VIEW_MENU_ID = 'view';
export const NAVIGATION_MENU_ID = 'navigation';
export const ABOUT_MENU_ID = 'about';

export const PLUGIN_SECTION_IDS = [
  'appearance',
  'playback',
  'lyrics',
  'apps',
  'system',
] as const;

export type PluginSectionId = (typeof PLUGIN_SECTION_IDS)[number];

export type PluginGalleryEntry = {
  section: PluginSectionId;
  icon: string;
};

export const FALLBACK_PLUGIN_ICON = 'puzzle-piece';

export const PLUGIN_GALLERY: Record<string, PluginGalleryEntry> = {
  'glassy-theme': { section: 'appearance', icon: 'drop' },
  'glassy-backdrop': { section: 'appearance', icon: 'image' },
  'album-color-theme': { section: 'appearance', icon: 'palette' },
  'ambient-mode': { section: 'appearance', icon: 'lightbulb' },
  'blur-nav-bar': { section: 'appearance', icon: 'square-half' },
  'transparent-player': { section: 'appearance', icon: 'square' },
  'unobtrusive-player': { section: 'appearance', icon: 'eye-slash' },
  'in-app-menu': { section: 'appearance', icon: 'browser' },
  'visualizer': { section: 'appearance', icon: 'waveform' },
  'clock': { section: 'appearance', icon: 'clock' },
  'video-toggle': { section: 'appearance', icon: 'video-camera' },

  'equalizer': { section: 'playback', icon: 'faders' },
  'crossfade': { section: 'playback', icon: 'shuffle' },
  'audio-compressor': { section: 'playback', icon: 'speaker-high' },
  'exponential-volume': { section: 'playback', icon: 'speaker-simple-high' },
  'precise-volume': { section: 'playback', icon: 'speaker-low' },
  'custom-output-device': { section: 'playback', icon: 'headphones' },
  'playback-speed': { section: 'playback', icon: 'gauge' },
  'skip-silences': { section: 'playback', icon: 'fast-forward' },
  'skip-disliked-songs': { section: 'playback', icon: 'skip-forward' },
  'disable-autoplay': { section: 'playback', icon: 'pause-circle' },
  'quality-changer': { section: 'playback', icon: 'broadcast' },
  'captions-selector': { section: 'playback', icon: 'closed-captioning' },
  'sponsorblock': { section: 'playback', icon: 'scissors' },

  'synced-lyrics': { section: 'lyrics', icon: 'text-align-left' },

  'discord': { section: 'apps', icon: 'discord-logo' },
  'scrobbler': { section: 'apps', icon: 'music-notes' },
  'downloader': { section: 'apps', icon: 'download-simple' },
  'music-together': { section: 'apps', icon: 'users-three' },
  'notifications': { section: 'apps', icon: 'bell' },
  'picture-in-picture': { section: 'apps', icon: 'picture-in-picture' },
  'amuse': { section: 'apps', icon: 'app-window' },
  'lumiastream': { section: 'apps', icon: 'broadcast' },
  'tuna-obs': { section: 'apps', icon: 'monitor' },
  'api-server': { section: 'apps', icon: 'plugs-connected' },
  'auth-proxy-adapter': { section: 'apps', icon: 'shield-check' },

  'shortcuts': { section: 'system', icon: 'keyboard' },
  'performance-improvement': { section: 'system', icon: 'lightning' },
  'do-not-track': { section: 'system', icon: 'eye-closed' },
  'navigation': { section: 'system', icon: 'compass' },
  'taskbar-mediacontrol': { section: 'system', icon: 'rows' },
  'touchbar': { section: 'system', icon: 'keyboard' },
  'album-actions': { section: 'system', icon: 'thumbs-up' },
};

export const MENU_BAR_ICONS: Record<string, string> = {
  [PLUGINS_MENU_ID]: 'squares-four',
  [OPTIONS_MENU_ID]: 'sliders-horizontal',
  [VIEW_MENU_ID]: 'eye',
  [NAVIGATION_MENU_ID]: 'compass',
  [ABOUT_MENU_ID]: 'info',
};

export const LOCKED_PLUGIN_IDS = new Set(['in-app-menu']);

export const RESTART_NEEDED_PLUGIN_IDS = new Set([
  'amuse',
  'auth-proxy-adapter',
  'crossfade',
  'custom-output-device',
  'downloader',
  'exponential-volume',
  'in-app-menu',
  'lumiastream',
  'notifications',
  'performance-improvement',
  'picture-in-picture',
  'precise-volume',
  'scrobbler',
  'shortcuts',
  'skip-silences',
  'sponsorblock',
  'synced-lyrics',
  'taskbar-mediacontrol',
  'touchbar',
  'transparent-player',
  'tuna-obs',
  'video-toggle',
]);

export const isPluginSectionHeaderId = (id?: string) =>
  Boolean(id?.startsWith('plugins-section-'));

export const getPluginGalleryEntry = (pluginId: string): PluginGalleryEntry =>
  PLUGIN_GALLERY[pluginId] ?? {
    section: 'system',
    icon: FALLBACK_PLUGIN_ICON,
  };
