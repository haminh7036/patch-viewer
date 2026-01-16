import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';

test.describe('Large Diff Handling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should hide large diff file by default and show message', async ({ page }) => {
        // Upload the large patch file (> 400 lines)
        const testPatch = path.resolve(process.cwd(), 'tests/fixtures/sample-largediff.patch');
        if (!fs.existsSync(testPatch)) {
            test.skip();
            return;
        }

        await page.setInputFiles('input[type="file"]', testPatch);
        await page.waitForTimeout(500);

        await test.step('Verify large diff message is shown', async () => {
            // Should show "Large diff not rendered by default" message
            const message = page.getByText(/Large diff not rendered by default/i);
            await expect(message).toBeVisible();
        });

        await test.step('Verify Load Diff button is present', async () => {
            const loadDiffBtn = page.getByRole('button', { name: 'Load Diff' });
            await expect(loadDiffBtn).toBeVisible();
        });

        await test.step('Verify line count is displayed', async () => {
            // Should show total lines count
            const lineCountText = page.getByText(/lines\)/i);
            await expect(lineCountText).toBeVisible();
        });
    });

    test('should show diff content when Load Diff is clicked', async ({ page }) => {
        const testPatch = path.resolve(process.cwd(), 'tests/fixtures/sample-largediff.patch');
        if (!fs.existsSync(testPatch)) {
            test.skip();
            return;
        }

        await page.setInputFiles('input[type="file"]', testPatch);
        await page.waitForTimeout(500);

        await test.step('Click Load Diff button', async () => {
            const loadDiffBtn = page.getByRole('button', { name: 'Load Diff' });
            await loadDiffBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Verify diff content is now visible', async () => {
            // After clicking, the message should be gone
            const message = page.getByText(/Large diff not rendered by default/i);
            await expect(message).not.toBeVisible();

            // And diff content should be visible (look for line numbers or content)
            const diffContent = page.locator('table').first();
            await expect(diffContent).toBeVisible();
        });
    });

    test('should not hide small diff files', async ({ page }) => {
        // Use regular sample.patch which is small
        const sample = path.resolve(process.cwd(), 'tests/fixtures/sample.patch');
        if (!fs.existsSync(sample)) {
            test.skip();
            return;
        }

        await page.setInputFiles('input[type="file"]', sample);
        await page.waitForTimeout(500);

        await test.step('Verify small diff is shown immediately', async () => {
            // Should NOT show the large diff message
            const message = page.getByText(/Large diff not rendered by default/i);
            await expect(message).not.toBeVisible();

            // Diff content should be visible directly
            const diffTable = page.locator('table').first();
            await expect(diffTable).toBeVisible();
        });
    });
});
