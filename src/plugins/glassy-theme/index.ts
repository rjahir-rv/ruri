import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import lyrics from './lyrics.css?inline';
import overlay from './overlay.css?inline';
import tokens from './tokens.css?inline';

import type { GlassyQuality, GlassyThemeConfig } from './types';

const defaultConfig: GlassyThemeConfig = {
  enabled: true,
  quality: 'high',
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
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();

    return [
      {
        label: t('plugins.glassy-theme.menu.quality.label'),
        submenu: [
          {
            label: t('plugins.glassy-theme.menu.quality.high'),
            type: 'radio',
            checked: config.quality === 'high',
            click() {
              setConfig({ quality: 'high' });
            },
          },
          {
            label: t('plugins.glassy-theme.menu.quality.low'),
            type: 'radio',
            checked: config.quality === 'low',
            click() {
              setConfig({ quality: 'low' });
            },
          },
        ],
      },
    ];
  },
  renderer: {
    async start({ getConfig }) {
      const config = await getConfig();
      applyQuality(config.quality);
      await warnOnDoubleBlur();
    },
    onConfigChange(newConfig: GlassyThemeConfig) {
      applyQuality(newConfig.quality);
    },
    stop() {
      delete document.documentElement.dataset.glassyQuality;
    },
  },
});
