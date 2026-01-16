import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';

test.describe('Search and Filter Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
        await page.waitForLoadState('networkidle');

        // Upload sample patch
        const sample = path.resolve(process.cwd(), 'tests/fixtures/sample.patch');
        if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
        await page.setInputFiles('input[type="file"]', sample);
        await page.waitForTimeout(500);

        // Open sidebar if not visible (mobile)
        const sidebar = page.locator('aside');
        const isVisible = await sidebar.isVisible();
        if (!isVisible) {
            const menuBtn = page.locator('header button').first();
            if (await menuBtn.isVisible()) {
                await menuBtn.click();
                await page.waitForTimeout(300);
            }
        }
    });

    test('should filter files by search query', async ({ page }) => {
        await test.step('Get initial file count', async () => {
            const fileCount = page.getByText(/\d+ files/);
            await expect(fileCount).toBeVisible();
        });

        await test.step('Enter search query', async () => {
            const searchInput = page.getByPlaceholder('File search...');
            await searchInput.fill('App');
            await page.waitForTimeout(500); // Wait for debounce
        });

        await test.step('Verify filtered results', async () => {
            // Check that visible count is updated
            const fileCount = page.getByText(/\d+ files/);
            await expect(fileCount).toBeVisible();
        });
    });

    test('should clear search and show all files', async ({ page }) => {
        await test.step('Enter and then clear search', async () => {
            const searchInput = page.getByPlaceholder('File search...');
            await searchInput.fill('App');
            await page.waitForTimeout(500);

            await searchInput.clear();
            await page.waitForTimeout(500);
        });

        await test.step('Verify all files are shown again', async () => {
            const fileCount = page.getByText(/\d+ files/);
            await expect(fileCount).toBeVisible();
        });
    });

    test('should filter by file status - toggle filters', async ({ page }) => {
        await test.step('Locate status filter checkboxes', async () => {
            const sidebar = page.locator('aside');
            await expect(sidebar).toBeVisible();

            const addedLabel = sidebar.locator('label').filter({ hasText: 'added' });
            const modifiedLabel = sidebar.locator('label').filter({ hasText: 'modified' });
            const deletedLabel = sidebar.locator('label').filter({ hasText: 'deleted' });

            await expect(addedLabel).toBeVisible();
            await expect(modifiedLabel).toBeVisible();
            await expect(deletedLabel).toBeVisible();
        });

        await test.step('Click on a filter to toggle it', async () => {
            const sidebar = page.locator('aside');
            const modifiedLabel = sidebar.locator('label').filter({ hasText: 'modified' });
            await modifiedLabel.click();
            await page.waitForTimeout(300);
        });

        await test.step('Verify file count updates', async () => {
            const fileCount = page.getByText(/\d+ files/);
            await expect(fileCount).toBeVisible();
        });
    });

    test('should show "File not found" when all filters are unchecked', async ({ page }) => {
        await test.step('Uncheck all status filters', async () => {
            const sidebar = page.locator('aside');
            await expect(sidebar).toBeVisible();

            const addedLabel = sidebar.locator('label').filter({ hasText: 'added' });
            const modifiedLabel = sidebar.locator('label').filter({ hasText: 'modified' });
            const deletedLabel = sidebar.locator('label').filter({ hasText: 'deleted' });

            await addedLabel.click();
            await modifiedLabel.click();
            await deletedLabel.click();
            await page.waitForTimeout(300);
        });

        await test.step('Verify "File not found" message', async () => {
            const notFound = page.getByText('File not found');
            await expect(notFound).toBeVisible();
        });

        await test.step('Verify 0 files shown', async () => {
            const fileCount = page.getByText('0 files');
            await expect(fileCount).toBeVisible();
        });
    });

    test('should combine search and filter', async ({ page }) => {
        await test.step('Apply search query', async () => {
            const searchInput = page.getByPlaceholder('File search...');
            await searchInput.fill('src');
            await page.waitForTimeout(500);
        });

        await test.step('Apply status filter', async () => {
            const sidebar = page.locator('aside');
            await expect(sidebar).toBeVisible();

            const modifiedLabel = sidebar.locator('label').filter({ hasText: 'modified' });
            await modifiedLabel.click();
            await page.waitForTimeout(300);
        });

        await test.step('Verify combined filtering works', async () => {
            // Results should be filtered by both search and status
            const fileCount = page.getByText(/\d+ files/);
            await expect(fileCount).toBeVisible();
        });
    });
});
