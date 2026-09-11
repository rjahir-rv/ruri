import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  projects: [
    {
      name: 'unit',
      testDir: './src',
      testMatch: '**/*.test.{ts,js}',
      timeout: 15_000,
    },
    {
      name: 'electron',
      testDir: './tests',
      testMatch: '**/*.test.{ts,js}',
      timeout: 150_000,
      workers: 1,
    },
  ],
});
