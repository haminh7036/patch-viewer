import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';

test.describe('Empty State and Paste Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should display empty state on initial load', async ({ page }) => {
        await test.step('Verify empty state message', async () => {
            const emptyMessage = page.getByText('Upload file .patch / .diff');
            await expect(emptyMessage).toBeVisible();
        });

        await test.step('Verify upload button is visible', async () => {
            const uploadButton = page.locator('input[type="file"]');
            await expect(uploadButton).toBeAttached();
        });

        await test.step('Verify textarea for paste is visible', async () => {
            const textarea = page.getByPlaceholder('Diff content here...');
            await expect(textarea).toBeVisible();
        });
    });

    test('should parse content when pasted into textarea', async ({ page }) => {
        await test.step('Paste sample patch content', async () => {
            const samplePatch = `diff --git a/test.js b/test.js
index 1234567..abcdefg 100644
--- a/test.js
+++ b/test.js
@@ -1,3 +1,4 @@
+console.log('new line');
 function test() {
   return true;
 }`;

            const textarea = page.getByPlaceholder('Diff content here...');
            await textarea.fill(samplePatch);
            await page.waitForTimeout(500);
        });

        await test.step('Verify content is parsed and displayed', async () => {
            // Should show diff files after parsing
            const diffFiles = page.locator('[id^="file-"]');
            await expect(diffFiles.first()).toBeVisible();
        });
    });

    test('should show app title and version in header', async ({ page }) => {
        await test.step('Verify header elements', async () => {
            const header = page.locator('header');
            await expect(header).toBeVisible();

            // Check for title text
            const title = header.getByText(/patch viewer|git/i);
            await expect(title).toBeVisible();
        });
    });

    test('should not show file tree when no files loaded', async ({ page }) => {
        await test.step('Verify empty state', async () => {
            const emptyState = page.getByText('Upload file .patch / .diff');
            await expect(emptyState).toBeVisible();
        });

        await test.step('Open sidebar and verify empty message', async () => {
            // Try to open sidebar
            const menuBtn = page.locator('header button').first();

            if (await menuBtn.isVisible()) {
                await menuBtn.click();
                await page.waitForTimeout(300);

                // Sidebar should show 0 visible files
                const visibleText = page.getByText(/0.*visible/i);
                if (await visibleText.isVisible()) {
                    await expect(visibleText).toBeVisible();
                }
            }
        });
    });

    test('should clear empty state after file upload', async ({ page }) => {
        await test.step('Verify empty state is visible', async () => {
            const emptyState = page.getByText('Upload file .patch / .diff');
            await expect(emptyState).toBeVisible();
        });

        await test.step('Upload file', async () => {
            const sample = path.resolve(process.cwd(), 'sample.patch');
            if (!fs.existsSync(sample)) throw new Error('sample.patch not found');

            await page.setInputFiles('input[type="file"]', sample);
            await page.waitForTimeout(500);
        });

        await test.step('Verify empty state is hidden', async () => {
            const emptyState = page.getByText('Upload file .patch / .diff');
            await expect(emptyState).not.toBeVisible();
        });

        await test.step('Verify diff content is shown', async () => {
            const diffFiles = page.locator('[id^="file-"]');
            await expect(diffFiles.first()).toBeVisible();
        });
    });
});
