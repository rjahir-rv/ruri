import { createSignal, Show } from 'solid-js';

import { t } from '@/i18n';
import { getSongInfo } from '@/providers/song-info-front';

import { lyricsStore, retrySearch } from '../store';

interface ErrorDisplayProps {
  error: Error;
}

// Providers fail for boring reasons (offline, rate limited proxy, YTM shell
// not ready). Lead with what the user can do about it and keep the stack
// behind a disclosure so it stays reportable without being the headline.
export const ErrorDisplay = (props: ErrorDisplayProps) => {
  const [showDetails, setShowDetails] = createSignal(false);

  const isOffline = () => !navigator.onLine;

  const message = () =>
    isOffline()
      ? t('plugins.synced-lyrics.errors.offline')
      : t('plugins.synced-lyrics.errors.provider-failed', {
          provider: lyricsStore.provider,
        });

  const details = () => props.error?.stack || props.error?.message || '';

  return (
    <div class="lyrics-error">
      <div class="lyrics-error-kaomoji">
        {isOffline() ? '(×_×)' : '(・_・;)'}
      </div>

      <div class="lyrics-error-title">
        {t('plugins.synced-lyrics.errors.title')}
      </div>

      <div class="lyrics-error-message">{message()}</div>

      <yt-button-renderer
        data={{
          icon: { iconType: 'REFRESH' },
          isDisabled: false,
          style: 'STYLE_DEFAULT',
          text: {
            simpleText: t('plugins.synced-lyrics.refetch-btn.normal'),
          },
        }}
        onClick={() => retrySearch(lyricsStore.provider, getSongInfo())}
      />

      <Show when={details()}>
        <button
          class="lyrics-error-toggle"
          onClick={() => setShowDetails((shown) => !shown)}
          type="button"
        >
          {t('plugins.synced-lyrics.errors.details')}
        </button>

        <Show when={showDetails()}>
          <pre class="lyrics-error-details">{details()}</pre>
        </Show>
      </Show>
    </div>
  );
};
