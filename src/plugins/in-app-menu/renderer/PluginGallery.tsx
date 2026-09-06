import { type MenuItem } from 'electron';
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { css } from 'solid-styled-components';

import { t } from '@/i18n';
import { cacheNoArgs } from '@/providers/decorators';

import { PluginDetail } from './PluginDetail';
import { PluginTile } from './PluginTile';

import {
  FALLBACK_PLUGIN_ICON,
  PLUGIN_SECTION_IDS,
  RESTART_NEEDED_PLUGIN_IDS,
  type PluginSectionId,
} from '../gallery/catalog';
import { PhIcon, type PhIconName } from '../gallery/icons';
import { parseGalleryPlugins, type GalleryPlugin } from '../gallery/parse';

const overlayStyle = cacheNoArgs(
  () => css`
    position: fixed;
    inset: 0;
    z-index: 10000020;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px calc(var(--ytmusic-player-bar-height, 72px) + 16px);
    box-sizing: border-box;
    -webkit-app-region: no-drag;
  `,
);

const scrimStyle = cacheNoArgs(
  () => css`
    position: absolute;
    inset: 0;
    background: rgba(4, 4, 8, 0.42);
    -webkit-app-region: no-drag;
  `,
);

const sheetStyle = cacheNoArgs(
  () => css`
    position: relative;
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    grid-template-columns: minmax(0, 1fr) 0fr;
    width: min(960px, 100%);
    height: min(640px, 100%);
    min-height: 280px;
    max-height: 100%;
    overflow: hidden;
    -webkit-app-region: no-drag;
    border-radius: var(--glassy-radius-lg, 18px);
    border: var(--glassy-border, 1px solid rgba(255, 255, 255, 0.12));
    box-shadow:
      var(--glassy-shadow, 0 10px 28px rgba(0, 0, 0, 0.35)),
      var(--glassy-highlight, inset 0 1px 0 rgba(255, 255, 255, 0.14));
    background:
      linear-gradient(
        var(--glassy-search-scrim, rgba(8, 8, 12, 0.42)),
        var(--glassy-search-scrim, rgba(8, 8, 12, 0.42))
      ),
      var(
        --glassy-search-panel,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.9)
      );
    backdrop-filter: blur(var(--glassy-search-blur, 32px))
      saturate(var(--glassy-saturate, 140%));
    -webkit-backdrop-filter: blur(var(--glassy-search-blur, 32px))
      saturate(var(--glassy-saturate, 140%));
    color: var(--glassy-text, #f4f6fb);

    &[data-detail='true'] {
      grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
    }

    html[data-glassy-quality='low'] & {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: var(
        --glassy-search-panel,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.95)
      );
    }

    @supports not (
      (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
    ) {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: var(
        --glassy-search-panel,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.95)
      );
    }
  `,
);

const headerStyle = cacheNoArgs(
  () => css`
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px 8px;
  `,
);

const titleStyle = cacheNoArgs(
  () => css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 15px;
    font-weight: 650;
    letter-spacing: 0.01em;
    white-space: nowrap;
  `,
);

const searchStyle = cacheNoArgs(
  () => css`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    height: 34px;
    padding: 0 12px;
    border-radius: var(--glassy-search-radius, 12px);
    background: var(--glassy-search-fill, rgba(255, 255, 255, 0.08));
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--glassy-text-muted, #c5cad4);

    input {
      flex: 1;
      min-width: 0;
      border: none;
      background: transparent;
      color: var(--glassy-text, #f4f6fb);
      font-size: 13px;
      outline: none;
    }

    input::placeholder {
      color: var(--glassy-text-muted, #c5cad4);
    }
  `,
);

const closeStyle = cacheNoArgs(
  () => css`
    -webkit-app-region: no-drag;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: var(--glassy-text-muted, #c5cad4);
    cursor: pointer;
    outline: none;
    flex-shrink: 0;
    pointer-events: auto;

    &:hover {
      background: var(--glassy-hover, rgba(255, 255, 255, 0.1));
      color: var(--glassy-text, #f4f6fb);
    }

    &:focus-visible {
      outline: 2px solid rgba(244, 246, 251, 0.75);
      outline-offset: 2px;
    }
  `,
);

const chipsStyle = cacheNoArgs(
  () => css`
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 4px 16px 12px;
  `,
);

const chipStyle = cacheNoArgs(
  () => css`
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: var(--glassy-text-muted, #c5cad4);
    font-size: 12px;
    font-weight: 550;
    cursor: pointer;
    outline: none;

    &[data-active='true'] {
      background: rgba(var(--ytmusic-album-color, 180, 180, 200), 0.28);
      color: var(--glassy-text, #f4f6fb);
      border-color: rgba(255, 255, 255, 0.22);
    }

    &:hover {
      background: var(--glassy-hover, rgba(255, 255, 255, 0.1));
      color: var(--glassy-text, #f4f6fb);
    }

    &:focus-visible {
      outline: 2px solid rgba(244, 246, 251, 0.75);
      outline-offset: 2px;
    }
  `,
);

const bodyStyle = cacheNoArgs(
  () => css`
    min-width: 0;
    min-height: 0;
    overflow: auto;
    padding: 0 16px 16px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  `,
);

const sectionTitleStyle = cacheNoArgs(
  () => css`
    margin: 8px 2px 10px;
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--glassy-text-muted, #c5cad4);
  `,
);

const gridStyle = cacheNoArgs(
  () => css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 10px;
    margin-bottom: 18px;
  `,
);

const emptyStyle = cacheNoArgs(
  () => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 180px;
    color: var(--glassy-text-muted, #c5cad4);
    font-size: 13px;
  `,
);

type SectionFilter = 'all' | PluginSectionId;

const matchesQuery = (plugin: GalleryPlugin, query: string) => {
  if (!query) return true;
  const haystack = `${plugin.name} ${plugin.description ?? ''}`.toLowerCase();
  return haystack.includes(query);
};

const asIconName = (icon: string): PhIconName =>
  (icon || FALLBACK_PLUGIN_ICON) as PhIconName;

export type PluginGalleryProps = {
  open?: boolean;
  items: MenuItem[];
  onClose: () => void;
  onItemClick?: (commandId: number, radioGroup?: MenuItem[]) => void;
};

export const PluginGallery = (props: PluginGalleryProps) => {
  const [query, setQuery] = createSignal('');
  const [section, setSection] = createSignal<SectionFilter>('all');
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [searchEl, setSearchEl] = createSignal<HTMLInputElement | null>(null);
  const [sheetEl, setSheetEl] = createSignal<HTMLDivElement | null>(null);

  const plugins = createMemo(() => parseGalleryPlugins(props.items));

  const filtered = createMemo(() => {
    const q = query().trim().toLowerCase();
    const sectionId = section();
    return plugins().filter((plugin) => {
      if (sectionId !== 'all' && plugin.section !== sectionId) return false;
      return matchesQuery(plugin, q);
    });
  });

  const grouped = createMemo(() => {
    const groups: { id: PluginSectionId; plugins: GalleryPlugin[] }[] = [];
    for (const id of PLUGIN_SECTION_IDS) {
      const items = filtered().filter((plugin) => plugin.section === id);
      if (items.length > 0) groups.push({ id, plugins: items });
    }
    return groups;
  });

  const selected = createMemo(
    () => plugins().find((plugin) => plugin.id === selectedId()) ?? null,
  );

  const sectionLabel = (id: SectionFilter) =>
    t(`main.menu.plugins.sections.${id}`);

  const togglePlugin = async (plugin: GalleryPlugin) => {
    if (plugin.locked || plugin.enableCommandId === undefined) return;
    await window.ipcRenderer.invoke('peard:menu-event', plugin.enableCommandId);
    props.onItemClick?.(plugin.enableCommandId);
  };

  const closeGallery = (event?: Event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (event && 'button' in event && (event as PointerEvent).button > 0) {
      return;
    }
    props.onClose();
  };

  const closeDetailOrGallery = (event?: Event) => {
    if (selectedId()) {
      event?.preventDefault();
      event?.stopPropagation();
      setSelectedId(null);
      return;
    }
    closeGallery(event);
  };

  createEffect(() => {
    if (!props.open) {
      setQuery('');
      setSection('all');
      setSelectedId(null);
      return;
    }

    const frame = requestAnimationFrame(() => searchEl()?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDetailOrGallery(event);
        return;
      }

      if (event.key !== 'Tab') return;
      const root = sheetEl();
      if (!root) return;
      const focusable = [
        ...root.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => !node.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    onCleanup(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
    });
  });

  return (
    <Portal>
      <Show when={props.open}>
        <div class={overlayStyle()} data-ytmd-plugin-gallery={true}>
          <div class={scrimStyle()} onClick={closeGallery} />
          <div
            aria-label={t('main.menu.plugins.label')}
            aria-modal="true"
            class={sheetStyle()}
            data-detail={Boolean(selected())}
            ref={setSheetEl}
            role="dialog"
          >
            <header class={headerStyle()}>
              <h1 class={titleStyle()}>
                <PhIcon name="squares-four" size={18} />
                {t('main.menu.plugins.label')}
              </h1>
              <label class={searchStyle()}>
                <PhIcon name="magnifying-glass" size={16} />
                <input
                  onInput={(event) => setQuery(event.currentTarget.value)}
                  placeholder={t('main.menu.plugins.search')}
                  ref={setSearchEl}
                  type="search"
                  value={query()}
                />
              </label>
              <button
                aria-label={t('main.menu.plugins.close')}
                class={closeStyle()}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onPointerDown={closeGallery}
                type="button"
              >
                <PhIcon name="x" size={16} />
              </button>
            </header>
            <div class={chipsStyle()}>
              <button
                class={chipStyle()}
                data-active={section() === 'all'}
                onClick={() => setSection('all')}
                type="button"
              >
                {sectionLabel('all')}
              </button>
              <For each={[...PLUGIN_SECTION_IDS]}>
                {(id) => (
                  <button
                    class={chipStyle()}
                    data-active={section() === id}
                    onClick={() => setSection(id)}
                    type="button"
                  >
                    {sectionLabel(id)}
                  </button>
                )}
              </For>
            </div>
            <div class={bodyStyle()}>
              <Show
                fallback={
                  <div class={emptyStyle()}>
                    <PhIcon name={asIconName('magnifying-glass')} size={28} />
                    {t('main.menu.plugins.empty')}
                  </div>
                }
                when={grouped().length > 0}
              >
                <For each={grouped()}>
                  {(group) => (
                    <section>
                      <h2 class={sectionTitleStyle()}>
                        {sectionLabel(group.id)}
                      </h2>
                      <div class={gridStyle()}>
                        <For each={group.plugins}>
                          {(plugin) => (
                            <PluginTile
                              onOpen={() => setSelectedId(plugin.id)}
                              onToggle={() => togglePlugin(plugin)}
                              plugin={plugin}
                              selected={selectedId() === plugin.id}
                            />
                          )}
                        </For>
                      </div>
                    </section>
                  )}
                </For>
              </Show>
            </div>
            <Show when={selected()}>
              {(plugin) => (
                <PluginDetail
                  onClick={props.onItemClick}
                  onClose={() => setSelectedId(null)}
                  plugin={plugin()}
                  restartNeeded={RESTART_NEEDED_PLUGIN_IDS.has(plugin().id)}
                />
              )}
            </Show>
          </div>
        </div>
      </Show>
    </Portal>
  );
};
