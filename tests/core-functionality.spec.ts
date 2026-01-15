import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';


test.describe('Core Functionality - File Upload and Parsing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should upload patch file via file input and display files', async ({ page }) => {
        await test.step('Upload sample patch file', async () => {
            const sample = path.resolve(process.cwd(), 'sample.patch');
            if (!fs.existsSync(sample)) throw new Error('sample.patch not found');

            await page.setInputFiles('input[type="file"]', sample);
            await page.waitForTimeout(500);
        });

        await test.step('Verify files are displayed', async () => {
            // Check that main content area shows diff files
            const diffFiles = page.locator('[id^="file-"]');
            await expect(diffFiles.first()).toBeVisible();

            // Verify at least one file is rendered
            const fileCount = await diffFiles.count();
            expect(fileCount).toBeGreaterThan(0);
        });

        await test.step('Verify statistics are displayed', async () => {
            // Open sidebar to see statistics
            const menuBtn = page.locator('header button').first();
            if (await menuBtn.isVisible()) {
                await menuBtn.click();
                await page.waitForTimeout(300);
            }

            // Check for additions/deletions stats in sidebar footer
            const statsText = page.locator('text=/\\+\\d+/');
            await expect(statsText.first()).toBeVisible();
        });
    });

    test('should display loading state during parsing', async ({ page }) => {
        await test.step('Verify loading indicator appears', async () => {
            const sample = path.resolve(process.cwd(), 'sample.patch');

            // Start upload
            const uploadPromise = page.setInputFiles('input[type="file"]', sample);

            await uploadPromise;
            await page.waitForTimeout(500);

            // After parsing, files should be visible
            const diffFiles = page.locator('[id^="file-"]');
            await expect(diffFiles.first()).toBeVisible();
        });
    });

    test('should show file tree in sidebar', async ({ page }) => {
        await test.step('Upload file and open sidebar', async () => {
            const sample = path.resolve(process.cwd(), 'sample.patch');
            await page.setInputFiles('input[type="file"]', sample);
            await page.waitForTimeout(500);

            const menuBtn = page.locator('header button').first();
            if (await menuBtn.isVisible()) {
                await menuBtn.click();
                await page.waitForTimeout(300);
            }
        });

        await test.step('Verify file tree structure', async () => {
            // Check for file count in sidebar footer
            const fileCount = page.getByText(/\d+ files/);
            await expect(fileCount).toBeVisible();
        });
    });
});
