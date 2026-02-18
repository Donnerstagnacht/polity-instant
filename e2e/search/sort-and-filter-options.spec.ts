// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Search - Sort and Filter Options', () => {
  test('User applies date range filter', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search with query
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Date Range')).toBeVisible();

    // 5. Click on "Last 7 Days" button
    const weekButton = dialog.getByRole('button', { name: /last 7 days/i });
    await weekButton.click();

    // 6. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 7. Wait for URL update

    // 8. URL updates with range parameter
    await expect(page).toHaveURL(/range=week/, { timeout: 15000 });
  });

  test('User applies engagement filter', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Engagement')).toBeVisible();

    // 5. Select "Popular" engagement
    const popularButton = dialog.getByRole('button', { name: /^popular$/i });
    await popularButton.click();

    // 6. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 7. Wait for URL update

    // 8. URL updates with engagement parameter
    await expect(page).toHaveURL(/engagement=popular/, { timeout: 15000 });
  });

  test('User clears all filters', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate with multiple filters
    await page.goto('/search?q=test&range=week&engagement=popular', { waitUntil: 'domcontentloaded' });

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Filters')).toBeVisible();

    // 5. Click "Clear all" button
    const clearButton = dialog.getByRole('button', { name: /clear all/i });
    await clearButton.click();

    // 6. Close filter panel to trigger URL update
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 7. Wait for URL to no longer contain filter params
    await expect(page).toHaveURL(/\/search\?q=test$/, { timeout: 10000 });
  });

  test('User applies multiple filters together', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Content Types')).toBeVisible();

    // 5. Apply date range filter
    await dialog.getByRole('button', { name: /last 30 days/i }).click();

    // 6. Apply engagement filter
    await dialog.getByRole('button', { name: /^rising$/i }).click();

    // 7. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL update

    // 9. URL should contain both filters
    await expect(page).toHaveURL(/range=month/, { timeout: 15000 });
    await expect(page).toHaveURL(/engagement=rising/, { timeout: 15000 });
  });
});
