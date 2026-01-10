import { test, expect, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.use({ ...devices['iPhone 13'] });

const OUT_DIR = path.resolve(process.cwd(), 'tests/output');

test.describe('Mobile - header visibility after selecting file', () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  test('upload sample.patch and select file keeps header visible', async ({ page }) => {
    const APP_URL = 'http://127.0.0.1:5173/';

    await test.step('open app on mobile', async () => {
      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(OUT_DIR, 'step-1-open.png') });
      await expect(page.locator('header')).toBeVisible();
    });

    await test.step('upload sample.patch via file input', async () => {
      const sample = path.resolve(process.cwd(), 'sample.patch');
      if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
      await page.setInputFiles('input[type="file"]', sample);
      // wait for file list to be populated
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT_DIR, 'step-2-upload.png') });
    });

    await test.step('open menu and select a file from file tree', async () => {
      // open mobile sidebar via header menu button
      await page.locator('header button').first().click();
      await page.screenshot({ path: path.join(OUT_DIR, 'step-3-sidebar-open.png') });

      // select a file entry present in sample.patch (e.g., src/App.js)
      // find file entry inside the sidebar file list to avoid ambiguous matches
      const sidebar = page.locator('div.flex-1.overflow-y-auto');
      const fileEntry = sidebar.getByText('src/App.js', { exact: false }).first();
      await fileEntry.waitFor({ state: 'visible', timeout: 10000 });
      // use DOM click to avoid overlay/pointer interception in some layouts
      await fileEntry.evaluate(el => (el as HTMLElement).click());
      await page.screenshot({ path: path.join(OUT_DIR, 'step-4-file-selected.png') });

      // header should remain visible
      await expect(page.locator('header')).toBeVisible();
    });
  });
});
