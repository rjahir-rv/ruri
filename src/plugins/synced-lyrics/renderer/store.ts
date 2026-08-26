import { createMemo, runWithOwner } from 'solid-js';
import { createStore } from 'solid-js/store';

import { getSongInfo } from '@/providers/song-info-front';

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

// A provider result is only worth keeping if the search actually completed.
// `error` (network blip, YTM shell not ready yet, rate limited proxy, ...) and
// `fetching` are transient, so they must be retried instead of being served
// from the cache as if they were a definitive "no lyrics for this song".
const isRetryable = (state: ProviderState) =>
  state.state === 'error' || state.state === 'fetching';

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

  if (getSongInfo().videoId === videoId) {
    setLyricsStore('lyrics', providerName, cloneState(result));
  }
};

export const fetchLyrics = (info: SongInfo) => {
  const { videoId } = info;

  const cached = searchCache.get(videoId);

  // A search for this song is already running; just make sure the panel shows
  // whatever it has so far instead of busy-looping until it finishes.
  if (inFlight.has(videoId)) {
    if (cached) syncStore(videoId, cached);
    return;
  }

  const cache = cached ?? initialData();
  searchCache.set(videoId, cache);

  const pending = providerNames.filter((name) => isRetryable(cache[name]));
  if (!pending.length) {
    syncStore(videoId, cache);
    return;
  }

  for (const name of pending) {
    cache[name] = { state: 'fetching', data: null, error: null };
  }

  syncStore(videoId, cache);

  const task = Promise.allSettled(
    pending.map((name) => searchProvider(videoId, name, cache, info)),
  ).then(() => {
    inFlight.delete(videoId);
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
  }

  searchProvider(videoId, provider, cache, info).catch(() => {});
};
