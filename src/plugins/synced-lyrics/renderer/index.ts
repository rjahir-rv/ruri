import { getSongInfo } from '@/providers/song-info-front';
import { createRenderer } from '@/utils';
import { waitForElement } from '@/utils/wait-for-element';

import { setLyricsRuntime } from './lyrics-debug';
import { disposeReactiveRoot } from './reactive-root';
import { setConfig, setCurrentTime } from './renderer';
import { fetchLyrics, markLyricsConfigReady } from './store';
import { selectors, tabStates } from './utils';

import type { SyncedLyricsPluginConfig } from '../types';
import type { SongInfo } from '@/providers/song-info';
import type { RendererContext } from '@/types/contexts';
import type { MusicPlayer } from '@/types/music-player';

export let _ytAPI: MusicPlayer | null = null;
export let netFetch: (
  url: string,
  init?: RequestInit,
) => Promise<[number, string, Record<string, string>]>;

export const renderer = createRenderer<
  {
    observerCallback: MutationCallback;
    observer?: MutationObserver;
    videoDataChange: () => Promise<void>;
    videoDataChangeGeneration: number;
    updateTimestampInterval?: NodeJS.Timeout | string | number;
  },
  SyncedLyricsPluginConfig
>({
  videoDataChangeGeneration: 0,

  onConfigChange(newConfig) {
    setConfig(newConfig);
    setLyricsRuntime({
      debug: newConfig.debug,
      preferredProvider: newConfig.preferredProvider,
    });
    const current = getSongInfo();
    if (current.videoId) {
      fetchLyrics(current);
    }
  },

  observerCallback(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      const header = mutation.target as HTMLElement;

      switch (mutation.attributeName) {
        case 'disabled':
          header.removeAttribute('disabled');
          break;
        case 'aria-selected':
          tabStates[header.ariaSelected ?? 'false']();
          break;
      }
    }
  },

  async onPlayerApiReady(api: MusicPlayer) {
    _ytAPI = api;

    api.addEventListener('videodatachange', this.videoDataChange);

    await this.videoDataChange();
  },
  async videoDataChange() {
    const generation = ++this.videoDataChangeGeneration;

    if (!this.updateTimestampInterval) {
      this.updateTimestampInterval = setInterval(
        () => setCurrentTime((_ytAPI?.getCurrentTime() ?? 0) * 1000),
        100,
      );
    }

    // prettier-ignore
    this.observer ??= new MutationObserver(this.observerCallback);
    this.observer.disconnect();

    // Force the lyrics tab to be enabled at all times.
    const header = await waitForElement<HTMLElement>(selectors.head);
    if (generation !== this.videoDataChangeGeneration) return;

    {
      header.removeAttribute('disabled');
      tabStates[header.ariaSelected ?? 'false']();
    }

    this.observer.observe(header, { attributes: true });
    header.removeAttribute('disabled');
  },

  async start(ctx: RendererContext<SyncedLyricsPluginConfig>) {
    netFetch = ctx.ipc.invoke.bind(ctx.ipc, 'synced-lyrics:fetch');

    const cfg = await ctx.getConfig();
    setConfig(cfg);
    setLyricsRuntime({
      debug: cfg.debug,
      preferredProvider: cfg.preferredProvider,
    });
    markLyricsConfigReady();

    ctx.ipc.on('peard:update-song-info', (info: SongInfo) => {
      fetchLyrics(info);
    });

    // Catch a first song whose IPC arrived before this handler existed.
    const current = getSongInfo();
    if (current.videoId) {
      fetchLyrics(current);
    }
  },

  stop() {
    disposeReactiveRoot();
  },
});
