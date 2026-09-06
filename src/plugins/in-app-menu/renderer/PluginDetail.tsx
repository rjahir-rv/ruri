import { type MenuItem } from 'electron';
import { Show } from 'solid-js';
import { css } from 'solid-styled-components';

import { t } from '@/i18n';
import { cacheNoArgs } from '@/providers/decorators';

import { PanelRenderer } from './PanelRenderer';

import { FALLBACK_PLUGIN_ICON } from '../gallery/catalog';
import { PhIcon, type PhIconName } from '../gallery/icons';

import type { GalleryPlugin } from '../gallery/parse';

const detailStyle = cacheNoArgs(
  () => css`
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    border-left: var(--glassy-border, 1px solid rgba(255, 255, 255, 0.12));
    background: rgba(8, 8, 12, 0.22);
  `,
);

const headerStyle = cacheNoArgs(
  () => css`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 16px 16px 12px;
  `,
);

const titleStyle = cacheNoArgs(
  () => css`
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--glassy-text, #f4f6fb);
    line-height: 1.3;
  `,
);

const closeStyle = cacheNoArgs(
  () => css`
    -webkit-app-region: no-drag;
    width: 28px;
    height: 28px;
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
    padding: 0 12px 16px;
    overflow: auto;
    min-height: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  `,
);

const descriptionStyle = cacheNoArgs(
  () => css`
    margin: 0 4px 12px;
    font-size: 12px;
    line-height: 1.45;
    color: var(--glassy-text-muted, #c5cad4);
  `,
);

const restartStyle = cacheNoArgs(
  () => css`
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 4px 12px;
    padding: 6px 8px;
    border-radius: 8px;
    background: rgba(255, 196, 72, 0.12);
    color: #f3d48a;
    font-size: 11px;
    font-weight: 560;
  `,
);

const asIconName = (icon: string): PhIconName => {
  return (icon || FALLBACK_PLUGIN_ICON) as PhIconName;
};

export type PluginDetailProps = {
  plugin: GalleryPlugin;
  restartNeeded?: boolean;
  onClose: () => void;
  onClick?: (commandId: number, radioGroup?: MenuItem[]) => void;
};

export const PluginDetail = (props: PluginDetailProps) => {
  return (
    <aside class={detailStyle()}>
      <header class={headerStyle()}>
        <PhIcon name={asIconName(props.plugin.icon)} size={22} />
        <h2 class={titleStyle()}>{props.plugin.name}</h2>
        <button
          aria-label={t('main.menu.plugins.close')}
          class={closeStyle()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.stopPropagation();
            props.onClose();
          }}
          type="button"
        >
          <PhIcon name="x" size={14} />
        </button>
      </header>
      <div class={bodyStyle()}>
        <Show when={props.plugin.description}>
          <p class={descriptionStyle()}>{props.plugin.description}</p>
        </Show>
        <Show when={props.restartNeeded}>
          <div class={restartStyle()}>
            <PhIcon name="warning" size={14} />
            {t('main.menu.plugins.restart-needed')}
          </div>
        </Show>
        <Show when={props.plugin.settingsItems.length > 0}>
          <PanelRenderer
            items={props.plugin.settingsItems}
            onClick={props.onClick}
          />
        </Show>
      </div>
    </aside>
  );
};
