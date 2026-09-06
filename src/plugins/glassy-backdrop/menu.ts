import { t } from '@/i18n';

import type { GlassyBackdropConfig } from './types';
import type { MenuContext } from '@/types/contexts';

export const onMenu = async ({
  getConfig,
  setConfig,
}: MenuContext<GlassyBackdropConfig>) => {
  const config = await getConfig();

  return [
    {
      label: t('plugins.glassy-backdrop.menu.aqua'),
      type: 'checkbox' as const,
      checked: config.aqua,
      click(item: Electron.MenuItem) {
        setConfig({ aqua: item.checked });
      },
    },
  ];
};
