import type { ProviderName } from '../providers';

let debugEnabled = false;
let preferredProvider: ProviderName | undefined;

export const setLyricsRuntime = (options: {
  debug?: boolean;
  preferredProvider?: ProviderName;
}) => {
  debugEnabled = Boolean(options.debug);
  preferredProvider = options.preferredProvider;
};

export const getPreferredProvider = () => preferredProvider;

export const debugLog = (event: string, details?: unknown) => {
  if (!debugEnabled) return;
  if (details === undefined) {
    console.debug(`[synced-lyrics] ${event}`);
    return;
  }
  console.debug(`[synced-lyrics] ${event}`, details);
};
