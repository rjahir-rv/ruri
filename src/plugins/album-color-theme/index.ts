import Color, { type ColorInstance } from 'color';
import { FastAverageColor } from 'fast-average-color';

import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import { onMenu } from './menu';
import style from './style.css?inline';

import type { AlbumColorThemeConfig, AlbumColorThemeRenderer } from './types';
import type { MusicPlayer } from '@/types/music-player';

const COLOR_KEY = '--ytmusic-album-color';
const DARK_COLOR_KEY = '--ytmusic-album-color-dark';
const RATIO_KEY = '--ytmusic-album-color-ratio';

const defaultConfig: AlbumColorThemeConfig = {
  enabled: true,
  ratio: 0.5,
  enableSeekbar: true,
  paintPageBackground: false,
};

const VARIABLE_MAP: Record<string, string> = {
  '--ytmusic-color-black1': '#212121',
  '--ytmusic-color-black2': '#181818',
  '--ytmusic-color-black3': '#030303',
  '--ytmusic-color-black4': '#030303',
  '--ytmusic-color-blackpure': '#000',
  '--dark-theme-background-color': '#212121',
  '--yt-spec-base-background': '#0f0f0f',
  '--yt-spec-raised-background': '#212121',
  '--yt-spec-menu-background': '#282828',
  '--yt-spec-static-brand-black': '#212121',
  '--yt-spec-static-overlay-background-solid': '#000',
  '--yt-spec-static-overlay-background-heavy': 'rgba(0,0,0,0.8)',
  '--yt-spec-static-overlay-background-medium': 'rgba(0,0,0,0.6)',
  '--yt-spec-static-overlay-background-medium-light': 'rgba(0,0,0,0.3)',
  '--yt-spec-static-overlay-background-light': 'rgba(0,0,0,0.1)',
  '--yt-spec-general-background-a': '#181818',
  '--yt-spec-general-background-b': '#0f0f0f',
  '--yt-spec-general-background-c': '#030303',
  '--yt-spec-snackbar-background': '#030303',
  '--yt-spec-filled-button-text': '#030303',
  '--yt-spec-black-1': '#282828',
  '--yt-spec-black-2': '#1f1f1f',
  '--yt-spec-black-3': '#161616',
  '--yt-spec-black-4': '#0d0d0d',
  '--yt-spec-black-pure': '#000',
  '--yt-spec-black-pure-alpha-5': 'rgba(0,0,0,0.05)',
  '--yt-spec-black-pure-alpha-10': 'rgba(0,0,0,0.1)',
  '--yt-spec-black-pure-alpha-15': 'rgba(0,0,0,0.15)',
  '--yt-spec-black-pure-alpha-30': 'rgba(0,0,0,0.3)',
  '--yt-spec-black-pure-alpha-60': 'rgba(0,0,0,0.6)',
  '--yt-spec-black-pure-alpha-80': 'rgba(0,0,0,0.8)',
  '--yt-spec-black-1-alpha-98': 'rgba(40,40,40,0.98)',
  '--yt-spec-black-1-alpha-95': 'rgba(40,40,40,0.95)',
  '--paper-toast-background-color': '#323232',
  '--ytmusic-search-background': '#030303',
  '--paper-slider-knob-color': '#f03',
  '--paper-dialog-background-color': '#212121',
  '--paper-progress-active-color-1': '#f03',
  '--paper-progress-active-color-2': '#ff2791',
  '--yt-spec-inverted-background': '#f3f3f3',
  'background': 'rgba(3, 3, 3)',
  '--ytmusic-background': 'rgba(3, 3, 3)',
};

const SEEKBAR_KEYS = [
  '--paper-progress-active-color-1',
  '--paper-progress-active-color-2',
  '--paper-slider-knob-color',
] as const;

const COLOR_KEY_MAP: Record<string, string> = {
  'background': DARK_COLOR_KEY,
  '--ytmusic-background': DARK_COLOR_KEY,
};

const RATIO_MAP: Record<string, number> = {
  '--paper-progress-active-color-1': 1.75,
  '--paper-progress-active-color-2': 1.75,
  '--yt-spec-inverted-background': 1.75,
};

function clearPaintedProperties() {
  for (const variable of Object.keys(VARIABLE_MAP)) {
    document.documentElement.style.removeProperty(variable);
  }
}

function thumbnailUrlFromPlayer(playerApi: MusicPlayer): string | null {
  try {
    const thumbs =
      playerApi.getPlayerResponse()?.videoDetails?.thumbnail?.thumbnails;
    return thumbs?.at(-1)?.url ?? thumbs?.at(0)?.url ?? null;
  } catch {
    return null;
  }
}

function thumbnailUrlFromDom(): string | null {
  const img = document.querySelector<HTMLImageElement>(
    '#song-image img, ytmusic-player-bar img',
  );
  const src = img?.currentSrc || img?.src;
  return src ? src : null;
}

export default createPlugin({
  name: () => t('plugins.album-color-theme.name'),
  description: () => t('plugins.album-color-theme.description'),
  restartNeeded: false,
  config: defaultConfig,
  stylesheets: [style],
  menu: onMenu,
  renderer: {
    color: null as ColorInstance | null,
    darkColor: null as ColorInstance | null,
    pluginConfig: null as AlbumColorThemeConfig | null,
    lastAlpha: 1,
    warnedGlassPaint: false,
    lastVideoId: null as string | null,
    fastAverageColor: null as FastAverageColor | null,
    videoDataListener: null as (() => void) | null,
    layerListener: null as ((event: unknown, id: unknown) => void) | null,

    async start({ getConfig }) {
      const config = await getConfig();
      this.pluginConfig = config;
      await (this as AlbumColorThemeRenderer).applyTheme(
        config,
        this.lastAlpha,
      );

      const onLayerChange = (_event: unknown, id: unknown) => {
        if (id !== 'glassy-theme' && id !== 'glassy-backdrop') return;
        const pluginConfig = this.pluginConfig;
        if (!pluginConfig) return;
        const renderer = this as AlbumColorThemeRenderer;
        renderer
          .publishAlbumColors()
          .then(() => renderer.applyTheme(pluginConfig, this.lastAlpha))
          .catch(console.error);
      };
      this.layerListener = onLayerChange;
      // Preload listener so stop() can removeListener without
      // wiping renderer.ts handlers on the same channels.
      window.ipcRenderer.on('plugin:enable', onLayerChange);
      window.ipcRenderer.on('plugin:unload', onLayerChange);
    },
    async onPlayerApiReady(playerApi, { getConfig }) {
      this.fastAverageColor = new FastAverageColor();
      this.videoDataListener = () => {
        (this as AlbumColorThemeRenderer)
          .applyAlbumColor(playerApi)
          .catch(console.error);
      };
      // Attach before any await so a dataloaded that races getConfig is not missed.
      document.addEventListener('videodatachange', this.videoDataListener);

      const config = await getConfig();
      await (this as AlbumColorThemeRenderer).onConfigChange(config);
      // Resume-on-start often already has a track; dataloaded may have fired.
      await (this as AlbumColorThemeRenderer).applyAlbumColorWithRetry(
        playerApi,
      );
    },
    async applyAlbumColor(playerApi: MusicPlayer) {
      let videoId: string | null;
      try {
        videoId = playerApi.getPlayerResponse()?.videoDetails?.videoId ?? null;
      } catch {
        videoId = null;
      }

      const thumbnailUrl =
        thumbnailUrlFromPlayer(playerApi) ?? thumbnailUrlFromDom();
      if (!thumbnailUrl) return false;

      if (videoId && videoId === this.lastVideoId && this.color) return true;

      if (!this.fastAverageColor)
        this.fastAverageColor = new FastAverageColor();

      const albumColor = await this.fastAverageColor
        .getColorAsync(thumbnailUrl)
        .catch((err) => {
          console.error(err);
          return null;
        });

      if (albumColor) {
        const target = Color(albumColor.hex);

        this.darkColor = target.darken(0.3).rgb();
        this.color = target.darken(0.15).rgb();

        while (this.color.luminosity() > 0.5) {
          this.color = this.color?.darken(0.05);
          this.darkColor = this.darkColor?.darken(0.05);
        }

        this.lastVideoId = videoId;
        await (this as AlbumColorThemeRenderer).publishAlbumColors();
      } else if (!this.color) {
        document.documentElement.style.setProperty(COLOR_KEY, '0, 0, 0');
        document.documentElement.style.setProperty(DARK_COLOR_KEY, '0, 0, 0');
      }

      let alpha: number | null = null;
      if (await window.mainConfig.plugins.isEnabled('transparent-player')) {
        const value: unknown = window.mainConfig.get(
          'plugins.transparent-player.opacity',
        );
        if (typeof value === 'number' && value >= 0 && value <= 1) {
          alpha = value;
        }
      }
      await (this as AlbumColorThemeRenderer).updateColor(alpha ?? 1);
      return Boolean(albumColor);
    },
    async applyAlbumColorWithRetry(playerApi: MusicPlayer) {
      if (await (this as AlbumColorThemeRenderer).applyAlbumColor(playerApi)) {
        return;
      }
      for (const delay of [200, 600, 1500]) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (
          await (this as AlbumColorThemeRenderer).applyAlbumColor(playerApi)
        ) {
          return;
        }
      }
    },
    async onConfigChange(config) {
      this.pluginConfig = config;
      await (this as AlbumColorThemeRenderer).applyTheme(
        config,
        this.lastAlpha,
      );
    },
    async publishAlbumColors() {
      if (!this.color || !this.darkColor) return;

      const glassOn = await window.mainConfig.plugins.isEnabled('glassy-theme');
      const backdropOn =
        await window.mainConfig.plugins.isEnabled('glassy-backdrop');

      // Glass tint uses --ytmusic-album-color-dark at ~68% over artwork.
      // Clamp relative luminance so #f4f6fb stays ≥ 4.5:1. Seekbar still
      // uses --ytmusic-album-color (loop above, luminosity ≤ 0.5).
      let dark = this.darkColor;
      if (glassOn || backdropOn) {
        let steps = 0;
        while (dark.luminosity() > 0.18 && steps < 24) {
          dark = dark.darken(0.05);
          steps += 1;
        }
      }

      document.documentElement.style.setProperty(
        COLOR_KEY,
        `${~~this.color.red()}, ${~~this.color.green()}, ${~~this.color.blue()}`,
      );
      document.documentElement.style.setProperty(
        DARK_COLOR_KEY,
        `${~~dark.red()}, ${~~dark.green()}, ${~~dark.blue()}`,
      );
    },
    getMixedColor(
      color: string,
      key: string,
      alpha = 1,
      ratioMultiply?: number,
    ) {
      const keyColor = `rgba(var(${key}), ${alpha})`;

      let colorRatio = `var(${RATIO_KEY}, 50%)`;
      let originalRatio = `calc(100% - var(${RATIO_KEY}, 50%))`;
      if (ratioMultiply) {
        colorRatio = `calc(var(${RATIO_KEY}, 50%) * ${ratioMultiply})`;
        originalRatio = `calc(100% - calc(var(${RATIO_KEY}, 50%) * ${ratioMultiply}))`;
      }
      return `color-mix(in srgb, ${color} ${originalRatio}, ${keyColor} ${colorRatio})`;
    },
    async updateColor(alpha: number) {
      this.lastAlpha = alpha;
      const config = this.pluginConfig;
      if (!config) return;
      await (this as AlbumColorThemeRenderer).applyTheme(config, alpha);
    },
    async applyTheme(config: AlbumColorThemeConfig, alpha: number) {
      const glassOn = await window.mainConfig.plugins.isEnabled('glassy-theme');
      const backdropOn =
        await window.mainConfig.plugins.isEnabled('glassy-backdrop');
      const shouldPaint = config.paintPageBackground && !glassOn && !backdropOn;

      if (
        config.paintPageBackground &&
        !shouldPaint &&
        !this.warnedGlassPaint
      ) {
        console.warn(
          'album-color-theme: Glassy Theme or Glassy Backdrop is enabled; page background paint is skipped so the backdrop stays visible.',
        );
        this.warnedGlassPaint = true;
      }

      document.documentElement.dataset.albumColorPaint = shouldPaint
        ? 'on'
        : 'off';
      document.documentElement.style.setProperty(
        RATIO_KEY,
        `${~~(config.ratio * 100)}%`,
      );
      if (config.enableSeekbar) document.body.classList.add('seekbar-theme');
      else document.body.classList.remove('seekbar-theme');

      const getMixedColor = (
        this as AlbumColorThemeRenderer
      ).getMixedColor.bind(this);

      const paintKeys = (keys: readonly string[]) => {
        for (const variable of keys) {
          const color = VARIABLE_MAP[variable];
          if (!color) continue;
          const key = COLOR_KEY_MAP[variable] ?? COLOR_KEY;
          const ratio = RATIO_MAP[variable];

          document.documentElement.style.setProperty(
            variable,
            getMixedColor(color, key, alpha, ratio),
            'important',
          );
        }
      };

      // Inline !important fills on :root win over glassy-theme's translucent
      // chrome. Skip the map while glass is on; only seekbar accents remain.
      if (shouldPaint) {
        paintKeys(Object.keys(VARIABLE_MAP));
        return;
      }

      clearPaintedProperties();
      if (config.enableSeekbar) paintKeys(SEEKBAR_KEYS);
    },
    stop() {
      if (this.videoDataListener) {
        document.removeEventListener('videodatachange', this.videoDataListener);
        this.videoDataListener = null;
      }
      if (this.layerListener) {
        window.ipcRenderer.removeListener('plugin:enable', this.layerListener);
        window.ipcRenderer.removeListener('plugin:unload', this.layerListener);
        this.layerListener = null;
      }
      this.fastAverageColor?.destroy();
      this.fastAverageColor = null;
      delete document.documentElement.dataset.albumColorPaint;
      document.documentElement.style.removeProperty(COLOR_KEY);
      document.documentElement.style.removeProperty(DARK_COLOR_KEY);
      document.documentElement.style.removeProperty(RATIO_KEY);
      clearPaintedProperties();
      document.body.classList.remove('seekbar-theme');
      this.color = null;
      this.darkColor = null;
      this.pluginConfig = null;
      this.warnedGlassPaint = false;
      this.lastVideoId = null;
    },
  },
});
