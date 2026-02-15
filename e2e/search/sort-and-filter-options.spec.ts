// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Sort and Filter Options', () => {
  test('User applies date range filter', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search with query
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Date Range')).toBeVisible();

    // 5. Click on "Last 7 Days" button
    const weekButton = page.getByRole('button', { name: /last 7 days/i });
    await weekButton.click();

    // 6. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 7. Wait for URL update
    await page.waitForTimeout(500);

    // 8. URL updates with range parameter
    await expect(page).toHaveURL(/range=week/);
  });

  test('User applies engagement filter', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Engagement')).toBeVisible();

    // 5. Select "Popular" engagement
    const popularButton = page.getByRole('button', { name: /^popular$/i });
    await popularButton.click();

    // 6. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 7. Wait for URL update
    await page.waitForTimeout(500);

    // 8. URL updates with engagement parameter
    await expect(page).toHaveURL(/engagement=popular/);
  });

  test('User clears all filters', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate with multiple filters
    await page.goto('/search?q=test&range=week&engagement=popular', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Filters')).toBeVisible();

    // 5. Click "Clear all" button
    const clearButton = page.getByRole('button', { name: /clear all/i });
    await clearButton.click();

    // 6. Close filter panel to trigger URL update
    await page.getByRole('button', { name: /close/i }).first().click();

    // 7. Wait for filter panel to close
    await page.waitForTimeout(1000);

    // 8. Wait for URL to update without filters
    await page.waitForTimeout(1000);

    // 9. Filters should be reset
    const url = page.url();
    expect(url).not.toContain('range=');
    expect(url).not.toContain('engagement=');
  });

  test('User applies multiple filters together', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Apply date range filter
    await page.getByRole('button', { name: /last 30 days/i }).click();

    // 6. Apply engagement filter
    await page.getByRole('button', { name: /^rising$/i }).click();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL update
    await page.waitForTimeout(500);

    // 9. URL should contain both filters
    await expect(page).toHaveURL(/range=month/);
    await expect(page).toHaveURL(/engagement=rising/);
  });
});
