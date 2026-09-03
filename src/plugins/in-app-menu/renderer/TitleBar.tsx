import { type Menu, type MenuItem } from 'electron';
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
  Index,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { css } from 'solid-styled-components';

import { t } from '@/i18n';
import { cacheNoArgs } from '@/providers/decorators';

import { IconButton } from './IconButton';
import { MenuButton } from './MenuButton';
import { Panel } from './Panel';
import { PanelRenderer } from './PanelRenderer';
import { PluginGallery } from './PluginGallery';
import { WindowController } from './WindowController';

import { MENU_BAR_ICONS, PLUGINS_MENU_ID } from '../gallery/catalog';
import { PhIcon, type PhIconName } from '../gallery/icons';
import { submenuItemsOf } from '../gallery/parse';

import type { InAppMenuConfig } from '../constants';
import type { RendererContext } from '@/types/contexts';

const titleStyle = cacheNoArgs(
  () => css`
    -webkit-app-region: drag;
    box-sizing: border-box;

    position: fixed;
    top: 0;
    z-index: 10000010;

    width: 100%;
    height: var(--menu-bar-height, 32px);

    display: flex;
    flex-flow: row;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;

    color: var(--glassy-text, #f4f6fb);
    font-size: 12px;
    padding: 3px 4px 3px var(--offset-left, 4px);
    background-color: var(
      --titlebar-background-color,
      rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.75)
    );
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(var(--glassy-blur, 18px))
      saturate(var(--glassy-saturate, 140%));
    -webkit-backdrop-filter: blur(var(--glassy-blur, 18px))
      saturate(var(--glassy-saturate, 140%));
    user-select: none;

    transition:
      opacity 200ms ease 0s,
      transform 300ms var(--glassy-ease, cubic-bezier(0.2, 0, 0.6, 1)) 0s,
      background-color 300ms var(--glassy-ease, cubic-bezier(0.2, 0, 0.6, 1)) 0s;

    &[data-macos='true'] {
      padding: 3px 4px 3px 74px;
    }

    ytmusic-app:has(ytmusic-player[player-ui-state='FULLSCREEN'])
      ~ &:not([data-show='true']) {
      transform: translateY(calc(-1 * var(--menu-bar-height, 32px)));
    }

    html[data-glassy-quality='low'] & {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background-color: var(
        --titlebar-background-color,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.92)
      );
    }

    @supports not (
      (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
    ) {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background-color: var(
        --titlebar-background-color,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.92)
      );
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
    }
  `,
);

const menuRowStyle = cacheNoArgs(
  () => css`
    display: flex;
    flex-flow: row;
    align-items: center;
    align-self: stretch;
    gap: 4px;
    min-width: 0;
  `,
);

export type TitleBarProps = {
  ipc: RendererContext<InAppMenuConfig>['ipc'];
  isMacOS?: boolean;
  enableController?: boolean;
  initialCollapsed?: boolean;
};
export const TitleBar = (props: TitleBarProps) => {
  const [collapsed, setCollapsed] = createSignal(props.initialCollapsed);
  const [openMenuId, setOpenMenuId] = createSignal<string | null>(null);
  const [anchors, setAnchors] = createSignal(new Map<string, HTMLElement>());
  const [menu, setMenu] = createSignal<Menu | null>(null);
  const [mouseY, setMouseY] = createSignal(0);

  const isPluginsMenuItem = (item: MenuItem) =>
    item.id === PLUGINS_MENU_ID || item.label === t('main.menu.plugins.label');

  const idForMenuItem = (item: MenuItem, index: number) =>
    isPluginsMenuItem(item) ? PLUGINS_MENU_ID : item.id || `menu-${index}`;

  const openMenuItem = createMemo(() => {
    const id = openMenuId();
    if (!id) return undefined;
    return menu()?.items.find(
      (item, index) => idForMenuItem(item, index) === id,
    );
  });

  const openAnchor = createMemo(() => {
    const id = openMenuId();
    return id ? (anchors().get(id) ?? null) : null;
  });

  const [data, { refetch }] = createResource(
    async () => (await props.ipc.invoke('get-menu')) as Promise<Menu | null>,
  );
  const [isMaximized, { refetch: refetchMaximize }] = createResource(
    async () =>
      (await props.ipc.invoke('window-is-maximized')) as Promise<boolean>,
  );

  const handleToggleMaximize = async () => {
    if (isMaximized()) {
      await props.ipc.invoke('window-unmaximize');
    } else {
      await props.ipc.invoke('window-maximize');
    }
    await refetchMaximize();
  };
  const handleMinimize = async () => {
    await props.ipc.invoke('window-minimize');
  };
  const handleClose = async () => {
    await props.ipc.invoke('window-close');
  };

  const refreshMenuItem = async (originalMenu: Menu, commandId: number) => {
    const menuItem = (await window.ipcRenderer.invoke(
      'get-menu-by-id',
      commandId,
    )) as MenuItem | null;

    const newMenu = structuredClone(originalMenu);
    const stack = [...(newMenu?.items ?? [])];
    let now: MenuItem | undefined = stack.pop();
    while (now) {
      const children = submenuItemsOf(now);
      const index = children.findIndex((it) => it.commandId === commandId);

      if (index >= 0) {
        if (menuItem) children.splice(index, 1, menuItem);
        else children.splice(index, 1);
      }
      if (children.length > 0) {
        stack.push(...children);
      }

      now = stack.pop();
    }

    return newMenu;
  };

  const handleItemClick = async (
    commandId: number,
    radioGroup?: MenuItem[],
  ) => {
    const menuData = menu();
    if (!menuData) return;

    if (Array.isArray(radioGroup)) {
      let newMenu = menuData;
      for (const item of radioGroup) {
        newMenu = await refreshMenuItem(newMenu, item.commandId);
      }

      setMenu(newMenu);
      return;
    }

    setMenu(await refreshMenuItem(menuData, commandId));
  };

  const listener = (e: MouseEvent) => {
    setMouseY(e.clientY);
  };

  onMount(() => {
    props.ipc.on('close-all-in-app-menu-panel', async () => {
      setMenu(null);
      await refetch();
      setMenu(data() ?? null);
    });
    props.ipc.on('refresh-in-app-menu', async () => {
      await refetch();
      setMenu(data() ?? null);
    });
    props.ipc.on('toggle-in-app-menu', () => {
      setCollapsed((current) => !current);
    });
    props.ipc.on('open-plugin-gallery', () => {
      setCollapsed(false);
      setOpenMenuId((current) =>
        current === PLUGINS_MENU_ID ? null : PLUGINS_MENU_ID,
      );
    });

    props.ipc.on('window-maximize', refetchMaximize);
    props.ipc.on('window-unmaximize', refetchMaximize);

    // close menu when the outside of the panel or sub-panel is clicked
    document.body.addEventListener('click', (e) => {
      if (
        e.target instanceof HTMLElement &&
        !(
          e.target.closest('nav[data-ytmd-main-panel]') ||
          e.target.closest('ul[data-ytmd-sub-panel]') ||
          e.target.closest('[data-ytmd-plugin-gallery]')
        )
      ) {
        setOpenMenuId(null);
      }
    });

    // tracking mouse position
    window.addEventListener('mousemove', listener);
    const ytmusicAppLayout = document.querySelector<HTMLElement>('#layout');
    ytmusicAppLayout?.addEventListener('scroll', () => {
      const scrollValue = ytmusicAppLayout.scrollTop;
      if (scrollValue > 20) {
        ytmusicAppLayout.classList.add('content-scrolled');
      } else {
        ytmusicAppLayout.classList.remove('content-scrolled');
      }
    });
  });

  createEffect(() => {
    if (!menu() && data()) {
      setMenu(data() ?? null);
    }
  });

  onCleanup(() => {
    window.removeEventListener('mousemove', listener);
  });

  return (
    <nav
      class={titleStyle()}
      data-macos={props.isMacOS}
      data-show={mouseY() < 32}
      data-ytmd-main-panel={true}
      id={'ytmd-title-bar-main-panel'}
    >
      <IconButton
        onClick={() => {
          setCollapsed((current) => !current);
          setOpenMenuId(null);
        }}
        style={{
          'border-top-left-radius': '4px',
        }}
      >
        <svg height={16} viewBox={'0 0 24 24'} width={16}>
          <path
            d="M3 17h12a1 1 0 0 1 .117 1.993L15 19H3a1 1 0 0 1-.117-1.993L3 17h12H3Zm0-6h18a1 1 0 0 1 .117 1.993L21 13H3a1 1 0 0 1-.117-1.993L3 11h18H3Zm0-6h15a1 1 0 0 1 .117 1.993L18 7H3a1 1 0 0 1-.117-1.993L3 5h15H3Z"
            fill="currentColor"
          />
        </svg>
      </IconButton>
      <Show when={!collapsed()}>
        <div class={menuRowStyle()}>
          <Index each={menu()?.items}>
            {(item, index) => {
              const isPlugins = () =>
                item().id === PLUGINS_MENU_ID ||
                item().label === t('main.menu.plugins.label');
              const menuId = () =>
                isPlugins() ? PLUGINS_MENU_ID : item().id || `menu-${index}`;
              const menuIcon = () =>
                MENU_BAR_ICONS[menuId()] as PhIconName | undefined;

              const handleClick = () => {
                setOpenMenuId((current) =>
                  current === menuId() ? null : menuId(),
                );
              };

              return (
                <MenuButton
                  aria-haspopup={isPlugins() ? 'dialog' : 'menu'}
                  icon={
                    <Show when={menuIcon()}>
                      {(name) => <PhIcon name={name()} size={14} />}
                    </Show>
                  }
                  onClick={handleClick}
                  ref={(el) => {
                    setAnchors((prev) => {
                      if (prev.get(menuId()) === el) return prev;
                      const next = new Map(prev);
                      if (el) next.set(menuId(), el);
                      else next.delete(menuId());
                      return next;
                    });
                  }}
                  selected={openMenuId() === menuId()}
                  text={item().label}
                />
              );
            }}
          </Index>
        </div>
      </Show>
      <Show when={openMenuItem()}>
        {(item) => (
          <Show
            fallback={
              <Panel
                anchor={openAnchor()}
                offset={{ mainAxis: 8 }}
                open={true}
                placement={'bottom-start'}
              >
                <PanelRenderer
                  items={submenuItemsOf(item())}
                  onClick={handleItemClick}
                />
              </Panel>
            }
            when={isPluginsMenuItem(item())}
          >
            <ErrorBoundary
              fallback={(error) => {
                console.error('plugin-gallery', error);
                queueMicrotask(() => setOpenMenuId(null));
                return null;
              }}
            >
              <PluginGallery
                items={submenuItemsOf(item())}
                onClose={() => setOpenMenuId(null)}
                onItemClick={handleItemClick}
                open={true}
              />
            </ErrorBoundary>
          </Show>
        )}
      </Show>
      <Show when={props.enableController}>
        <div style={{ flex: 1 }} />
        <WindowController
          isMaximize={isMaximized()}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onToggleMaximize={handleToggleMaximize}
        />
      </Show>
    </nav>
  );
};
