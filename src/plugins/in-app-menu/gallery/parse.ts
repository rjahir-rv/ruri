import {
  getPluginGalleryEntry,
  isPluginSectionHeaderId,
  LOCKED_PLUGIN_IDS,
  type PluginSectionId,
} from './catalog';

import type { MenuItem } from 'electron';

export type GalleryPlugin = {
  id: string;
  name: string;
  description?: string;
  isNew: boolean;
  section: PluginSectionId;
  icon: string;
  enabled: boolean;
  locked: boolean;
  enableCommandId?: number;
  settingsItems: MenuItem[];
};

const isVisible = (item: MenuItem) => item.visible !== false;

export const submenuItemsOf = (item: MenuItem): MenuItem[] => {
  const submenu = item.submenu as MenuItem['submenu'] | MenuItem[] | undefined;
  if (!submenu) return [];
  if (Array.isArray(submenu)) return submenu;
  return submenu.items ?? [];
};

export const pluginSettingsItems = (item: MenuItem): MenuItem[] => {
  const children = submenuItemsOf(item);
  const settings: MenuItem[] = [];
  let pastEnable = false;

  for (const child of children) {
    if (!pastEnable) {
      if (child.type === 'checkbox' || child.type === 'separator') {
        if (child.type === 'separator') pastEnable = true;
        continue;
      }
      pastEnable = true;
    }
    if (isVisible(child)) settings.push(child);
  }

  return settings;
};

export const parseGalleryPlugins = (items: MenuItem[]): GalleryPlugin[] => {
  const plugins: GalleryPlugin[] = [];

  for (const item of items) {
    if (!isVisible(item)) continue;
    if (item.type === 'separator') continue;
    if (isPluginSectionHeaderId(item.id)) continue;

    const id = item.id;
    if (!id) continue;

    const entry = getPluginGalleryEntry(id);
    const isSubmenu = item.type === 'submenu';
    const enableItem = isSubmenu
      ? submenuItemsOf(item).find(
          (child) => child.type === 'checkbox' && isVisible(child),
        )
      : item;

    plugins.push({
      id,
      name: item.label,
      description: item.toolTip || undefined,
      isNew: Boolean(item.sublabel),
      section: entry.section,
      icon: entry.icon,
      enabled: Boolean(enableItem?.checked),
      locked: LOCKED_PLUGIN_IDS.has(id),
      enableCommandId: enableItem?.commandId,
      settingsItems: isSubmenu ? pluginSettingsItems(item) : [],
    });
  }

  return plugins;
};
