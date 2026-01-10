import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve(process.cwd(), 'tests/output');
const APP_URL = 'http://127.0.0.1:5173/';

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

test.describe('FileTree - expand / collapse', () => {
  test('clicking folder toggles children visibility', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');

    const sample = path.resolve(process.cwd(), 'sample.patch');
    if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
    await page.setInputFiles('input[type="file"]', sample);

    // open sidebar if hidden (mobile)
    const menuBtn = page.locator('header button').first();
    if (await menuBtn.isVisible()) await menuBtn.click();

    const sidebar = page.locator('div.flex-1.overflow-y-auto');

    // wait for a known folder from sample.patch to appear
    const folder = sidebar.getByText('src', { exact: false }).first();
    await folder.waitFor({ state: 'visible', timeout: 5000 });

    // find parent <li> for the folder and check if children are present after click
    const folderItem = folder.locator('xpath=ancestor::li[1]');

    // ensure initially children are visible (default expanded) then collapse
    const childTree = folderItem.locator('ul');

    // click to toggle collapse
    await folder.evaluate(el => (el as HTMLElement).click());
    await expect(childTree).toHaveCount(0);

    // click again to expand
    await folder.evaluate(el => (el as HTMLElement).click());
    await expect(childTree).not.toHaveCount(0);
  });
});
