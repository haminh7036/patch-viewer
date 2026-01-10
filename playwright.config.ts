import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  outputDir: 'tests/output',
  reporter: [['list'], ['html', { outputFolder: 'tests/output/playwright-report' }]],
  use: {
    browserName: 'chromium',
    headless: true,
    actionTimeout: 10_000,
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
