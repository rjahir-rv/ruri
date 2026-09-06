import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import { onMenu } from './menu';
import style from './style.css?inline';

import type { GlassyBackdropConfig, GlassyBackdropRenderer } from './types';
import type { ThumbnailElement } from '@/types/get-player-response';
import type { MusicPlayer } from '@/types/music-player';

const HOST_ID = 'ruri-glassy-backdrop';
const LAYER_CLASS = 'ruri-glassy-backdrop__layer';
const FRONT_CLASS = 'is-front';
const VEIL_CLASS = 'ruri-glassy-backdrop__veil';
const AQUA_CLASS = 'ruri-glassy-backdrop__aqua';
const WAVE_CLASS = 'ruri-glassy-backdrop__wave';
const MAX_THUMB_WIDTH = 800;

const defaultConfig: GlassyBackdropConfig = {
  enabled: true,
  aqua: true,
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

function svgEl<K extends keyof SVGElementTagNameMap>(
  name: K,
): SVGElementTagNameMap[K] {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createAquaFilter(): SVGSVGElement {
  const svg = svgEl('svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('ruri-glassy-backdrop__filter');

  const filter = svgEl('filter');
  filter.id = 'ruri-aqua-filter';
  filter.setAttribute('x', '-20%');
  filter.setAttribute('y', '-20%');
  filter.setAttribute('width', '140%');
  filter.setAttribute('height', '140%');

  const turbulence = svgEl('feTurbulence');
  // The turbulence breathes slowly in normal mode; the reduced-motion rule
  // below hides the SMIL animator while retaining a static displacement map.
  turbulence.setAttribute('type', 'fractalNoise');
  turbulence.setAttribute('baseFrequency', '0.008 0.014');
  turbulence.setAttribute('numOctaves', '3');
  turbulence.setAttribute('seed', '2');
  turbulence.setAttribute('result', 'noise');

  const animate = svgEl('animate');
  animate.setAttribute('attributeName', 'baseFrequency');
  animate.setAttribute('dur', '9s');
  animate.setAttribute('values', '0.007 0.014;0.016 0.007;0.007 0.014');
  animate.setAttribute('repeatCount', 'indefinite');
  turbulence.append(animate);

  const displace = svgEl('feDisplacementMap');
  displace.setAttribute('in', 'SourceGraphic');
  displace.setAttribute('in2', 'noise');
  displace.setAttribute('scale', '28');
  displace.setAttribute('xChannelSelector', 'R');
  displace.setAttribute('yChannelSelector', 'G');

  filter.append(turbulence, displace);
  svg.append(filter);
  return svg;
}

function createHost(): HTMLElement {
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    if (!existing.querySelector('#ruri-aqua-filter')) {
      existing.prepend(createAquaFilter());
    }
    if (!existing.querySelector(`.${AQUA_CLASS}`)) {
      const aqua = document.createElement('div');
      aqua.className = AQUA_CLASS;
      aqua.setAttribute('aria-hidden', 'true');
      for (let i = 1; i <= 3; i += 1) {
        const wave = document.createElement('div');
        wave.className = `${WAVE_CLASS} ${WAVE_CLASS}--${i}`;
        aqua.append(wave);
      }
      existing.append(aqua);
    }
    return existing;
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('aria-hidden', 'true');
  host.prepend(createAquaFilter());

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

  const aqua = document.createElement('div');
  aqua.className = AQUA_CLASS;
  aqua.setAttribute('aria-hidden', 'true');
  for (let i = 1; i <= 3; i += 1) {
    const wave = document.createElement('div');
    wave.className = `${WAVE_CLASS} ${WAVE_CLASS}--${i}`;
    aqua.append(wave);
  }
  host.append(aqua);

  document.body.prepend(host);
  return host;
}

function applyAquaAttr(aqua: boolean) {
  if (aqua) {
    document.documentElement.dataset.glassyAqua = 'on';
  } else {
    delete document.documentElement.dataset.glassyAqua;
  }
}

function isPlayerPageOpen(): boolean {
  const layout = document.querySelector('ytmusic-app-layout');
  if (
    layout?.hasAttribute('player-page-open') ||
    ['PLAYER_PAGE_OPEN', 'FULLSCREEN'].includes(
      layout?.getAttribute('player-ui-state') ?? '',
    ) ||
    ['PLAYER_PAGE_OPEN', 'FULLSCREEN'].includes(
      layout?.getAttribute('player-ui-state_') ?? '',
    )
  ) {
    return true;
  }

  const page = document.querySelector<HTMLElement>(
    '#player-page, ytmusic-player-page',
  );
  const state =
    page?.getAttribute('player-ui-state') ??
    page?.getAttribute('player-ui-state_');

  return state === 'PLAYER_PAGE_OPEN' || state === 'FULLSCREEN';
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
  menu: onMenu,
  renderer: {
    host: null as HTMLElement | null,
    layers: [] as HTMLImageElement[],
    lastVideoId: null as string | null,
    hasImage: false,
    artworkGeneration: 0,
    videoDataListener: null as (() => void) | null,
    playerPageObserver: null as MutationObserver | null,
    bootObserver: null as MutationObserver | null,

    async start({ getConfig }) {
      const config = await getConfig();
      document.documentElement.dataset.glassyBackdrop = 'on';
      applyQualityAttr();
      applyAquaAttr(config.aqua);
      this.host = createHost();
      this.layers = [
        ...this.host.querySelectorAll<HTMLImageElement>(`.${LAYER_CLASS}`),
      ];
      (this as GlassyBackdropRenderer).bindPlayerPageObserver();
      await warnOnTransparentPlayer();
    },
    onConfigChange(config: GlassyBackdropConfig) {
      applyAquaAttr(config.aqua);
    },
    async onPlayerApiReady(playerApi) {
      this.videoDataListener = () => {
        (this as GlassyBackdropRenderer)
          .applyArtwork(playerApi)
          .catch(console.error);
      };
      // Attach before the retry so a dataloaded that races the first apply is not missed.
      document.addEventListener('videodatachange', this.videoDataListener);

      (this as GlassyBackdropRenderer).bindPlayerPageObserver();
      await (this as GlassyBackdropRenderer).applyArtworkWithRetry(playerApi);
    },
    syncPlayerPage() {
      if (isPlayerPageOpen()) {
        document.documentElement.dataset.glassyPlayer = 'on';
      } else {
        delete document.documentElement.dataset.glassyPlayer;
      }
    },
    bindPlayerPageObserver() {
      const renderer = this as GlassyBackdropRenderer;
      renderer.syncPlayerPage();

      if (!this.playerPageObserver) {
        this.playerPageObserver = new MutationObserver(() => {
          renderer.syncPlayerPage();
        });
      }

      const layout = document.querySelector('ytmusic-app-layout');
      const page = document.querySelector('#player-page, ytmusic-player-page');
      if (layout) {
        this.playerPageObserver.observe(layout, {
          attributes: true,
          attributeFilter: [
            'player-ui-state',
            'player-ui-state_',
            'player-page-open',
          ],
        });
      }
      if (page) {
        this.playerPageObserver.observe(page, {
          attributes: true,
          attributeFilter: [
            'player-ui-state',
            'player-ui-state_',
            'hidden',
            'player-page-open',
            'style',
          ],
        });
      }

      if (layout || page) {
        this.bootObserver?.disconnect();
        this.bootObserver = null;
        return;
      }

      if (this.bootObserver) return;
      this.bootObserver = new MutationObserver(() => {
        if (
          document.querySelector('ytmusic-app-layout') ||
          document.querySelector('#player-page, ytmusic-player-page')
        ) {
          renderer.bindPlayerPageObserver();
        }
      });
      this.bootObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
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
      this.playerPageObserver?.disconnect();
      this.playerPageObserver = null;
      this.bootObserver?.disconnect();
      this.bootObserver = null;
      this.host?.remove();
      this.host = null;
      this.layers = [];
      this.lastVideoId = null;
      this.hasImage = false;
      this.artworkGeneration += 1;
      delete document.documentElement.dataset.glassyBackdrop;
      delete document.documentElement.dataset.glassyBackdropQuality;
      delete document.documentElement.dataset.glassyAqua;
      delete document.documentElement.dataset.glassyPlayer;
    },
  },
});
