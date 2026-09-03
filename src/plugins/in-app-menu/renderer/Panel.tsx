import {
  autoUpdate,
  flip,
  offset,
  type OffsetOptions,
  size,
} from '@floating-ui/dom';
import { useFloating } from 'solid-floating-ui';
import { createSignal, type JSX, Show, splitProps, mergeProps } from 'solid-js';
import { Portal } from 'solid-js/web';
import { css } from 'solid-styled-components';
import { Transition } from 'solid-transition-group';

import { cacheNoArgs } from '@/providers/decorators';

const panelStyle = cacheNoArgs(
  () => css`
    position: fixed;
    top: var(--offset-y, 0);
    left: var(--offset-x, 0);

    max-width: var(--max-width, 100%);
    max-height: var(--max-height, 100%);

    z-index: 10000020;
    -webkit-app-region: no-drag;
    width: fit-content;
    height: fit-content;
    min-width: 220px;

    padding: 6px;
    box-sizing: border-box;
    border-radius: var(--glassy-radius-lg, 16px);
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

    background:
      linear-gradient(
        var(--glassy-search-scrim, rgba(8, 8, 12, 0.42)),
        var(--glassy-search-scrim, rgba(8, 8, 12, 0.42))
      ),
      var(
        --glassy-search-panel,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.9)
      );
    border: var(--glassy-border, 1px solid rgba(255, 255, 255, 0.12));
    box-shadow:
      var(--glassy-shadow, 0 10px 28px rgba(0, 0, 0, 0.35)),
      var(--glassy-highlight, inset 0 1px 0 rgba(255, 255, 255, 0.14));
    backdrop-filter: blur(var(--glassy-search-blur, 32px))
      saturate(var(--glassy-saturate, 140%));
    -webkit-backdrop-filter: blur(var(--glassy-search-blur, 32px))
      saturate(var(--glassy-saturate, 140%));

    transform-origin: var(--origin-x, 50%) var(--origin-y, 50%);

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    html[data-glassy-quality='low'] & {
      background: var(
        --glassy-search-panel,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.95)
      );
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    @supports not (
      (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
    ) {
      background: var(
        --glassy-search-panel,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.95)
      );
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  `,
);

const animationStyle = cacheNoArgs(() => ({
  enter: css`
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  `,
  enterActive: css`
    transition:
      opacity 180ms var(--glassy-appear, cubic-bezier(0.22, 1, 0.36, 1)),
      transform 180ms var(--glassy-appear, cubic-bezier(0.22, 1, 0.36, 1));

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
    }
  `,
  exitTo: css`
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  `,
  exitActive: css`
    transition:
      opacity 140ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      transform 140ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
    }
  `,
}));

export type Placement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'right-start'
  | 'right-end'
  | 'left-start'
  | 'left-end';
export type PanelProps = JSX.HTMLAttributes<HTMLUListElement> & {
  open?: boolean;
  anchor?: HTMLElement | null;
  children: JSX.Element;

  placement?: Placement;
  offset?: OffsetOptions;
};
export const Panel = (props: PanelProps) => {
  const [elements, local, leftProps] = splitProps(
    mergeProps({ placement: 'bottom' }, props),
    ['anchor', 'children'],
    ['open', 'placement', 'offset'],
  );

  const [panel, setPanel] = createSignal<HTMLElement | null>(null);

  const position = useFloating(() => elements.anchor, panel, {
    whileElementsMounted: autoUpdate,
    placement: local.placement as Placement,
    strategy: 'fixed',
    middleware: [
      offset(local.offset),
      size({
        padding: 8,
        apply({ elements, availableWidth, availableHeight }) {
          elements.floating.style.setProperty(
            '--max-width',
            `${Math.max(200, availableWidth)}px`,
          );
          elements.floating.style.setProperty(
            '--max-height',
            `${Math.max(200, availableHeight)}px`,
          );
        },
      }),
      flip({ fallbackStrategy: 'initialPlacement' }),
    ],
  });

  const originX = () => {
    if (position.placement.includes('left')) return '100%';
    if (position.placement.includes('right')) return '0';
    if (
      position.placement.includes('top') ||
      position.placement.includes('bottom')
    ) {
      if (position.placement.includes('start')) return '0';
      if (position.placement.includes('end')) return '100%';
    }

    return '50%';
  };
  const originY = () => {
    if (position.placement.includes('top')) return '100%';
    if (position.placement.includes('bottom')) return '0';
    if (
      position.placement.includes('left') ||
      position.placement.includes('right')
    ) {
      if (position.placement.includes('start')) return '0';
      if (position.placement.includes('end')) return '100%';
    }
    return '50%';
  };

  return (
    <Portal>
      <Transition
        appear
        enterActiveClass={animationStyle().enterActive}
        enterClass={animationStyle().enter}
        exitActiveClass={animationStyle().exitActive}
        exitToClass={animationStyle().exitTo}
      >
        <Show when={local.open}>
          <ul
            {...leftProps}
            class={panelStyle()}
            data-ytmd-sub-panel={true}
            ref={setPanel}
            style={{
              '--offset-x': `${position.x}px`,
              '--offset-y': `${position.y}px`,
              '--origin-x': originX(),
              '--origin-y': originY(),
            }}
          >
            {elements.children}
          </ul>
        </Show>
      </Transition>
    </Portal>
  );
};
