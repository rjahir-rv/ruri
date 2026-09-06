import { createEffect, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { css } from 'solid-styled-components';

import { t } from '@/i18n';
import { cacheNoArgs } from '@/providers/decorators';

import packageJson from '../../../../package.json';
import { PhIcon } from '../gallery/icons';

const overlayStyle = cacheNoArgs(
  () => css`
    position: fixed;
    inset: 0;
    z-index: 10000020;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px calc(var(--ytmusic-player-bar-height, 72px) + 16px);
    box-sizing: border-box;
    -webkit-app-region: no-drag;
  `,
);

const scrimStyle = cacheNoArgs(
  () => css`
    position: absolute;
    inset: 0;
    background: rgba(4, 4, 8, 0.45);
    -webkit-app-region: no-drag;
  `,
);

const cardStyle = cacheNoArgs(
  () => css`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: min(420px, 100%);
    box-sizing: border-box;
    padding: 24px 24px 20px;
    -webkit-app-region: no-drag;
    border-radius: var(--glassy-radius-lg, 18px);
    border: var(--glassy-border, 1px solid rgba(255, 255, 255, 0.12));
    box-shadow:
      var(--glassy-shadow, 0 16px 36px rgba(0, 0, 0, 0.4)),
      var(--glassy-highlight, inset 0 1px 0 rgba(255, 255, 255, 0.14));
    background:
      linear-gradient(
        var(--glassy-search-scrim, rgba(8, 8, 12, 0.42)),
        var(--glassy-search-scrim, rgba(8, 8, 12, 0.42))
      ),
      var(
        --glassy-search-panel,
        rgba(var(--ytmusic-album-color-dark, 12, 12, 16), 0.92)
      );
    backdrop-filter: blur(var(--glassy-search-blur, 32px))
      saturate(var(--glassy-saturate, 140%));
    -webkit-backdrop-filter: blur(var(--glassy-search-blur, 32px))
      saturate(var(--glassy-saturate, 140%));
    color: var(--glassy-text, #f4f6fb);

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

const closeButtonStyle = cacheNoArgs(
  () => css`
    position: absolute;
    top: 14px;
    right: 14px;
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
    transition:
      background 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));

    &:hover {
      background: var(--glassy-hover, rgba(255, 255, 255, 0.14));
      color: var(--glassy-text, #f4f6fb);
    }

    &:focus-visible {
      outline: 2px solid rgba(244, 246, 251, 0.75);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
);

const iconWrapperStyle = cacheNoArgs(
  () => css`
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: #070d1a;
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    margin-bottom: 12px;
    overflow: hidden;

    & svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `,
);

const titleStyle = cacheNoArgs(
  () => css`
    margin: 0;
    font-size: 20px;
    font-weight: 650;
    letter-spacing: -0.015em;
    color: var(--glassy-text, #f4f6fb);
  `,
);

const versionBadgeStyle = cacheNoArgs(
  () => css`
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    margin-top: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--glassy-text-muted, #c5cad4);
    font-size: 11.5px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  `,
);

const descriptionStyle = cacheNoArgs(
  () => css`
    margin: 14px 0 16px;
    padding: 0 6px;
    font-size: 13.5px;
    line-height: 1.55;
    color: rgba(244, 246, 251, 0.8);
    letter-spacing: 0.005em;
  `,
);

const dividerStyle = cacheNoArgs(
  () => css`
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin-bottom: 14px;
  `,
);

const metaRowStyle = cacheNoArgs(
  () => css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  `,
);

const metaChipStyle = cacheNoArgs(
  () => css`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: var(--glassy-text-muted, #c5cad4);
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    outline: none;
    transition:
      background 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
      border-color 150ms var(--glassy-ease, cubic-bezier(0.2, 0.8, 0.2, 1));

    &[data-clickable='true'] {
      cursor: pointer;

      &:hover {
        background: var(--glassy-hover, rgba(255, 255, 255, 0.12));
        color: var(--glassy-text, #f4f6fb);
        border-color: rgba(255, 255, 255, 0.2);
      }

      &:focus-visible {
        outline: 2px solid rgba(244, 246, 251, 0.75);
        outline-offset: 2px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
);

const disclaimerStyle = cacheNoArgs(
  () => css`
    margin: 0;
    font-size: 11px;
    line-height: 1.4;
    color: rgba(244, 246, 251, 0.42);
    letter-spacing: 0.01em;
  `,
);

export type AboutModalProps = {
  open: boolean;
  onClose: () => void;
};

export const AboutModal = (props: AboutModalProps) => {
  createEffect(() => {
    if (!props.open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        props.onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    onCleanup(() => window.removeEventListener('keydown', onKeyDown));
  });

  const handleOpenGitHub = () => {
    const url = 'https://github.com/rjahir-rv/ruri';
    window.ipcRenderer.invoke('peard:open-external', url).catch(console.error);
  };

  return (
    <Show when={props.open}>
      <Portal>
        <div class={overlayStyle()} role="presentation">
          <div
            aria-hidden="true"
            class={scrimStyle()}
            onClick={() => props.onClose()}
          />
          <section
            aria-labelledby="about-app-title"
            aria-modal="true"
            class={cardStyle()}
            role="dialog"
          >
            <button
              aria-label={t('main.about.close')}
              class={closeButtonStyle()}
              onClick={() => props.onClose()}
              type="button"
            >
              <PhIcon name="x" size={14} />
            </button>

            <div class={iconWrapperStyle()}>
              <svg
                fill="none"
                height="64"
                viewBox="0 0 1024 1024"
                width="64"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect fill="#070D1A" height="1024" width="1024" />
                <g
                  id="fusion-mark"
                  transform="translate(512 512) scale(1.2) translate(-512 -512)"
                >
                  <g filter="url(#gemstone-filter)" id="gemstone-sphere">
                    <path
                      d="M650.88 825.472C771.411 825.472 869.12 727.763 869.12 607.232C869.12 486.701 771.411 388.992 650.88 388.992C530.35 388.992 432.64 486.701 432.64 607.232C432.64 727.763 530.35 825.472 650.88 825.472Z"
                      fill="url(#gemstone-gradient)"
                    />
                  </g>
                  <ellipse
                    cx="509.589"
                    cy="433.418"
                    fill="white"
                    opacity="0.3"
                    rx="47.616"
                    ry="23.808"
                    transform="rotate(-30 509.589 433.418)"
                  />
                  <g id="kanji-accent">
                    <g filter="url(#kanji-filter)" id="kanji-hero">
                      <path
                        d="M170.736 343.278H310.013V388.275H170.736V343.278ZM174.593 464.985H302.299V510.41H174.593V464.985ZM163.88 606.404C181.593 602.976 203.306 598.262 229.018 592.262C255.017 586.263 281.443 580.12 308.299 573.835L313.013 613.689C288.729 621.403 264.445 628.974 240.16 636.402C215.876 643.545 193.592 649.973 173.308 655.687L163.88 606.404ZM316.013 353.992H566.711V397.275H316.013V353.992ZM408.578 308.138H459.575V375.848H408.578V308.138ZM403.436 521.124H448.433V689.97H403.436V521.124ZM337.011 515.124H381.58V566.55C381.58 578.835 380.723 591.405 379.009 604.262C377.294 617.118 373.866 629.974 368.724 642.83C363.581 655.401 356.01 667.543 346.011 679.257C336.011 690.97 322.727 701.541 306.156 710.969C304.156 707.541 301.299 703.684 297.585 699.398C293.871 695.113 290.014 690.827 286.015 686.542C282.015 682.257 278.301 678.828 274.872 676.257C288.872 668.543 299.871 660.258 307.87 651.401C316.156 642.259 322.298 632.831 326.298 623.117C330.583 613.118 333.44 603.262 334.869 593.548C336.297 583.834 337.011 574.406 337.011 565.264V515.124ZM387.58 380.133L436.862 397.703C431.72 407.703 426.434 417.988 421.006 428.558C415.863 438.844 410.721 448.7 405.578 458.128C400.436 467.27 395.579 475.555 391.008 482.984L351.582 467.127C355.867 459.128 360.296 450.129 364.867 440.129C369.438 429.844 373.723 419.559 377.723 409.274C382.008 398.703 385.294 388.99 387.58 380.133ZM463.432 422.559L500.287 403.274C509.715 411.845 519.285 421.559 528.999 432.415C538.713 443.272 547.569 453.985 555.569 464.556C563.854 475.127 570.425 484.983 575.282 494.126L534.999 516.41C530.999 507.553 524.999 497.697 517 486.84C509.286 475.984 500.715 464.985 491.287 453.843C482.145 442.415 472.86 431.987 463.432 422.559ZM313.441 452.128C331.44 451.843 352.296 451.557 376.009 451.271C400.007 450.986 425.291 450.557 451.861 449.986C478.717 449.414 505.572 448.843 532.427 448.272L531.142 489.84C505.715 491.269 480.145 492.554 454.432 493.697C428.72 494.84 404.15 495.84 380.723 496.697C357.581 497.554 336.44 498.411 317.298 499.268L313.441 452.128ZM217.448 361.706H263.73V612.832L217.448 620.546V361.706ZM472.86 515.981H518.714V652.687C518.714 660.115 519 664.401 519.571 665.543C520.714 666.972 522.285 667.686 524.285 667.686C524.856 667.686 525.856 667.686 527.285 667.686C528.713 667.686 529.999 667.686 531.142 667.686C531.999 667.686 532.856 667.543 533.713 667.257C534.856 666.972 535.57 666.543 535.856 665.972C537.284 664.829 538.427 660.972 539.284 654.401C539.855 650.973 540.141 645.402 540.141 637.688C540.427 629.974 540.713 621.118 540.998 611.118C545.284 615.118 551.14 619.118 558.569 623.117C565.997 626.831 572.71 629.688 578.71 631.688C578.139 641.402 577.282 651.116 576.139 660.829C575.282 670.543 574.282 677.685 573.139 682.257C569.996 691.684 564.854 698.255 557.711 701.97C554.855 703.684 551.283 704.969 546.998 705.826C542.712 706.684 538.57 707.112 534.57 707.112C531.142 707.112 527.285 707.112 522.999 707.112C518.714 707.112 514.857 707.112 511.429 707.112C506.572 707.112 501.572 706.255 496.43 704.541C491.287 702.827 486.859 700.113 483.145 696.398C479.716 692.97 477.145 688.113 475.431 681.828C473.717 675.828 472.86 665.4 472.86 650.544V515.981Z"
                        fill="white"
                      />
                    </g>
                  </g>
                </g>
                <defs>
                  <filter
                    color-interpolation-filters="sRGB"
                    filterUnits="userSpaceOnUse"
                    height="563.456"
                    id="gemstone-filter"
                    width="563.456"
                    x="369.152"
                    y="357.248"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      result="hardAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    />
                    <feOffset dy="31.744" />
                    <feGaussianBlur stdDeviation="31.744" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.117647 0 0 0 0 0.345098 0 0 0 0 0.580392 0 0 0 0.25098 0"
                    />
                    <feBlend
                      in2="BackgroundImageFix"
                      mode="normal"
                      result="effect1_dropShadow"
                    />
                    <feBlend
                      in="SourceGraphic"
                      in2="effect1_dropShadow"
                      mode="normal"
                      result="shape"
                    />
                  </filter>
                  <filter
                    color-interpolation-filters="sRGB"
                    filterUnits="userSpaceOnUse"
                    height="498.063"
                    id="kanji-filter"
                    width="510.063"
                    x="132.136"
                    y="292.266"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      result="hardAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    />
                    <feOffset dx="15.872" dy="31.744" />
                    <feGaussianBlur stdDeviation="23.808" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.501961 0"
                    />
                    <feBlend
                      in2="BackgroundImageFix"
                      mode="normal"
                      result="effect1_dropShadow"
                    />
                    <feBlend
                      in="SourceGraphic"
                      in2="effect1_dropShadow"
                      mode="normal"
                      result="shape"
                    />
                  </filter>
                  <radialGradient
                    cx="0"
                    cy="0"
                    gradientTransform="translate(563.584 519.936) rotate(90) scale(283.712 261.888)"
                    gradientUnits="userSpaceOnUse"
                    id="gemstone-gradient"
                    r="1"
                  >
                    <stop stop-color="#9CE1FF" />
                    <stop offset="0.4" stop-color="#26619C" />
                    <stop offset="1" stop-color="#102342" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            <h2 class={titleStyle()} id="about-app-title">
              {packageJson.productName ?? 'Ruri'}
            </h2>

            <span class={versionBadgeStyle()}>v{packageJson.version}</span>

            <p class={descriptionStyle()}>{t('main.about.description')}</p>

            <div class={dividerStyle()} />

            <div class={metaRowStyle()}>
              <span class={metaChipStyle()}>
                <PhIcon name="shield-check" size={13} />
                {t('main.about.license')}
              </span>
              <button
                class={metaChipStyle()}
                data-clickable="true"
                onClick={handleOpenGitHub}
                type="button"
              >
                <PhIcon name="compass" size={13} />
                {t('main.about.github')}
              </button>
            </div>

            <p class={disclaimerStyle()}>{t('main.about.disclaimer')}</p>
          </section>
        </div>
      </Portal>
    </Show>
  );
};
