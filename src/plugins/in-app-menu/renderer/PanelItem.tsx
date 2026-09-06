import { autoUpdate, offset, size } from '@floating-ui/dom';
import { useFloating } from 'solid-floating-ui';
import { createSignal, Match, Show, Switch } from 'solid-js';
import { type JSX } from 'solid-js/jsx-runtime';
import { Portal } from 'solid-js/web';
import { css } from 'solid-styled-components';
import { Transition } from 'solid-transition-group';

import { cacheNoArgs } from '@/providers/decorators';

import { Panel } from './Panel';

const itemStyle = cacheNoArgs(
  () => css`
    position: relative;
    -webkit-app-region: none;
    min-height: 34px;
    height: auto;
    padding: 6px 8px;

    display: grid;
    grid-template-columns: 24px 1fr auto auto;
    align-items: center;
    gap: 8px;

    border-radius: var(--glassy-radius, 8px);
    cursor: pointer;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-drag: none;
    outline: none;

    color: var(--glassy-text, #f4f6fb);
    transition:
      background-color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      opacity 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));

    &:hover:not([data-disabled='true']) {
      background-color: var(--glassy-hover, rgba(255, 255, 255, 0.1));
    }

    &:active:not([data-disabled='true']) {
      background-color: rgba(255, 255, 255, 0.16);
    }

    &[data-selected='true'] {
      background-color: var(--glassy-hover, rgba(255, 255, 255, 0.1));
    }

    &[data-disabled='true'] {
      opacity: 0.42;
      cursor: not-allowed;
      pointer-events: none;
    }

    &:focus-visible {
      outline: 2px solid rgba(244, 246, 251, 0.75);
      outline-offset: -2px;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
    }

    & * {
      box-sizing: border-box;
    }
  `,
);

const itemIconStyle = cacheNoArgs(
  () => css`
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--glassy-text, #f4f6fb);
    flex-shrink: 0;
  `,
);

const itemLabelStyle = cacheNoArgs(
  () => css`
    font-size: 13px;
    font-weight: 450;
    color: var(--glassy-text, #f4f6fb);
    letter-spacing: 0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
);

const itemChipStyle = cacheNoArgs(
  () => css`
    display: inline-flex;
    justify-content: center;
    align-items: center;

    min-width: 18px;
    height: 18px;
    padding: 0 6px;
    margin-left: 6px;

    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: var(--glassy-text, #f4f6fb);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 1;
    text-transform: uppercase;
  `,
);

const toolTipStyle = cacheNoArgs(
  () => css`
    min-width: 48px;
    max-width: 260px;
    padding: 6px 10px;

    border-radius: var(--glassy-radius, 8px);
    background: rgba(12, 12, 16, 0.92);
    border: var(--glassy-border, 1px solid rgba(255, 255, 255, 0.12));
    box-shadow: var(--glassy-shadow, 0 10px 28px rgba(0, 0, 0, 0.35));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    color: var(--glassy-text, #f4f6fb);
    font-size: 11px;
    line-height: 1.4;
    word-break: break-word;
    pointer-events: none;
  `,
);

const popupStyle = cacheNoArgs(
  () => css`
    position: fixed;
    top: var(--offset-y, 0);
    left: var(--offset-x, 0);

    max-width: var(--max-width, 100%);
    max-height: var(--max-height, 100%);

    z-index: 100000000;
    pointer-events: none;
  `,
);

const animationStyle = cacheNoArgs(() => ({
  enter: css`
    opacity: 0;
    transform: scale(0.95);
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
    transform: scale(0.95);
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

const getParents = (element: Element | null): (HTMLElement | null)[] => {
  const parents: (HTMLElement | null)[] = [];
  let now = element;

  while (now) {
    parents.push(now as HTMLElement | null);
    now = now.parentElement;
  }

  return parents;
};

type BasePanelItemProps = {
  name: string;
  label?: string;
  chip?: string;
  toolTip?: string;
  commandId?: number;
  disabled?: boolean;
};
type NormalPanelItemProps = BasePanelItemProps & {
  type: 'normal';
  onClick?: () => void;
};
type SubmenuItemProps = BasePanelItemProps & {
  type: 'submenu';
  level: number[];
  children: JSX.Element;
};
type RadioPanelItemProps = BasePanelItemProps & {
  type: 'radio';
  checked: boolean;
  onChange?: (checked: boolean) => void;
};
type CheckboxPanelItemProps = BasePanelItemProps & {
  type: 'checkbox';
  checked: boolean;
  onChange?: (checked: boolean) => void;
};
export type PanelItemProps =
  | NormalPanelItemProps
  | SubmenuItemProps
  | RadioPanelItemProps
  | CheckboxPanelItemProps;
export const PanelItem = (props: PanelItemProps) => {
  const [open, setOpen] = createSignal(false);
  const [toolTipOpen, setToolTipOpen] = createSignal(false);
  const [toolTip, setToolTip] = createSignal<HTMLElement | null>(null);
  const [anchor, setAnchor] = createSignal<HTMLElement | null>(null);
  const [child, setChild] = createSignal<HTMLElement | null>(null);

  const position = useFloating(anchor, toolTip, {
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset({ mainAxis: 8 }),
      size({
        apply({ rects, elements }) {
          elements.floating.style.setProperty(
            '--max-width',
            `${rects.reference.width}px`,
          );
        },
      }),
    ],
  });

  const handleHover = (event: MouseEvent) => {
    if (props.disabled) return;
    setToolTipOpen(true);
    event.target?.addEventListener(
      'mouseleave',
      () => {
        setToolTipOpen(false);
      },
      { once: true },
    );

    if (props.type === 'submenu') {
      const timer = setTimeout(() => {
        setOpen(true);

        let mouseX = event.clientX;
        let mouseY = event.clientY;
        const onMouseMove = (event: MouseEvent) => {
          mouseX = event.clientX;
          mouseY = event.clientY;
        };
        document.addEventListener('mousemove', onMouseMove);

        event.target?.addEventListener(
          'mouseleave',
          () => {
            setTimeout(() => {
              document.removeEventListener('mousemove', onMouseMove);
              const parents = getParents(
                document.elementFromPoint(mouseX, mouseY),
              );

              if (!parents.includes(child())) {
                setOpen(false);
              } else {
                const onOtherHover = (event: MouseEvent) => {
                  const parents = getParents(event.target as HTMLElement);
                  const closestLevel =
                    parents.find((it) => it?.dataset?.level)?.dataset.level ??
                    '';
                  const path = event.composedPath();

                  const isOtherItem = path.some(
                    (it) =>
                      it instanceof HTMLElement &&
                      it.classList.contains(itemStyle()),
                  );
                  const isChild = closestLevel.startsWith(
                    props.level.join('/'),
                  );

                  if (isOtherItem && !isChild) {
                    setOpen(false);
                    document.removeEventListener('mousemove', onOtherHover);
                  }
                };
                document.addEventListener('mousemove', onOtherHover);
              }
            }, 225);
          },
          { once: true },
        );
      }, 225);

      event.target?.addEventListener(
        'mouseleave',
        () => {
          clearTimeout(timer);
        },
        { once: true },
      );
    }
  };

  const handleClick = async () => {
    if (props.disabled) return;
    await window.ipcRenderer.invoke('peard:menu-event', props.commandId);
    if (props.type === 'radio') {
      props.onChange?.(!props.checked);
    } else if (props.type === 'checkbox') {
      props.onChange?.(!props.checked);
    } else if (props.type === 'normal') {
      props.onClick?.();
    } else if (props.type === 'submenu') {
      setOpen(!open());
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <li
      aria-disabled={props.disabled}
      class={itemStyle()}
      data-disabled={props.disabled}
      data-selected={open()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleHover}
      ref={setAnchor}
      role="menuitem"
      tabIndex={props.disabled ? -1 : 0}
    >
      <Switch fallback={<div class={itemIconStyle()} />}>
        <Match when={props.type === 'checkbox'}>
          <Show
            fallback={
              <svg
                class={itemIconStyle()}
                fill="none"
                height={18}
                viewBox="0 0 24 24"
                width={18}
              >
                <rect
                  fill="rgba(255, 255, 255, 0.05)"
                  height="18"
                  rx="4"
                  stroke="rgba(255, 255, 255, 0.25)"
                  stroke-width="1.5"
                  width="18"
                  x="3"
                  y="3"
                />
              </svg>
            }
            when={props.type === 'checkbox' && props.checked}
          >
            <svg
              class={itemIconStyle()}
              fill="none"
              height={18}
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
              width={18}
            >
              <rect
                fill="rgba(255, 255, 255, 0.16)"
                height="18"
                rx="4"
                stroke="rgba(255, 255, 255, 0.4)"
                stroke-width="1.5"
                width="18"
                x="3"
                y="3"
              />
              <polyline
                points="7 12.5 10.5 16 17 8.5"
                stroke="var(--glassy-text, #f4f6fb)"
                stroke-width="2.2"
              />
            </svg>
          </Show>
        </Match>
        <Match when={props.type === 'radio'}>
          <Show
            fallback={
              <svg
                class={itemIconStyle()}
                fill="none"
                height={18}
                viewBox="0 0 24 24"
                width={18}
              >
                <circle
                  cx="12"
                  cy="12"
                  fill="rgba(255, 255, 255, 0.05)"
                  r="9"
                  stroke="rgba(255, 255, 255, 0.25)"
                  stroke-width="1.5"
                />
              </svg>
            }
            when={props.type === 'radio' && props.checked}
          >
            <svg
              class={itemIconStyle()}
              fill="none"
              height={18}
              viewBox="0 0 24 24"
              width={18}
            >
              <circle
                cx="12"
                cy="12"
                fill="rgba(255, 255, 255, 0.16)"
                r="9"
                stroke="rgba(255, 255, 255, 0.4)"
                stroke-width="1.5"
              />
              <circle
                cx="12"
                cy="12"
                fill="var(--glassy-text, #f4f6fb)"
                r="4.5"
              />
            </svg>
          </Show>
        </Match>
      </Switch>
      <span class={itemLabelStyle()}>{props.name}</span>
      <Show fallback={<div />} when={props.chip}>
        <span class={itemChipStyle()}>{props.chip}</span>
      </Show>
      <Show fallback={<div />} when={props.type === 'submenu'}>
        <svg
          class={itemIconStyle()}
          fill="none"
          height={16}
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          style={{ color: 'var(--glassy-text-muted, #c5cad4)' }}
          viewBox="0 0 24 24"
          width={16}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <Panel
          anchor={anchor()}
          data-level={props.type === 'submenu' && props.level.join('/')}
          offset={{ mainAxis: 8 }}
          open={open()}
          placement={'right-start'}
          ref={setChild}
        >
          {props.type === 'submenu' && props.children}
        </Panel>
      </Show>
      <Show when={props.toolTip}>
        <Portal>
          <div
            class={popupStyle()}
            ref={setToolTip}
            style={{
              '--offset-x': `${position.x}px`,
              '--offset-y': `${position.y}px`,
            }}
          >
            <Transition
              appear
              enterActiveClass={animationStyle().enterActive}
              enterClass={animationStyle().enter}
              exitActiveClass={animationStyle().exitActive}
              exitToClass={animationStyle().exitTo}
            >
              <Show when={toolTipOpen()}>
                <div class={toolTipStyle()}>{props.toolTip}</div>
              </Show>
            </Transition>
          </div>
        </Portal>
      </Show>
    </li>
  );
};
