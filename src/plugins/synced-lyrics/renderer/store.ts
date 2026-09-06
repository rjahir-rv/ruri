import { createMemo, createSignal, runWithOwner, untrack } from 'solid-js';
import { createStore } from 'solid-js/store';

import { getSongInfo } from '@/providers/song-info-front';

import { debugLog, getPreferredProvider } from './lyrics-debug';
import { hasUsableLyrics, pickBestProvider } from './lyrics-select';
import { reactiveOwner } from './reactive-root';

import {
  type ProviderName,
  providerNames,
  type ProviderState,
} from '../providers';
import { providers } from '../providers/renderer';

import type { LyricResult } from '../types';
import type { SongInfo } from '@/providers/song-info';

type LyricsStore = {
  provider: ProviderName;
  current: ProviderState;
  lyrics: Record<ProviderName, ProviderState>;
};

const initialData = () =>
  providerNames.reduce(
    (acc, name) => {
      acc[name] = { state: 'fetching', data: null, error: null };
      return acc;
    },
    {} as LyricsStore['lyrics'],
  );

export const [lyricsStore, setLyricsStore] = createStore<LyricsStore>({
  provider: providerNames[0],
  lyrics: initialData(),
  get current(): ProviderState {
    return this.lyrics[this.provider];
  },
});

export const currentLyrics = runWithOwner(reactiveOwner, () =>
  createMemo(() => {
    const provider = lyricsStore.provider;
    return lyricsStore.lyrics[provider];
  }),
)!;

type VideoId = string;

type SearchCacheData = Record<ProviderName, ProviderState>;

const [hasManuallySwitchedProvider, setHasManuallySwitchedProvider] =
  createSignal(false);
const [pinnedProvider, setPinnedProviderSignal] =
  createSignal<ProviderName | null>(null);

let pinnedVideoId: VideoId | undefined;
let lastVideoId: VideoId | undefined;
let configReady = false;
let pendingSongInfo: SongInfo | null = null;

export { hasManuallySwitchedProvider, setHasManuallySwitchedProvider };
export { pinnedProvider };

export const setPinnedProvider = (
  provider: ProviderName | null,
  videoId?: VideoId | null,
) => {
  pinnedVideoId = videoId ?? lastVideoId;
  setPinnedProviderSignal(provider);
};

export const markLyricsConfigReady = () => {
  configReady = true;
  if (!pendingSongInfo) return;
  const info = pendingSongInfo;
  pendingSongInfo = null;
  fetchLyrics(info);
};

// A provider result is only worth keeping if the search actually completed.
// `error` (network blip, YTM shell not ready yet, rate limited proxy, ...) and
// `fetching` are transient, so they must be retried instead of being served
// from the cache as if they were a definitive "no lyrics for this song".
const isRetryable = (state: ProviderState) =>
  state.state === 'error' || state.state === 'fetching';

const applyProviderSelection = (videoId: VideoId, reason: string) => {
  if (hasManuallySwitchedProvider()) {
    debugLog('select-skip-manual', {
      videoId,
      reason,
      provider: lyricsStore.provider,
    });
    return;
  }

  const pin = pinnedProvider();
  if (pin) {
    if (lyricsStore.provider !== pin) {
      debugLog('select-pinned', {
        videoId,
        reason,
        from: lyricsStore.provider,
        to: pin,
      });
      setLyricsStore('provider', pin);
    }
    return;
  }

  const next = pickBestProvider(lyricsStore.lyrics, {
    preferred: getPreferredProvider(),
    current: lyricsStore.provider,
  });
  if (next === lyricsStore.provider) return;

  debugLog('select', {
    videoId,
    reason,
    from: lyricsStore.provider,
    to: next,
  });
  setLyricsStore('provider', next);
};

const cloneResult = (res: LyricResult | null): LyricResult | null =>
  res
    ? {
        ...res,
        artists: [...res.artists],
        lines: res.lines?.map((line) => ({ ...line })),
      }
    : null;

// The cached entries are handed to solid's store, which would otherwise proxy
// (and share) the very objects we keep mutating in the cache.
const cloneState = (state: ProviderState): ProviderState => ({
  state: state.state,
  data: cloneResult(state.data),
  error: state.error,
});

const cloneCache = (cache: SearchCacheData): SearchCacheData =>
  providerNames.reduce((acc, name) => {
    acc[name] = cloneState(cache[name]);
    return acc;
  }, {} as SearchCacheData);

// TODO: Maybe use localStorage for the cache.
const searchCache = new Map<VideoId, SearchCacheData>();
const inFlight = new Map<VideoId, Promise<unknown>>();

const syncStore = (videoId: VideoId, cache: SearchCacheData) => {
  if (getSongInfo().videoId !== videoId) return;
  setLyricsStore('lyrics', () => cloneCache(cache));
};

const searchProvider = async (
  videoId: VideoId,
  providerName: ProviderName,
  cache: SearchCacheData,
  info: SongInfo,
) => {
  let result: ProviderState;

  try {
    const data = await providers[providerName].search(info);
    result = { state: 'done', data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      `[synced-lyrics] ${providerName} failed for ${videoId}`,
      error,
    );
    result = { state: 'error', data: null, error };
  }

  cache[providerName] = result;

  debugLog('provider-result', {
    videoId,
    provider: providerName,
    state: result.state,
    hasLyrics: hasUsableLyrics(result.data),
    error: result.error?.message,
  });

  if (getSongInfo().videoId === videoId) {
    setLyricsStore('lyrics', providerName, cloneState(result));
    applyProviderSelection(videoId, `provider:${providerName}`);
  }
};

export const fetchLyrics = (info: SongInfo) => {
  const { videoId } = info;
  if (!videoId) return;

  if (!configReady) {
    pendingSongInfo = info;
    debugLog('defer-until-config', { videoId });
    return;
  }

  if (lastVideoId !== videoId) {
    lastVideoId = videoId;
    setHasManuallySwitchedProvider(false);
    if (pinnedVideoId !== videoId) {
      setPinnedProviderSignal(null);
      pinnedVideoId = undefined;
    }
  }

  const cached = searchCache.get(videoId);

  // A search for this song is already running; just make sure the panel shows
  // whatever it has so far instead of busy-looping until it finishes.
  if (inFlight.has(videoId)) {
    debugLog('fetch-in-flight', { videoId });
    if (cached) {
      syncStore(videoId, cached);
      applyProviderSelection(videoId, 'in-flight');
    }
    return;
  }

  const cache = cached ?? initialData();
  searchCache.set(videoId, cache);

  const pending = providerNames.filter((name) => isRetryable(cache[name]));
  if (!pending.length) {
    debugLog('fetch-cache-hit', { videoId });
    syncStore(videoId, cache);
    applyProviderSelection(videoId, 'cache-hit');
    return;
  }

  for (const name of pending) {
    cache[name] = { state: 'fetching', data: null, error: null };
  }

  debugLog('fetch-start', { videoId, pending });
  syncStore(videoId, cache);
  applyProviderSelection(videoId, 'fetch-start');

  const task = Promise.allSettled(
    pending.map((name) => searchProvider(videoId, name, cache, info)),
  ).then(() => {
    inFlight.delete(videoId);
    if (getSongInfo().videoId === videoId) {
      untrack(() => applyProviderSelection(videoId, 'fetch-settled'));
    }
  });

  inFlight.set(videoId, task);
};

export const retrySearch = (provider: ProviderName, info: SongInfo) => {
  const { videoId } = info;

  const cache = searchCache.get(videoId) ?? initialData();
  searchCache.set(videoId, cache);

  cache[provider] = { state: 'fetching', data: null, error: null };
  if (getSongInfo().videoId === videoId) {
    setLyricsStore('lyrics', provider, cloneState(cache[provider]));
    applyProviderSelection(videoId, `retry:${provider}`);
  }

  searchProvider(videoId, provider, cache, info).catch(() => {});
};
