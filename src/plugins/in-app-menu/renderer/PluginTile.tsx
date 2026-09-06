import { Show } from 'solid-js';
import { css } from 'solid-styled-components';

import { t } from '@/i18n';
import { cacheNoArgs } from '@/providers/decorators';

import { FALLBACK_PLUGIN_ICON } from '../gallery/catalog';
import { PhIcon, type PhIconName } from '../gallery/icons';

import type { GalleryPlugin } from '../gallery/parse';

const tileStyle = cacheNoArgs(
  () => css`
    -webkit-app-region: none;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    min-height: 132px;
    padding: 12px;
    border: var(--glassy-border, 1px solid rgba(255, 255, 255, 0.12));
    border-radius: var(--glassy-radius, 14px);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: var(
      --glassy-highlight,
      inset 0 1px 0 rgba(255, 255, 255, 0.14)
    );
    color: var(--glassy-text, #f4f6fb);
    cursor: pointer;
    text-align: left;
    outline: none;
    transition:
      background-color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      border-color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      transform 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));

    &:hover {
      background: var(--glassy-hover, rgba(255, 255, 255, 0.1));
    }

    &:active {
      transform: scale(0.98);
    }

    &[data-enabled='true'] {
      background: rgba(var(--ytmusic-album-color, 180, 180, 200), 0.22);
      border-color: rgba(255, 255, 255, 0.2);
    }

    &[data-selected='true'] {
      outline: 2px solid rgba(244, 246, 251, 0.55);
      outline-offset: 1px;
    }

    &:focus-visible {
      outline: 2px solid rgba(244, 246, 251, 0.75);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
      transform: none !important;
    }
  `,
);

const iconWrapStyle = cacheNoArgs(
  () => css`
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: var(--glassy-text, #f4f6fb);
    flex-shrink: 0;
  `,
);

const nameStyle = cacheNoArgs(
  () => css`
    font-size: 12.5px;
    font-weight: 560;
    line-height: 1.25;
    letter-spacing: 0.01em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.5em;
  `,
);

const footerStyle = cacheNoArgs(
  () => css`
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
);

const chipStyle = cacheNoArgs(
  () => css`
    display: inline-flex;
    align-items: center;
    height: 16px;
    padding: 0 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: var(--glassy-text, #f4f6fb);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  `,
);

const switchStyle = cacheNoArgs(
  () => css`
    -webkit-app-region: none;
    position: relative;
    width: 36px;
    height: 20px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    cursor: pointer;
    flex-shrink: 0;
    outline: none;
    transition:
      background-color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      border-color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #f4f6fb;
      transition: transform 150ms
        var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));
    }

    &[data-on='true'] {
      background: rgba(var(--ytmusic-album-color, 180, 180, 200), 0.7);
      border-color: rgba(255, 255, 255, 0.28);
    }

    &[data-on='true']::after {
      transform: translateX(16px);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid rgba(244, 246, 251, 0.75);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
      &::after {
        transition: none !important;
      }
    }
  `,
);

const asIconName = (icon: string): PhIconName => {
  return (icon || FALLBACK_PLUGIN_ICON) as PhIconName;
};

export type PluginTileProps = {
  plugin: GalleryPlugin;
  selected?: boolean;
  onOpen: () => void;
  onToggle: () => void;
};

export const PluginTile = (props: PluginTileProps) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      props.onOpen();
    }
    if (event.key === ' ' && !props.plugin.locked) {
      event.preventDefault();
      props.onToggle();
    }
  };

  return (
    <div
      aria-pressed={props.plugin.enabled}
      class={tileStyle()}
      data-enabled={props.plugin.enabled}
      data-plugin-id={props.plugin.id}
      data-selected={props.selected}
      onClick={() => props.onOpen()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div class={iconWrapStyle()}>
        <PhIcon name={asIconName(props.plugin.icon)} size={22} />
      </div>
      <span class={nameStyle()}>{props.plugin.name}</span>
      <div class={footerStyle()}>
        <Show fallback={<span />} when={props.plugin.isNew}>
          <span class={chipStyle()}>{t('main.menu.plugins.new')}</span>
        </Show>
        <button
          aria-checked={props.plugin.enabled}
          aria-disabled={props.plugin.locked}
          aria-label={
            props.plugin.locked
              ? t('main.menu.plugins.locked')
              : t('main.menu.plugins.enabled')
          }
          class={switchStyle()}
          data-on={props.plugin.enabled}
          disabled={props.plugin.locked}
          onClick={(event) => {
            event.stopPropagation();
            if (!props.plugin.locked) props.onToggle();
          }}
          role="switch"
          type="button"
        />
      </div>
    </div>
  );
};
