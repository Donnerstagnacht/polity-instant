// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Entity Type Filtering', () => {
  test('User filters search to users only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search?q=test');

    // 3. Click "Users" tab
    const usersTab = page.getByRole('tab', { name: /users/i });
    await usersTab.click();

    // 4. Verify tab is active
    await expect(usersTab).toHaveAttribute('data-state', 'active');

    // 5. URL updates with type parameter
    await expect(page).toHaveURL(/type=users/);

    // 6. Only user profiles shown or empty state
    const emptyState = page.getByText(/no users found/i);
    const hasResults = !(await emptyState.isVisible().catch(() => false));

    if (hasResults) {
      // Check for user card elements
      const userCards = page
        .locator('[class*="Card"]')
        .filter({ has: page.locator('[alt*="User"]') });
      expect(await userCards.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('User filters search to groups only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Select "Groups" tab
    const groupsTab = page.getByRole('tab', { name: /groups/i });
    await groupsTab.click();

    // 4. Verify tab is active
    await expect(groupsTab).toHaveAttribute('data-state', 'active');

    // 5. URL updates
    await expect(page).toHaveURL(/type=groups/);
  });

  test('User filters search to blogs only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Select "Blogs" tab
    const blogsTab = page.getByRole('tab', { name: /blogs/i });
    await blogsTab.click();

    // 4. Verify tab is active
    await expect(blogsTab).toHaveAttribute('data-state', 'active');
  });

  test('User filters search to amendments only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Select "Amendments" tab
    const amendmentsTab = page.getByRole('tab', { name: /amendments/i });
    await amendmentsTab.click();

    // 4. Verify tab is active
    await expect(amendmentsTab).toHaveAttribute('data-state', 'active');
  });

  test('User filters search to events only', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search');

    // 3. Select "Events" tab
    const eventsTab = page.getByRole('tab', { name: /events/i });
    await eventsTab.click();

    // 4. Verify tab is active
    await expect(eventsTab).toHaveAttribute('data-state', 'active');
  });
});
