import { get } from '@/config';
import { t } from '@/i18n';

import type { GlassyThemeConfig } from './types';
import type { MenuContext } from '@/types/contexts';

export const onMenu = async ({
  getConfig,
  setConfig,
}: MenuContext<GlassyThemeConfig>) => {
  const config = await getConfig();
  const hwOff = Boolean(get('options.disableHardwareAcceleration'));

  return [
    {
      label: t('plugins.glassy-theme.menu.quality.label'),
      submenu: [
        {
          label: t('plugins.glassy-theme.menu.quality.high'),
          type: 'radio' as const,
          enabled: !hwOff,
          checked: !hwOff && config.quality === 'high',
          click() {
            setConfig({ quality: 'high' });
          },
        },
        {
          label: hwOff
            ? t('plugins.glassy-theme.menu.quality.low-forced')
            : t('plugins.glassy-theme.menu.quality.low'),
          type: 'radio' as const,
          checked: hwOff || config.quality === 'low',
          click() {
            setConfig({ quality: 'low' });
          },
        },
      ],
    },
  ];
};
