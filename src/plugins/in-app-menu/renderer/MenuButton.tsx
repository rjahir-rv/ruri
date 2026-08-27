import { type JSX, splitProps } from 'solid-js';
import { css } from 'solid-styled-components';

import { cacheNoArgs } from '@/providers/decorators';

const menuStyle = cacheNoArgs(
  () => css`
    -webkit-app-region: none;

    display: flex;
    justify-content: center;
    align-items: center;
    align-self: stretch;

    padding: 3px 10px;
    border-radius: var(--glassy-radius, 6px);

    cursor: pointer;
    color: var(--glassy-text-muted, #c5cad4);
    font-size: 12px;
    font-weight: 500;
    outline: none;
    user-select: none;
    transition:
      background-color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));

    &:hover {
      background-color: var(--glassy-hover, rgba(255, 255, 255, 0.1));
      color: var(--glassy-text, #f4f6fb);
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.16);
      transform: scale(0.97);
    }

    &[data-selected='true'] {
      background-color: var(--glassy-hover, rgba(255, 255, 255, 0.12));
      color: var(--glassy-text, #f4f6fb);
      box-shadow: var(
        --glassy-highlight,
        inset 0 1px 0 rgba(255, 255, 255, 0.14)
      );
    }

    &:focus-visible {
      outline: 2px solid rgba(244, 246, 251, 0.75);
      outline-offset: -2px;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
      transform: none !important;
    }
  `,
);

export type MenuButtonProps = JSX.HTMLAttributes<HTMLLIElement> & {
  text?: string;
  selected?: boolean;
};
export const MenuButton = (props: MenuButtonProps) => {
  const [local, leftProps] = splitProps(props, ['text', 'onClick']);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  };

  return (
    <li
      {...leftProps}
      class={menuStyle()}
      data-selected={props.selected}
      onClick={local.onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {local.text}
    </li>
  );
};
