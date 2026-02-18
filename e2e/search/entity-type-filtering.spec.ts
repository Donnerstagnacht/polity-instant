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
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all content types first
    await dialog.getByRole('button', { name: /none/i }).click();

    // 6. Check only "User" checkbox
    const userCheckbox = dialog.getByLabel(/user/i);
    await userCheckbox.check();

    // Wait for state to settle before closing
    await page.waitForTimeout(500);

    // 7. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL update

    // 9. URL updates with types parameter
    await expect(page).toHaveURL(/types=user/, { timeout: 20000 });
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
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await dialog.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Group" checkbox (scope to dialog to avoid matching page elements)
    const groupCheckbox = dialog.getByLabel(/group/i).first();
    await groupCheckbox.check();

    // Wait for state to settle before closing
    await page.waitForTimeout(500);

    // 7. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL

    // 9. URL updates
    await expect(page).toHaveURL(/types=group/, { timeout: 20000 });
  });

  test('User filters search to blogs only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await dialog.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Blog" checkbox
    const blogCheckbox = dialog.getByLabel(/blog/i);
    await blogCheckbox.check();
    
    // Wait for state to settle before closing
    await page.waitForTimeout(500);

    // 7. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for debounce + URL update

    // 9. URL should contain blog type
    await expect(page).toHaveURL(/types=blog/, { timeout: 20000 });
  });

  test('User filters search to amendments only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await dialog.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Amendment" checkbox
    const amendmentCheckbox = dialog.getByLabel(/amendment/i);
    await amendmentCheckbox.check();

    // Wait for state to settle before closing
    await page.waitForTimeout(500);

    // 7. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL (300ms debounce + navigation)

    // 9. URL should contain amendment type
    await expect(page).toHaveURL(/types=amendment/, { timeout: 20000 });
  });

  test('User filters search to events only', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel to open
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Content Types')).toBeVisible({ timeout: 10000 });

    // 5. Uncheck all
    await dialog.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Event" checkbox
    const eventCheckbox = dialog.getByLabel(/event/i);
    await eventCheckbox.check();
    
    // Wait for state to settle before closing
    await page.waitForTimeout(500);

    // 7. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL (300ms debounce + navigation)

    // 9. URL should contain event type
    await expect(page).toHaveURL(/types=event/, { timeout: 20000 });
  });

  test('User filters search to multiple types', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await dialog.getByRole('button', { name: /none/i }).click();

    // 6. Check multiple types: Group and Event
    await dialog.getByLabel(/group/i).first().check();
    await dialog.getByLabel(/event/i).check();

    // Wait for state to settle before closing
    await page.waitForTimeout(500);

    // 7. Close filter panel
    await dialog.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL to update with types parameter
    await expect(page).toHaveURL(/types=/, { timeout: 20000 });
  });
});
