import { expect, test } from '@playwright/test';

import { hasUsableLyrics, pickBestProvider } from './lyrics-select';

import {
  type ProviderName,
  ProviderNames,
  providerNames,
  type ProviderState,
} from '../providers';

import type { LineLyrics } from '../types';

const fetching = (): ProviderState => ({
  state: 'fetching',
  data: null,
  error: null,
});

const none = (): ProviderState => ({
  state: 'done',
  data: null,
  error: null,
});

const failed = (): ProviderState => ({
  state: 'error',
  data: null,
  error: new Error('provider failed'),
});

const synced = (): ProviderState => ({
  state: 'done',
  data: {
    title: 'Song',
    artists: ['Artist'],
    lines: [
      {
        time: '00:00.00',
        timeInMs: 0,
        duration: 1000,
        text: 'hello',
        status: 'upcoming',
      } satisfies LineLyrics,
    ],
  },
  error: null,
});

const plain = (): ProviderState => ({
  state: 'done',
  data: {
    title: 'Song',
    artists: ['Artist'],
    lyrics: 'hello',
  },
  error: null,
});

const emptyLines = (): ProviderState => ({
  state: 'done',
  data: {
    title: 'Song',
    artists: ['Artist'],
    lines: [],
  },
  error: null,
});

const whitespaceLyrics = (): ProviderState => ({
  state: 'done',
  data: {
    title: 'Song',
    artists: ['Artist'],
    lyrics: '   \n',
  },
  error: null,
});

const bag = (partial: Partial<Record<ProviderName, ProviderState>>) => {
  const lyrics = Object.fromEntries(
    providerNames.map((name) => [name, fetching()]),
  ) as Record<ProviderName, ProviderState>;
  return { ...lyrics, ...partial };
};

test('hasUsableLyrics rejects empty or whitespace results', () => {
  expect(hasUsableLyrics(null)).toBe(false);
  expect(hasUsableLyrics(undefined)).toBe(false);
  expect(hasUsableLyrics({ title: 't', artists: [] })).toBe(false);
  expect(hasUsableLyrics(emptyLines().data)).toBe(false);
  expect(hasUsableLyrics(whitespaceLyrics().data)).toBe(false);
  expect(hasUsableLyrics(synced().data)).toBe(true);
  expect(hasUsableLyrics(plain().data)).toBe(true);
});

test('keeps a fetching provider while others are still in flight', () => {
  expect(
    pickBestProvider(bag({}), {
      current: ProviderNames.YTMusic,
    }),
  ).toBe(ProviderNames.YTMusic);
});

test('does not show not-found while a later provider is still fetching', () => {
  expect(
    pickBestProvider(
      bag({
        [ProviderNames.YTMusic]: none(),
      }),
      { current: ProviderNames.YTMusic },
    ),
  ).toBe(ProviderNames.LRCLib);
});

test('selects the first provider that actually has lyrics', () => {
  expect(
    pickBestProvider(
      bag({
        [ProviderNames.YTMusic]: none(),
        [ProviderNames.LRCLib]: synced(),
        [ProviderNames.MusixMatch]: fetching(),
      }),
      { current: ProviderNames.YTMusic },
    ),
  ).toBe(ProviderNames.LRCLib);
});

test('prefers YTMusic synced lines when both providers succeeded', () => {
  expect(
    pickBestProvider(
      bag({
        [ProviderNames.YTMusic]: synced(),
        [ProviderNames.LRCLib]: plain(),
      }),
      { current: ProviderNames.LRCLib },
    ),
  ).toBe(ProviderNames.YTMusic);
});

test('honors a preferred provider that has usable lyrics', () => {
  expect(
    pickBestProvider(
      bag({
        [ProviderNames.YTMusic]: synced(),
        [ProviderNames.LRCLib]: plain(),
      }),
      {
        preferred: ProviderNames.LRCLib,
        current: ProviderNames.YTMusic,
      },
    ),
  ).toBe(ProviderNames.LRCLib);
});

test('ignores a preferred provider that came back empty', () => {
  expect(
    pickBestProvider(
      bag({
        [ProviderNames.YTMusic]: emptyLines(),
        [ProviderNames.LRCLib]: plain(),
      }),
      {
        preferred: ProviderNames.YTMusic,
        current: ProviderNames.YTMusic,
      },
    ),
  ).toBe(ProviderNames.LRCLib);
});

test('stays on the current provider once every search has settled empty', () => {
  expect(
    pickBestProvider(
      bag({
        [ProviderNames.YTMusic]: none(),
        [ProviderNames.LRCLib]: emptyLines(),
        [ProviderNames.MusixMatch]: whitespaceLyrics(),
        [ProviderNames.LyricsGenius]: failed(),
      }),
      { current: ProviderNames.YTMusic },
    ),
  ).toBe(ProviderNames.YTMusic);
});
