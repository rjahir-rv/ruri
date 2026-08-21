import { isEnabled } from '@/config/plugins';
import { t } from '@/i18n';

import type { AlbumColorThemeConfig } from './types';
import type { MenuContext } from '@/types/contexts';

const RATIO_LIST = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

export const onMenu = async ({
  getConfig,
  setConfig,
}: MenuContext<AlbumColorThemeConfig>) => {
  const config = await getConfig();
  const glassOn = await isEnabled('glassy-theme');
  const backdropOn = await isEnabled('glassy-backdrop');

  return [
    {
      label: t('plugins.album-color-theme.menu.color-mix-ratio.label'),
      submenu: RATIO_LIST.map((ratio) => ({
        label: t(
          'plugins.album-color-theme.menu.color-mix-ratio.submenu.percent',
          {
            ratio: ratio * 100,
          },
        ),
        type: 'radio' as const,
        checked: config.ratio === ratio,
        click() {
          setConfig({ ratio });
        },
      })),
    },
    {
      label: t('plugins.album-color-theme.menu.enable-seekbar'),
      type: 'checkbox' as const,
      checked: config.enableSeekbar,
      click(item: Electron.MenuItem) {
        setConfig({ enableSeekbar: item.checked });
      },
    },
    {
      label: t('plugins.album-color-theme.menu.paint-page-background'),
      type: 'checkbox' as const,
      checked: config.paintPageBackground,
      enabled: !glassOn && !backdropOn,
      click(item: Electron.MenuItem) {
        setConfig({ paintPageBackground: item.checked });
      },
    },
  ];
};
