import path from 'node:path';
import process from 'node:process';

import { test, expect, _electron as electron } from '@playwright/test';

process.env.NODE_ENV = 'test';

const appPath = path.resolve(import.meta.dirname, '..');

const ytmOrigin =
  'https://music.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com';

test('Ruri App - With default settings, app is launched and visible', async () => {
  test.setTimeout(90_000);

  const app = await electron.launch({
    cwd: appPath,
    env: {
      HOME: process.env.HOME,
      DISPLAY: process.env.DISPLAY,
      XAUTHORITY: process.env.XAUTHORITY,
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

  const page = await app.firstWindow();

  await expect
    .poll(
      () => page.evaluate(() => document.documentElement.dataset.glassyBackdrop),
      { timeout: 30_000 },
    )
    .toBe('on');

  const backdrop = await page.evaluate(() => {
    const html = document.documentElement;
    const host = document.getElementById('ruri-glassy-backdrop');
    return {
      host: Boolean(host),
      layers: host?.querySelectorAll('.ruri-glassy-backdrop__layer').length ?? 0,
      ytBg: getComputedStyle(html)
        .getPropertyValue('--ytmusic-background')
        .trim(),
    };
  });
  expect(backdrop.host).toBe(true);
  expect(backdrop.layers).toBe(2);
  expect(backdrop.ytBg).toBe('transparent');

  await app.close();
});
