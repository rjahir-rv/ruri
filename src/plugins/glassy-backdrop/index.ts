import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import style from './style.css?inline';

import type { GlassyBackdropConfig, GlassyBackdropRenderer } from './types';
import type { ThumbnailElement } from '@/types/get-player-response';
import type { MusicPlayer } from '@/types/music-player';

const HOST_ID = 'ruri-glassy-backdrop';
const LAYER_CLASS = 'ruri-glassy-backdrop__layer';
const FRONT_CLASS = 'is-front';
const VEIL_CLASS = 'ruri-glassy-backdrop__veil';
const MAX_THUMB_WIDTH = 800;

const defaultConfig: GlassyBackdropConfig = {
  enabled: true,
};

function pickBackdropUrl(
  thumbs: ThumbnailElement[] | undefined,
): string | null {
  if (!thumbs?.length) return null;
  const mid = thumbs.filter((thumb) => thumb.width <= MAX_THUMB_WIDTH).at(-1);
  const chosen = mid ?? thumbs.at(-1);
  return chosen?.url?.split('?')[0] ?? null;
}

function thumbnailUrlFromPlayer(playerApi: MusicPlayer): string | null {
  try {
    const thumbs =
      playerApi.getPlayerResponse()?.videoDetails?.thumbnail?.thumbnails;
    return pickBackdropUrl(thumbs);
  } catch {
    return null;
  }
}

function thumbnailUrlFromDom(): string | null {
  const img = document.querySelector<HTMLImageElement>(
    '#song-image img, ytmusic-player-bar img',
  );
  const src = img?.currentSrc || img?.src;
  return src ? src.split('?')[0] : null;
}

function loadLayer(img: HTMLImageElement, url: string): Promise<boolean> {
  if (img.dataset.url === url && img.complete && img.naturalWidth > 0) {
    return Promise.resolve(true);
  }

  img.dataset.url = url;
  img.src = url;

  return img.decode().then(
    () => true,
    () => false,
  );
}

function createHost(): HTMLElement {
  const existing = document.getElementById(HOST_ID);
  if (existing) return existing;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 2; i += 1) {
    const layer = document.createElement('img');
    layer.className = LAYER_CLASS;
    layer.alt = '';
    layer.draggable = false;
    host.append(layer);
  }

  const veil = document.createElement('div');
  veil.className = VEIL_CLASS;
  host.append(veil);

  document.body.prepend(host);
  return host;
}

function applyQualityAttr() {
  const hwOff = Boolean(
    window.mainConfig.get('options.disableHardwareAcceleration'),
  );
  if (hwOff) {
    document.documentElement.dataset.glassyBackdropQuality = 'low';
  } else {
    delete document.documentElement.dataset.glassyBackdropQuality;
  }
}

async function warnOnTransparentPlayer() {
  if (await window.mainConfig.plugins.isEnabled('transparent-player')) {
    console.warn(
      'glassy-backdrop: Transparent Player is also enabled; it paints the page background and fights this layer. Turn one of them off.',
    );
  }
}

export default createPlugin({
  name: () => t('plugins.glassy-backdrop.name'),
  description: () => t('plugins.glassy-backdrop.description'),
  restartNeeded: false,
  config: defaultConfig,
  stylesheets: [style],
  renderer: {
    host: null as HTMLElement | null,
    layers: [] as HTMLImageElement[],
    lastVideoId: null as string | null,
    hasImage: false,
    artworkGeneration: 0,
    videoDataListener: null as (() => void) | null,

    async start() {
      document.documentElement.dataset.glassyBackdrop = 'on';
      applyQualityAttr();
      this.host = createHost();
      this.layers = [
        ...this.host.querySelectorAll<HTMLImageElement>(`.${LAYER_CLASS}`),
      ];
      await warnOnTransparentPlayer();
    },
    async onPlayerApiReady(playerApi) {
      this.videoDataListener = () => {
        (this as GlassyBackdropRenderer)
          .applyArtwork(playerApi)
          .catch(console.error);
      };
      // Attach before the retry so a dataloaded that races the first apply is not missed.
      document.addEventListener('videodatachange', this.videoDataListener);

      await (this as GlassyBackdropRenderer).applyArtworkWithRetry(playerApi);
    },
    async applyArtwork(playerApi: MusicPlayer) {
      let videoId: string | null;
      try {
        videoId = playerApi.getPlayerResponse()?.videoDetails?.videoId ?? null;
      } catch {
        videoId = null;
      }

      const thumbnailUrl =
        thumbnailUrlFromPlayer(playerApi) ?? thumbnailUrlFromDom();
      if (!thumbnailUrl) return false;

      if (videoId && videoId === this.lastVideoId && this.hasImage) return true;

      if (this.layers.length < 2) return false;

      const generation = (this.artworkGeneration += 1);
      const back =
        this.layers.find((layer) => !layer.classList.contains(FRONT_CLASS)) ??
        this.layers[0];

      const loaded = await loadLayer(back, thumbnailUrl);
      if (generation !== this.artworkGeneration) return false;
      if (!loaded) return false;

      for (const layer of this.layers) {
        layer.classList.toggle(FRONT_CLASS, layer === back);
      }

      this.lastVideoId = videoId;
      this.hasImage = true;
      return true;
    },
    async applyArtworkWithRetry(playerApi: MusicPlayer) {
      if (await (this as GlassyBackdropRenderer).applyArtwork(playerApi)) {
        return;
      }
      for (const delay of [200, 600, 1500]) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (await (this as GlassyBackdropRenderer).applyArtwork(playerApi)) {
          return;
        }
      }
    },
    stop() {
      if (this.videoDataListener) {
        document.removeEventListener('videodatachange', this.videoDataListener);
        this.videoDataListener = null;
      }
      this.host?.remove();
      this.host = null;
      this.layers = [];
      this.lastVideoId = null;
      this.hasImage = false;
      this.artworkGeneration += 1;
      delete document.documentElement.dataset.glassyBackdrop;
      delete document.documentElement.dataset.glassyBackdropQuality;
    },
  },
});
