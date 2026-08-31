import {
  type ProviderName,
  ProviderNames,
  providerNames,
  type ProviderState,
} from '../providers';

import type { LyricResult } from '../types';

export const hasUsableLyrics = (data: LyricResult | null | undefined) => {
  if (!data) return false;
  if (Array.isArray(data.lines) && data.lines.length > 0) return true;
  return typeof data.lyrics === 'string' && data.lyrics.trim().length > 0;
};

export const providerBias = (
  lyrics: Record<ProviderName, ProviderState>,
  provider: ProviderName,
) => {
  const entry = lyrics[provider];
  const lineCount = entry.data?.lines?.length ?? 0;

  return (
    (entry.state === 'done' ? 1 : -1) +
    (lineCount ? 2 : -1) +
    (lineCount && provider === ProviderNames.YTMusic ? 1 : 0) +
    (hasUsableLyrics(entry.data) && entry.data?.lyrics ? 1 : -1)
  );
};

export const pickBestProvider = (
  lyrics: Record<ProviderName, ProviderState>,
  options: {
    preferred?: ProviderName;
    current: ProviderName;
  },
): ProviderName => {
  const preferred = options.preferred;
  if (preferred && hasUsableLyrics(lyrics[preferred]?.data)) {
    return preferred;
  }

  const ranked = [...providerNames].sort(
    (a, b) => providerBias(lyrics, b) - providerBias(lyrics, a),
  );
  const withLyrics = ranked.find((provider) =>
    hasUsableLyrics(lyrics[provider]?.data),
  );
  if (withLyrics) return withLyrics;

  const fetching = providerNames.filter(
    (provider) => lyrics[provider]?.state === 'fetching',
  );
  if (fetching.length) {
    if (fetching.includes(options.current)) return options.current;
    return fetching[0];
  }

  return options.current;
};
