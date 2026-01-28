import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only is left behind */
  forbidOnly: !!process.env.CI,

  /* Retry once on CI to avoid flakiness */
  retries: process.env.CI ? 1 : 0,

  /* Run tests sequentially on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Global test timeout */
  timeout: 30_000,

  /* Reporter */
  reporter: 'html',

  /* Shared settings */
  use: {
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    headless: true,
  },

  /* Browser projects */
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ],

  /* Start Express server before tests */
  webServer: {
    command: 'node index.js',
    url: 'http://localhost:5050',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
