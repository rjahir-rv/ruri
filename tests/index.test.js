import path from 'node:path';
import process from 'node:process';

import { test, expect, _electron as electron } from '@playwright/test';

process.env.NODE_ENV = 'test';

const appPath = path.resolve(import.meta.dirname, '..');

test('Ruri App - With default settings, app is launched and visible', async () => {
  const app = await electron.launch({
    cwd: appPath,
    args: [
      appPath,
      '--no-sandbox',
      '--disable-gpu',
      '--whitelisted-ips=',
      '--disable-dev-shm-usage',
    ],
  });

  const window = await app.firstWindow();

  const consentForm = await window.$(
    "form[action='https://consent.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com/save']",
  );
  if (consentForm) {
    await consentForm.click('button');
  }

  const url = window.url();
  expect(
    url.startsWith(
      'https://music.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com',
    ),
  ).toBe(true);

  const minSize = await app.evaluate(async ({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].getMinimumSize(),
  );
  expect(minSize).toEqual([1100, 620]);

  // The page owns document.title; the renderer rebrands it asynchronously.
  await expect.poll(() => window.title()).toContain('Ruri');
  expect(await window.title()).not.toMatch(
    /\u0059\u006f\u0075\u0054\u0075\u0062\u0065 \u004d\u0075\u0073\u0069\u0063/i,
  );

  await app.close();
});
