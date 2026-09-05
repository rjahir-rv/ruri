export interface InAppMenuConfig {
  enabled: boolean;
  hideDOMWindowControls: boolean;
}

const isMacOS =
  (typeof window !== 'undefined' &&
    Boolean(window.navigator?.userAgent?.toLowerCase().includes('mac'))) ||
  (typeof global !== 'undefined' && global.process?.platform === 'darwin');

export const defaultInAppMenuConfig: InAppMenuConfig = {
  // Custom titlebar + plugin gallery. Off on macOS so native traffic lights stay.
  enabled: !isMacOS,
  hideDOMWindowControls: false,
};
