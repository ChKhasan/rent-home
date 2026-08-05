import { defineConfig, devices } from '@playwright/test';

const executablePath = process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'];

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: process.env['CI'] ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env['QA_CHAT_WEB_URL'] || 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
