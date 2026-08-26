import { t } from '@/i18n';

// A bare kaomoji is indistinguishable from a failed load, so say what happened.
export const NotFoundKaomoji = () => {
  return (
    <div class="lyrics-error">
      <div class="lyrics-error-kaomoji">＼(〇_ｏ)／</div>

      <div class="lyrics-error-message">
        {t('plugins.synced-lyrics.errors.not-found')}
      </div>
    </div>
  );
};
