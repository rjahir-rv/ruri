import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { test, expect, _electron as electron } from '@playwright/test';

process.env.NODE_ENV = 'test';

const appPath = path.resolve(import.meta.dirname, '..');

const ytmOrigin =
  'https://music.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com';

test('Ruri App - With default settings, app is launched and visible', async () => {
  test.setTimeout(90_000);

  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ruri-playwright-'));

  const app = await electron.launch({
    cwd: appPath,
    env: {
      HOME: home,
      XDG_CONFIG_HOME: path.join(home, '.config'),
      DISPLAY: process.env.DISPLAY,
      XAUTHORITY: process.env.XAUTHORITY,
      XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR,
      PATH: process.env.PATH,
      LANG: process.env.LANG,
      NODE_ENV: 'production',
    },
    args: [appPath, '--no-sandbox'],
  });

  await expect
    .poll(
      () =>
        app.evaluate(async ({ BrowserWindow }) => {
          const win = BrowserWindow.getAllWindows()[0];
          return win?.webContents.getURL() ?? '';
        }),
      { timeout: 60_000 },
    )
    .toContain(ytmOrigin);

  const minSize = await app.evaluate(async ({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].getMinimumSize(),
  );
  expect(minSize).toEqual([1100, 620]);

  await expect
    .poll(() =>
      app.evaluate(async ({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].getTitle(),
      ),
    )
    .toContain('Ruri');

  const title = await app.evaluate(async ({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].getTitle(),
  );
  expect(title).not.toMatch(
    /\u0059\u006f\u0075\u0054\u0075\u0062\u0065 \u004d\u0075\u0073\u0069\u0063/i,
  );

  const pluginSnapshot = () =>
    app.evaluate(async ({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      if (!win) return null;
      return win.webContents.executeJavaScript(`(() => {
        const html = document.documentElement;
        const host = document.getElementById('ruri-glassy-backdrop');
        const style = getComputedStyle(html);
        return {
          attr: html.dataset.glassyBackdrop ?? '',
          host: Boolean(host),
          layers:
            host?.querySelectorAll('.ruri-glassy-backdrop__layer').length ?? 0,
          svgAnimations: host?.querySelectorAll('animate').length ?? 0,
          ytBg: style.getPropertyValue('--ytmusic-background').trim(),
          albumColorIsWrapped: /^rgb\\(/i.test(
            style.getPropertyValue('--ytmusic-album-color').trim(),
          ),
          darkAlbumColorIsWrapped: /^rgb\\(/i.test(
            style.getPropertyValue('--ytmusic-album-color-dark').trim(),
          ),
          glow: style.getPropertyValue('--glow-color').trim(),
          inactive: style.getPropertyValue('--lyrics-inactive-opacity').trim(),
          glassyQuality: html.dataset.glassyQuality ?? '',
          albumColorPaint: html.dataset.albumColorPaint ?? '',
          glassyText: style.getPropertyValue('--glassy-text').trim(),
          glassyAqua: html.dataset.glassyAqua ?? '',
          lyricSize: style.getPropertyValue('--glassy-lyric-size').trim(),
        };
      })()`);
    });

  // Plugin renderer runs after YTM's document is ready. Query the window
  // through webContents so we do not sample a Playwright guest frame.
  await expect.poll(pluginSnapshot, { timeout: 30_000 }).toEqual({
    attr: 'on',
    host: true,
    layers: 2,
    svgAnimations: 1,
    ytBg: 'transparent',
    albumColorIsWrapped: false,
    darkAlbumColorIsWrapped: false,
    glow: 'rgba(255, 255, 255, 0.5)',
    inactive: '0.58',
    glassyQuality: 'high',
    albumColorPaint: 'off',
    glassyText: '#f4f6fb',
    glassyAqua: 'on',
    lyricSize: 'clamp(1.7rem, 2.3vw, 2.75rem)',
  });

  const defaultPlugins = await app.evaluate(async ({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return win.webContents.executeJavaScript(`Promise.all([
      'glassy-theme',
      'glassy-backdrop',
      'album-color-theme',
      'synced-lyrics',
      'do-not-track',
    ].map((id) => window.mainConfig.plugins.isEnabled(id)))`);
  });
  expect(defaultPlugins).toEqual([true, true, true, true, true]);

  await app.evaluate(async ({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    await win.webContents.executeJavaScript(
      `window.mainConfig.plugins.setOptions('glassy-theme', { quality: 'low' })`,
    );
  });

  await expect
    .poll(
      () =>
        app.evaluate(async ({ BrowserWindow }) => {
          const win = BrowserWindow.getAllWindows()[0];
          if (!win) return null;
          return win.webContents.executeJavaScript(`(() => {
            const html = document.documentElement;
            const layer = document.querySelector(
              '#ruri-glassy-backdrop .ruri-glassy-backdrop__layer',
            );
            return {
              quality: html.dataset.glassyQuality ?? '',
              layerDisplay: layer ? getComputedStyle(layer).display : '',
              layerFilter: layer ? getComputedStyle(layer).filter : '',
            };
          })()`);
        }),
      { timeout: 15_000 },
    )
    .toEqual({
      quality: 'low',
      layerDisplay: 'none',
      layerFilter: 'none',
    });

  await app.evaluate(async ({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    await win.webContents.executeJavaScript(
      `window.mainConfig.plugins.setOptions('glassy-theme', { quality: 'high' })`,
    );
  });

  await expect
    .poll(
      () =>
        app.evaluate(async ({ BrowserWindow }) => {
          const win = BrowserWindow.getAllWindows()[0];
          if (!win) return '';
          return win.webContents.executeJavaScript(
            `document.documentElement.dataset.glassyQuality ?? ''`,
          );
        }),
      { timeout: 15_000 },
    )
    .toBe('high');

  await expect
    .poll(
      () =>
        app.evaluate(async ({ BrowserWindow }) => {
          const win = BrowserWindow.getAllWindows()[0];
          if (!win) return false;
          return win.webContents.executeJavaScript(
            `window.mainConfig.plugins.isEnabled('do-not-track')`,
          );
        }),
      { timeout: 15_000 },
    )
    .toBe(true);

  await app.close();
});
