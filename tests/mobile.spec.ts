import { test, expect, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.use({ ...devices['iPhone 13'] });

const OUT_DIR = path.resolve(process.cwd(), 'tests/output');

test.describe('Mobile - header visibility after selecting file', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }
  });

  test('upload sample.patch and select file keeps header visible', async ({ page }) => {
    const APP_URL = 'http://127.0.0.1:5173/';

    await test.step('open app on mobile', async () => {
      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('header')).toBeVisible();
    });

    await test.step('upload sample.patch via file input', async () => {
      const sample = path.resolve(process.cwd(), 'sample.patch');
      if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
      await page.setInputFiles('input[type="file"]', sample);
      // Wait for file list to be rendered
      await page.waitForTimeout(500);
    });

    await test.step('open menu and select a file from file tree', async () => {
      // Open sidebar on mobile (menu button in header)
      await page.locator('header button').first().click();
      await page.waitForTimeout(300); // Wait for sidebar animation

      // Identify sidebar: Sidebar appears before Main Content in DOM, so use .first()
      const sidebar = page.locator('.flex-1.overflow-y-auto').first();

      // Select 'App.js' file (Note: FileTree displays as a tree structure, so find file name, not full path 'src/App.js')
      const fileEntry = sidebar.getByText('App.js', { exact: true }).first();
      await fileEntry.waitFor({ state: 'visible', timeout: 5000 });

      // Click on file
      await fileEntry.click();

      // Sidebar will automatically close on mobile, wait for animation
      await page.waitForTimeout(300);

      // Header must still be visible
      await expect(page.locator('header')).toBeVisible();
    });
  });
});
