import path from 'node:path';

import { app, type BrowserWindow } from 'electron';

import { getSongControls } from './song-controls';

export const APP_PROTOCOL = 'ruri';

const PROTOCOL_PREFIX = `${APP_PROTOCOL}://`;

let protocolHandler: ((cmd: string, ...args: string[]) => void) | undefined;
const pendingUrls: string[] = [];

export function parseProtocolUrl(
  raw: string,
): { cmd: string; args: string[] } | null {
  if (!raw.startsWith(PROTOCOL_PREFIX)) {
    return null;
  }

  const lastIndex = raw.endsWith('/') ? -1 : undefined;
  const command = raw.slice(PROTOCOL_PREFIX.length, lastIndex);
  const parts = decodeURIComponent(command).split(' ');
  const cmd = parts.shift();
  if (!cmd) {
    return null;
  }

  return { cmd, args: parts };
}

export function findProtocolUrl(argv: readonly string[]): string | undefined {
  return argv.find((arg) => arg.startsWith(PROTOCOL_PREFIX));
}

export function dispatchProtocolUrl(raw: string): boolean {
  const parsed = parseProtocolUrl(raw);
  if (!parsed) {
    return false;
  }

  if (!protocolHandler) {
    pendingUrls.push(raw);
    return true;
  }

  handleProtocol(parsed.cmd, ...parsed.args);
  return true;
}

export function setupProtocolHandler(win: BrowserWindow) {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  } else {
    app.setAsDefaultProtocolClient(APP_PROTOCOL);
  }

  if (!protocolHandler) {
    const songControls = getSongControls(win);

    protocolHandler = ((cmd: keyof typeof songControls, ...args) => {
      if (Object.keys(songControls).includes(cmd)) {
        // @ts-expect-error: cmd is a key of songControls
        songControls[cmd](...args);
      }
    }) as (cmd: string, ...args: string[]) => void;
  }

  const queued = pendingUrls.splice(0, pendingUrls.length);
  for (const raw of queued) {
    dispatchProtocolUrl(raw);
  }
}

export function handleProtocol(cmd: string, ...args: string[]) {
  protocolHandler?.(cmd, ...args);
}

export function changeProtocolHandler(
  f: (cmd: string, ...args: string[]) => void,
) {
  protocolHandler = f;

  const queued = pendingUrls.splice(0, pendingUrls.length);
  for (const raw of queued) {
    dispatchProtocolUrl(raw);
  }
}
