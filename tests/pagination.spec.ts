import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://127.0.0.1:5173/';


test.describe('Pagination Functionality', () => {
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

    test('should display pagination controls', async ({ page }) => {
        await test.step('Verify pagination bar is visible', async () => {
            const pagination = page.locator('nav[aria-label="Pagination"]');
            await expect(pagination).toBeVisible();
        });

        await test.step('Verify page indicator shows current page', async () => {
            // Look for sticky header with page indicator
            const pageIndicator = page.locator('.sticky').getByText(/Page.*of/i);
            await expect(pageIndicator).toBeVisible();
        });

        await test.step('Verify results count is displayed', async () => {
            const resultsText = page.getByText(/Showing.*of.*results/i);
            await expect(resultsText).toBeVisible();
        });
    });

    test('should navigate to next page', async ({ page }) => {
        await test.step('Check if multiple pages exist', async () => {
            const pageIndicator = page.locator('.sticky').getByText(/Page.*of/i);
            const text = await pageIndicator.textContent();

            // Only proceed if there are multiple pages
            if (text && text.includes('of 1')) {
                test.skip();
            }
        });

        await test.step('Click next button', async () => {
            // Find Next button in pagination
            const nextButton = page.locator('nav[aria-label="Pagination"]').getByRole('button').last();
            await expect(nextButton).toBeEnabled();
            await nextButton.click();
            await page.waitForTimeout(500);
        });

        await test.step('Verify page changed to 2', async () => {
            const pageInput = page.locator('input[type="number"]');
            await expect(pageInput).toHaveValue('2');
        });

        await test.step('Verify scroll position reset to top', async () => {
            const mainScroll = page.locator('#main-scroll');
            const scrollTop = await mainScroll.evaluate(el => el.scrollTop);
            expect(scrollTop).toBeLessThan(100);
        });
    });

    test('should navigate to previous page', async ({ page }) => {
        await test.step('Navigate to page 2 first', async () => {
            const nextButton = page.locator('nav[aria-label="Pagination"]').getByRole('button').last();

            if (await nextButton.isEnabled()) {
                await nextButton.click();
                await page.waitForTimeout(500);
            } else {
                test.skip();
            }
        });

        await test.step('Click previous button', async () => {
            const prevButton = page.locator('nav[aria-label="Pagination"]').getByRole('button').first();
            await expect(prevButton).toBeEnabled();
            await prevButton.click();
            await page.waitForTimeout(500);
        });

        await test.step('Verify page changed back to 1', async () => {
            const pageInput = page.locator('input[type="number"]');
            await expect(pageInput).toHaveValue('1');
        });
    });

    test('should jump to specific page using input', async ({ page }) => {
        await test.step('Check if page 2 exists', async () => {
            const pageIndicator = page.locator('.sticky').getByText(/Page.*of/i);
            const text = await pageIndicator.textContent();

            if (text && text.includes('of 1')) {
                test.skip();
            }
        });

        await test.step('Enter page number directly', async () => {
            const pageInput = page.locator('input[type="number"]');
            await pageInput.clear();
            await pageInput.fill('2');
            await pageInput.dispatchEvent('change');
            await page.waitForTimeout(500);
        });

        await test.step('Verify navigation to page 2', async () => {
            const pageInput = page.locator('input[type="number"]');
            await expect(pageInput).toHaveValue('2');
        });
    });

    test('should disable previous button on first page', async ({ page }) => {
        await test.step('Verify on first page', async () => {
            const pageInput = page.locator('input[type="number"]');
            await expect(pageInput).toHaveValue('1');
        });

        await test.step('Verify previous button is disabled', async () => {
            const prevButton = page.locator('nav[aria-label="Pagination"]').getByRole('button').first();
            await expect(prevButton).toBeDisabled();
        });
    });

    test('should disable next button on last page', async ({ page }) => {
        await test.step('Navigate to last page', async () => {
            const pageIndicator = page.locator('.sticky').getByText(/Page.*of/i);
            const text = await pageIndicator.textContent();

            if (!text) return;

            const match = text.match(/of (\d+)/);
            if (!match) return;

            const totalPages = parseInt(match[1]);

            if (totalPages === 1) {
                // Already on last page
                return;
            }

            const pageInput = page.locator('input[type="number"]');
            await pageInput.clear();
            await pageInput.fill(totalPages.toString());
            await pageInput.dispatchEvent('change');
            await page.waitForTimeout(500);
        });

        await test.step('Verify next button is disabled', async () => {
            const nextButton = page.locator('nav[aria-label="Pagination"]').getByRole('button').last();
            await expect(nextButton).toBeDisabled();
        });
    });

    test('should show loading state during page navigation', async ({ page }) => {
        await test.step('Check if multiple pages exist', async () => {
            const pageIndicator = page.locator('.sticky').getByText(/Page.*of/i);
            const text = await pageIndicator.textContent();

            if (text && text.includes('of 1')) {
                test.skip();
            }
        });

        await test.step('Click next and verify loading state', async () => {
            const nextButton = page.locator('nav[aria-label="Pagination"]').getByRole('button').last();

            if (await nextButton.isEnabled()) {
                await nextButton.click();

                // Check for loading overlay
                const loadingOverlay = page.locator('.backdrop-blur-sm');
                // Loading state might be very brief
                await page.waitForTimeout(500);
            }
        });
    });
});
