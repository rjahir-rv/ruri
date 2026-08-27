import { type JSX } from 'solid-js';
import { css } from 'solid-styled-components';

import { cacheNoArgs } from '@/providers/decorators';

const iconButton = cacheNoArgs(
  () => css`
    -webkit-app-region: none;
    background: transparent;

    width: 26px;
    height: 26px;

    padding: 4px;
    border-radius: var(--glassy-radius, 6px);

    display: flex;
    justify-content: center;
    align-items: center;

    color: var(--glassy-text-muted, #c5cad4);
    outline: none;
    border: none;
    cursor: pointer;

    transition:
      background-color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));

    &:hover {
      background-color: var(--glassy-hover, rgba(255, 255, 255, 0.1));
      color: var(--glassy-text, #f4f6fb);
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.16);
      transform: scale(0.95);
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

type CollapseIconButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;
export const IconButton = (props: CollapseIconButtonProps) => {
  return (
    <button {...props} class={iconButton()}>
      {props.children}
    </button>
  );
};
