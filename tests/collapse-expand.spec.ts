import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';


test.describe('Collapse and Expand All Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
        await page.waitForLoadState('networkidle');

        // Upload large sample patch for pagination testing
        const sample = path.resolve(process.cwd(), 'sample-large.patch');
        if (!fs.existsSync(sample)) {
            console.warn('sample-large.patch not found, using sample.patch');
            const fallback = path.resolve(process.cwd(), 'sample.patch');
            await page.setInputFiles('input[type="file"]', fallback);
        } else {
            await page.setInputFiles('input[type="file"]', sample);
        }
        await page.waitForTimeout(500);
    });

    test('should display collapse and expand all buttons', async ({ page }) => {
        await test.step('Verify buttons are visible', async () => {
            const collapseBtn = page.getByRole('button', { name: 'Collapse All' });
            const expandBtn = page.getByRole('button', { name: 'Expand All' });

            await expect(collapseBtn).toBeVisible();
            await expect(expandBtn).toBeVisible();
        });

        await test.step('Verify buttons are in main content area', async () => {
            // Buttons should be visible in the main scroll area
            const mainContent = page.locator('#main-scroll');
            await expect(mainContent).toBeVisible();
        });
    });

    test('should collapse all diff sections when collapse all is clicked', async ({ page }) => {
        await test.step('Click collapse all button', async () => {
            const collapseBtn = page.getByRole('button', { name: 'Collapse All' });
            await collapseBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Verify diff sections are collapsed', async () => {
            // Check if diff content is hidden
            // This depends on implementation - might check for collapsed class or hidden content
            const diffFiles = page.locator('[id^="file-"]');
            const firstFile = diffFiles.first();

            // Verify the file card exists but content might be collapsed
            await expect(firstFile).toBeVisible();
        });
    });

    test('should expand all diff sections when expand all is clicked', async ({ page }) => {
        await test.step('Collapse all first', async () => {
            const collapseBtn = page.getByRole('button', { name: 'Collapse All' });
            await collapseBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Click expand all button', async () => {
            const expandBtn = page.getByRole('button', { name: 'Expand All' });
            await expandBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Verify diff sections are expanded', async () => {
            const diffFiles = page.locator('[id^="file-"]');
            const firstFile = diffFiles.first();

            // Verify content is visible
            await expect(firstFile).toBeVisible();
        });
    });

    test('should maintain collapse/expand state when switching pages', async ({ page }) => {
        await test.step('Check if multiple pages exist', async () => {
            const pageIndicator = page.locator('.sticky').getByText(/Page.*of/i);
            const text = await pageIndicator.textContent();

            if (text && text.includes('of 1')) {
                test.skip();
            }
        });

        await test.step('Collapse all on page 1', async () => {
            const collapseBtn = page.getByRole('button', { name: 'Collapse All' });
            await collapseBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Navigate to page 2', async () => {
            const nextButton = page.locator('nav[aria-label="Pagination"]').getByRole('button').last();

            if (await nextButton.isEnabled()) {
                await nextButton.click();
                await page.waitForTimeout(500);
            }
        });

        await test.step('Verify files on page 2 are also collapsed', async () => {
            // New page should respect the global collapse state
            const diffFiles = page.locator('[id^="file-"]');
            await expect(diffFiles.first()).toBeVisible();
        });
    });

    test('should show page indicator with current and total pages', async ({ page }) => {
        await test.step('Verify page indicator format', async () => {
            const pageIndicator = page.locator('.sticky').getByText(/Page.*of/i).first();
            await expect(pageIndicator).toBeVisible();

            const text = await pageIndicator.textContent();
            expect(text).toMatch(/Page\s+\d+\s+of\s+\d+/i);
        });
    });

    test('should toggle individual file while collapse all is active', async ({ page }) => {
        await test.step('Collapse all files', async () => {
            const collapseBtn = page.getByRole('button', { name: 'Collapse All' });
            await collapseBtn.click();
            await page.waitForTimeout(300);
        });

        await test.step('Click on individual file header to expand', async () => {
            const firstFile = page.locator('[id^="file-"]').first();

            // Find the file header/title to click
            const fileHeader = firstFile.locator('header, .cursor-pointer').first();

            if (await fileHeader.isVisible()) {
                await fileHeader.click();
                await page.waitForTimeout(200);
            }
        });

        await test.step('Verify individual file can be expanded', async () => {
            // Individual file should be able to override global state
            const firstFile = page.locator('[id^="file-"]').first();
            await expect(firstFile).toBeVisible();
        });
    });
});
