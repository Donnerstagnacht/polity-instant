// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Entity Type Filtering', () => {
  test('User filters search to users only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel to open
    await page.waitForTimeout(500);
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all content types first
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "User" checkbox
    const userCheckbox = page.getByLabel(/user/i);
    await userCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL update
    await page.waitForTimeout(500);

    // 9. URL updates with types parameter
    await expect(page).toHaveURL(/types=user/);
  });

  test('User filters search to groups only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Group" checkbox
    const groupCheckbox = page.getByLabel(/group/i).first();
    await groupCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL
    await page.waitForTimeout(500);

    // 9. URL updates
    await expect(page).toHaveURL(/types=group/);
  });

  test('User filters search to blogs only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Blog" checkbox
    const blogCheckbox = page.getByLabel(/blog/i);
    await blogCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL
    await page.waitForTimeout(500);

    // 9. URL should contain blog type
    await expect(page).toHaveURL(/types=blog/);
  });

  test('User filters search to amendments only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Amendment" checkbox
    const amendmentCheckbox = page.getByLabel(/amendment/i);
    await amendmentCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL (300ms debounce + navigation)
    await page.waitForTimeout(800);

    // 9. URL should contain amendment type
    await expect(page).toHaveURL(/types=amendment/);
  });

  test('User filters search to events only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check only "Event" checkbox
    const eventCheckbox = page.getByLabel(/event/i);
    await eventCheckbox.check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL
    await page.waitForTimeout(500);

    // 9. URL should contain event type
    await expect(page).toHaveURL(/types=event/);
  });

  test('User filters search to multiple types', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filter panel
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Content Types')).toBeVisible();

    // 5. Uncheck all
    await page.getByRole('button', { name: /none/i }).click();

    // 6. Check multiple types: Group and Event
    await page.getByLabel(/group/i).first().check();
    await page.getByLabel(/event/i).check();

    // 7. Close filter panel
    await page.getByRole('button', { name: /close/i }).first().click();

    // 8. Wait for URL (300ms debounce + navigation)
    await page.waitForTimeout(800);

    // 9. URL should contain both types
    const url = page.url();
    expect(url).toMatch(/types=(group(%2C|,)event|event(%2C|,)group)/);
  });
});
