// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Search - Entity Type Filtering', () => {
  test('User filters search to users only', async ({ authenticatedPage: page }) => {
    await page.goto('/search?q=test');
    await page.waitForLoadState('domcontentloaded');

    // Open filter panel (Sheet with icon-only button, aria-label="Filters")
    const filterButton = page.getByRole('button', { name: /filter/i }).first();
    await expect(filterButton).toBeVisible({ timeout: 10000 });
    await filterButton.click();

    // Wait for Sheet panel to open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Uncheck all content types
    const noneButton = dialog.getByRole('button', { name: /none/i });
    await expect(noneButton).toBeVisible({ timeout: 5000 });
    await noneButton.click();

    // Check only "User" checkbox
    const userCheckbox = dialog.getByLabel(/user/i);
    await userCheckbox.first().check();
    await page.waitForTimeout(500);

    // Close filter panel
    const closeButton = dialog.getByRole('button', { name: /close/i }).first();
    await closeButton.click();

    // Wait for URL update (300ms debounce + router.push)
    await expect(page).toHaveURL(/types=user/, { timeout: 10000 });
  });

  test('User filters search to groups only', async ({ authenticatedPage: page }) => {
    await page.goto('/search');
    await page.waitForLoadState('domcontentloaded');

    const filterButton = page.getByRole('button', { name: /filter/i }).first();
    await expect(filterButton).toBeVisible({ timeout: 10000 });
    await filterButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.getByRole('button', { name: /none/i }).click();
    await page.waitForTimeout(300);

    const groupCheckbox = dialog.getByLabel(/group/i).first();
    await groupCheckbox.check();
    await page.waitForTimeout(500);

    await dialog.getByRole('button', { name: /close/i }).first().click();

    await expect(page).toHaveURL(/types=group/, { timeout: 15000 });
  });

  test('User filters search to blogs only', async ({ authenticatedPage: page }) => {
    await page.goto('/search');
    await page.waitForLoadState('domcontentloaded');

    const filterButton = page.getByRole('button', { name: /filter/i }).first();
    await expect(filterButton).toBeVisible({ timeout: 10000 });
    await filterButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const noneButton = dialog.getByRole('button', { name: /none/i });
    await expect(noneButton).toBeVisible({ timeout: 5000 });
    await noneButton.click();
    await page.waitForTimeout(300);

    const blogCheckbox = dialog.getByLabel(/blog/i);
    await blogCheckbox.first().check();
    await page.waitForTimeout(500);

    await dialog.getByRole('button', { name: /close/i }).first().click();

    await expect(page).toHaveURL(/types=blog/, { timeout: 15000 });
  });

  test('User filters search to amendments only', async ({ authenticatedPage: page }) => {
    await page.goto('/search');
    await page.waitForLoadState('domcontentloaded');

    const filterButton = page.getByRole('button', { name: /filter/i }).first();
    await expect(filterButton).toBeVisible({ timeout: 10000 });
    await filterButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.getByRole('button', { name: /none/i }).click();

    const amendmentCheckbox = dialog.getByLabel(/amendment/i);
    await amendmentCheckbox.first().check();
    await page.waitForTimeout(500);

    await dialog.getByRole('button', { name: /close/i }).first().click();

    await expect(page).toHaveURL(/types=amendment/, { timeout: 10000 });
  });

  test('User filters search to events only', async ({ authenticatedPage: page }) => {
    await page.goto('/search');
    await page.waitForLoadState('domcontentloaded');

    const filterButton = page.getByRole('button', { name: /filter/i }).first();
    await expect(filterButton).toBeVisible({ timeout: 10000 });
    await filterButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.getByRole('button', { name: /none/i }).click();

    const eventCheckbox = dialog.getByLabel(/event/i);
    await eventCheckbox.first().check();
    await page.waitForTimeout(500);

    await dialog.getByRole('button', { name: /close/i }).first().click();

    await expect(page).toHaveURL(/types=event/, { timeout: 10000 });
  });

  test('User filters search to multiple types', async ({ authenticatedPage: page }) => {
    await page.goto('/search?q=test');
    await page.waitForLoadState('domcontentloaded');

    const filterButton = page.getByRole('button', { name: /filter/i }).first();
    await expect(filterButton).toBeVisible({ timeout: 10000 });
    await filterButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.getByRole('button', { name: /none/i }).click();

    await dialog.getByLabel(/group/i).first().check();
    await dialog.getByLabel(/event/i).first().check();
    await page.waitForTimeout(500);

    await dialog.getByRole('button', { name: /close/i }).first().click();

    await expect(page).toHaveURL(/types=/, { timeout: 10000 });
  });
});
