import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import { startFullscreenLyrics, stopFullscreenLyrics } from './fullscreen-lyrics';
import lyrics from './lyrics.css?inline';
import { onMenu } from './menu';
import overlay from './overlay.css?inline';
import tokens from './tokens.css?inline';

import type { GlassyQuality, GlassyThemeConfig } from './types';

const defaultConfig: GlassyThemeConfig = {
  enabled: true,
  quality: 'high',
  fullscreenLyrics: true,
};

function applyQuality(quality: GlassyQuality) {
  const hwOff = Boolean(
    window.mainConfig.get('options.disableHardwareAcceleration'),
  );
  document.documentElement.dataset.glassyQuality = hwOff ? 'low' : quality;
}

/* blur-nav-bar frosts #nav-bar-background too. Stacking both doubles the
   backdrop-filter on the same node: darker, blurrier, and slower. */
async function warnOnDoubleBlur() {
  if (await window.mainConfig.plugins.isEnabled('blur-nav-bar')) {
    console.warn(
      'glassy-theme: Blur Navigation Bar is also enabled; the nav bar gets a double blur. Turn one of them off.',
    );
  }
}

export default createPlugin({
  name: () => t('plugins.glassy-theme.name'),
  description: () => t('plugins.glassy-theme.description'),
  restartNeeded: false,
  config: defaultConfig,
  stylesheets: [tokens, overlay, lyrics],
  menu: onMenu,
  renderer: {
    async start({ getConfig }) {
      const config = await getConfig();
      applyQuality(config.quality);
      if (config.fullscreenLyrics) startFullscreenLyrics();
      await warnOnDoubleBlur();
    },
    onConfigChange(newConfig: GlassyThemeConfig) {
      applyQuality(newConfig.quality);
      if (newConfig.fullscreenLyrics) startFullscreenLyrics();
      else stopFullscreenLyrics();
    },
    stop() {
      stopFullscreenLyrics();
      delete document.documentElement.dataset.glassyQuality;
    },
  },
});
