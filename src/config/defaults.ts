export interface WindowSizeConfig {
  width: number;
  height: number;
}

export interface WindowPositionConfig {
  x: number;
  y: number;
}

export const MIN_WINDOW_WIDTH = 1100;
export const MIN_WINDOW_HEIGHT = 620;

export function getWindowMinSize(disableMinSize: boolean): {
  minWidth: number;
  minHeight: number;
} {
  if (disableMinSize) {
    return { minWidth: 0, minHeight: 0 };
  }

  return { minWidth: MIN_WINDOW_WIDTH, minHeight: MIN_WINDOW_HEIGHT };
}

export interface DefaultConfig {
  'window-size': WindowSizeConfig;
  'window-maximized': boolean;
  'window-position': WindowPositionConfig;
  'url': string;
  'options': {
    language?: string;
    tray: boolean;
    appVisible: boolean;
    autoUpdates: boolean;
    alwaysOnTop: boolean;
    hideMenu: boolean;
    hideMenuWarned: boolean;
    startAtLogin: boolean;
    disableHardwareAcceleration: boolean;
    disableMinSize: boolean;
    removeUpgradeButton: boolean;
    restartOnConfigChanges: boolean;
    trayClickPlayPause: boolean;
    autoResetAppCache: boolean;
    resumeOnStart: boolean;
    likeButtons: string;
    swapLikeButtonsOrder: boolean;
    proxy: string;
    startingPage: string;
    overrideUserAgent: boolean;
    usePodcastParticipantAsArtist: boolean;
    themes: string[];
    customWindowTitle?: string;
  };
  'plugins': Record<string, unknown>;
}

export const defaultConfig: DefaultConfig = {
  'window-size': {
    width: MIN_WINDOW_WIDTH,
    height: MIN_WINDOW_HEIGHT,
  },
  'window-maximized': false,
  'window-position': {
    x: -1,
    y: -1,
  },
  'url': 'https://music.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com',
  'options': {
    tray: false,
    appVisible: true,
    autoUpdates: true,
    alwaysOnTop: false,
    hideMenu: false,
    hideMenuWarned: false,
    startAtLogin: false,
    disableHardwareAcceleration: false,
    disableMinSize: false,
    removeUpgradeButton: false,
    restartOnConfigChanges: false,
    trayClickPlayPause: false,
    autoResetAppCache: false,
    resumeOnStart: true,
    likeButtons: '',
    swapLikeButtonsOrder: false,
    proxy: '',
    startingPage: '',
    overrideUserAgent: false,
    usePodcastParticipantAsArtist: false,
    themes: [],
  },
  'plugins': {},
};
