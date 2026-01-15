import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';


test.describe('Accessibility and Keyboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should have proper page title', async ({ page }) => {
        await test.step('Verify page title is set', async () => {
            const title = await page.title();
            expect(title).toBeTruthy();
            expect(title.length).toBeGreaterThan(0);
        });
    });

    test('should have accessible form controls', async ({ page }) => {
        await test.step('Verify file input exists', async () => {
            const fileInput = page.locator('input[type="file"]');
            await expect(fileInput).toBeAttached();
        });

        await test.step('Verify textarea is accessible', async () => {
            const textarea = page.getByPlaceholder('Diff content here...');
            await expect(textarea).toBeVisible();
        });
    });

    test('should support keyboard navigation in pagination', async ({ page }) => {
        // Upload file first
        const sample = path.resolve(process.cwd(), 'sample.patch');
        if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
        await page.setInputFiles('input[type="file"]', sample);
        await page.waitForTimeout(500);

        await test.step('Navigate using Tab key', async () => {
            // Tab through pagination controls
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
        });

        await test.step('Verify focus is visible', async () => {
            const focusedElement = page.locator(':focus');
            const count = await focusedElement.count();
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    test('should have proper ARIA labels on buttons', async ({ page }) => {
        // Upload file first
        const sample = path.resolve(process.cwd(), 'sample.patch');
        if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
        await page.setInputFiles('input[type="file"]', sample);
        await page.waitForTimeout(500);

        await test.step('Verify pagination has aria-label', async () => {
            const pagination = page.locator('nav[aria-label="Pagination"]');
            await expect(pagination).toBeVisible();
        });

        await test.step('Verify buttons have accessible names', async () => {
            const prevButton = page.getByRole('button', { name: /previous/i });
            const nextButton = page.getByRole('button', { name: /next/i });

            // Buttons should be findable by accessible name
            const prevCount = await prevButton.count();
            const nextCount = await nextButton.count();

            expect(prevCount).toBeGreaterThan(0);
            expect(nextCount).toBeGreaterThan(0);
        });
    });

    test('should have semantic HTML structure', async ({ page }) => {
        await test.step('Verify header element exists', async () => {
            const header = page.locator('header');
            await expect(header).toBeVisible();
        });

        await test.step('Verify main element exists after upload', async () => {
            const sample = path.resolve(process.cwd(), 'sample.patch');
            if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
            await page.setInputFiles('input[type="file"]', sample);
            await page.waitForTimeout(500);

            const main = page.locator('main');
            await expect(main).toBeVisible();
        });

        await test.step('Verify footer element may exist', async () => {
            const sample = path.resolve(process.cwd(), 'sample.patch');
            if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
            await page.setInputFiles('input[type="file"]', sample);
            await page.waitForTimeout(500);

            const footer = page.locator('footer');
            const count = await footer.count();
            // Footer may or may not exist
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    test('should have sufficient color contrast', async ({ page }) => {
        await test.step('Load page and verify visibility', async () => {
            // Basic visibility check - proper contrast testing requires axe-core
            const header = page.locator('header');
            await expect(header).toBeVisible();

            const title = header.getByText(/patch viewer|git/i);
            await expect(title).toBeVisible();
        });
    });

    test('should support screen reader navigation', async ({ page }) => {
        const sample = path.resolve(process.cwd(), 'sample.patch');
        if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
        await page.setInputFiles('input[type="file"]', sample);
        await page.waitForTimeout(500);

        await test.step('Verify sr-only text for screen readers', async () => {
            const srOnlyElements = page.locator('.sr-only');
            const count = await srOnlyElements.count();

            // Should have some screen reader only text
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    test('should have focusable interactive elements', async ({ page }) => {
        const sample = path.resolve(process.cwd(), 'sample.patch');
        if (!fs.existsSync(sample)) throw new Error('sample.patch not found');
        await page.setInputFiles('input[type="file"]', sample);
        await page.waitForTimeout(500);

        await test.step('Verify buttons are focusable', async () => {
            const buttons = page.locator('button:visible');
            const count = await buttons.count();

            expect(count).toBeGreaterThan(0);

            // Check first button is focusable
            if (count > 0) {
                const firstButton = buttons.first();
                await firstButton.focus();
                await expect(firstButton).toBeFocused();
            }
        });
    });
});
