import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';


test.describe('FileTree - expand / collapse', () => {
  test('clicking folder toggles children visibility', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');

    // Upload sample patch file
    const sample = path.resolve(process.cwd(), 'sample.patch');
    if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
    await page.setInputFiles('input[type="file"]', sample);

    // Open sidebar if in mobile mode (or small screen)
    const menuBtn = page.locator('header button').first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
    }

    // Get the container holding the file list in Sidebar
    const sidebar = page.locator('.flex-1.overflow-y-auto').first();

    // Find 'src' folder
    const folder = sidebar.getByText('src', { exact: true }).first();
    await folder.waitFor({ state: 'visible', timeout: 5000 });

    // Find the li element containing this folder to determine the children area
    // DOM structure: li > div (folder row) + div (children container) > ul
    const folderLi = folder.locator('xpath=ancestor::li[1]');

    // Use .first() to get only the nearest ul, avoid mistakenly selecting ul from nested folders (e.g., src/utils)
    const childTree = folderLi.locator('ul').first();

    // Verify: Folder is open by default - children must be visible
    await expect(childTree).toBeVisible();

    // Click folder to collapse
    await folder.click();

    // Verify: Children are hidden (v-show only sets display: none)
    await expect(childTree).toBeHidden();

    // Click again to expand
    await folder.click();

    // Verify: Children are visible again
    await expect(childTree).toBeVisible();
  });
});
