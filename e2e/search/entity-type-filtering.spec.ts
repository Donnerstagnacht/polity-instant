// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Search - Entity Type Filtering', () => {
  test('User filters search to users only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel to open
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all content types first
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "User" checkbox
    const userCheckbox = page.getByLabel(/user/i);
    await userCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL update

    // 9. URL updates with types parameter
    await expect(page).toHaveURL(/types=user/);
  });

  test('User filters search to groups only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Group" checkbox
    const groupCheckbox = page.getByLabel(/group/i).first();
    await groupCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL

    // 9. URL updates
    await expect(page).toHaveURL(/types=group/);
  });

  test('User filters search to blogs only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Blog" checkbox
    const blogCheckbox = page.getByLabel(/blog/i);
    await blogCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL

    // 9. URL should contain blog type
    await expect(page).toHaveURL(/types=blog/);
  });

  test('User filters search to amendments only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Amendment" checkbox
    const amendmentCheckbox = page.getByLabel(/amendment/i);
    await amendmentCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL (300ms debounce + navigation)
    await page.waitForLoadState('domcontentloaded');

    // 9. URL should contain amendment type
    await expect(page).toHaveURL(/types=amendment/);
  });

  test('User filters search to events only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Event" checkbox
    const eventCheckbox = page.getByLabel(/event/i);
    await eventCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL

    // 9. URL should contain event type
    await expect(page).toHaveURL(/types=event/);
  });

  test('User filters search to multiple types', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check multiple types: Group and Event
    await page.getByLabel(/group/i).first().check();
    await page.getByLabel(/event/i).check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL to update with types parameter
    await expect(page).toHaveURL(/types=/, { timeout: 10000 });
  });
});
