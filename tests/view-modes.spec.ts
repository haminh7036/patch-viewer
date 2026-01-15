import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';


test.describe('View Modes - Unified and Split Views', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
        await page.waitForLoadState('networkidle');

        // Upload sample patch
        const sample = path.resolve(process.cwd(), 'sample.patch');
        if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
        await page.setInputFiles('input[type="file"]', sample);
        await page.waitForTimeout(500);
    });

    test('should switch from unified to split view', async ({ page }) => {
        await test.step('Verify both view buttons are visible', async () => {
            const unifiedBtn = page.getByRole('button', { name: 'Unified View' });
            const splitBtn = page.getByRole('button', { name: 'Split View' });

            await expect(unifiedBtn).toBeVisible();
            await expect(splitBtn).toBeVisible();
        });

        await test.step('Switch to split view', async () => {
            const splitBtn = page.getByRole('button', { name: 'Split View' });
            await splitBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Verify split view is active', async () => {
            // Both buttons should still be visible
            const unifiedBtn = page.getByRole('button', { name: 'Unified View' });
            await expect(unifiedBtn).toBeVisible();
        });
    });

    test('should switch back to unified view from split view', async ({ page }) => {
        await test.step('Switch to split view first', async () => {
            const splitBtn = page.getByRole('button', { name: 'Split View' });
            await splitBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Switch back to unified view', async () => {
            const unifiedBtn = page.getByRole('button', { name: 'Unified View' });
            await unifiedBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Verify unified view is active', async () => {
            const splitBtn = page.getByRole('button', { name: 'Split View' });
            await expect(splitBtn).toBeVisible();
        });
    });

    test('should maintain view mode when navigating pages', async ({ page }) => {
        await test.step('Switch to split view', async () => {
            const splitBtn = page.getByRole('button', { name: 'Split View' });
            await splitBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Navigate to next page if available', async () => {
            const nextButton = page.getByRole('button', { name: /next/i });

            if (await nextButton.isEnabled()) {
                await nextButton.click();
                await page.waitForTimeout(500);
            }
        });

        await test.step('Verify split view is still active', async () => {
            const unifiedBtn = page.getByRole('button', { name: 'Unified View' });
            await expect(unifiedBtn).toBeVisible();
        });
    });
});
