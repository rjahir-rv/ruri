import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import {
  startFullscreenLyrics,
  stopFullscreenLyrics,
} from './fullscreen-lyrics';
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

function applyNavBlur(on: boolean) {
  if (on) {
    document.documentElement.dataset.glassyNavBlur = 'on';
    return;
  }
  document.documentElement.removeAttribute('data-glassy-nav-blur');
}

async function syncNavBlur() {
  applyNavBlur(await window.mainConfig.plugins.isEnabled('blur-nav-bar'));
}

const onNavBlurPlugin = (_event: unknown, id: unknown) => {
  if (id !== 'blur-nav-bar') return;
  syncNavBlur().catch(console.error);
};

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
      await syncNavBlur();
      window.ipcRenderer.on('plugin:enable', onNavBlurPlugin);
      window.ipcRenderer.on('plugin:unload', onNavBlurPlugin);
    },
    onConfigChange(newConfig: GlassyThemeConfig) {
      applyQuality(newConfig.quality);
      if (newConfig.fullscreenLyrics) startFullscreenLyrics();
      else stopFullscreenLyrics();
    },
    stop() {
      stopFullscreenLyrics();
      window.ipcRenderer.removeListener('plugin:enable', onNavBlurPlugin);
      window.ipcRenderer.removeListener('plugin:unload', onNavBlurPlugin);
      delete document.documentElement.dataset.glassyQuality;
      delete document.documentElement.dataset.glassyNavBlur;
    },
  },
});
