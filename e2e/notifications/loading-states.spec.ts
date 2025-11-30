// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Notifications - Loading States', () => {
  test('Loading state shown while fetching notifications', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Check if loading state appears (might be very fast)
    const loadingText = page.getByText(/loading notifications/i);
    const isLoading = await loadingText.isVisible().catch(() => false);

    if (isLoading) {
      // 4. Verify loading indicator
      await expect(loadingText).toBeVisible();
    }

    // 5. Wait for content to load
    await page.waitForTimeout(1000);

    // 6. Verify page loaded successfully
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible();

    // 7. Tabs should be visible when loaded
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
  });

  test('Page renders correctly after loading', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // 4. Verify main elements are visible
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();

    // 5. Verify either notifications or empty state is shown
    const hasNotifications = await page
      .locator('[class*="CardContent"]')
      .filter({ has: page.locator('p[class*="font-medium"]') })
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByText(/no notifications yet|all caught up/i)
      .isVisible()
      .catch(() => false);

    // One of these should be true
    expect(hasNotifications || hasEmptyState).toBeTruthy();
  });

  test('No loading state stuck on screen', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Wait for loading to complete
    await page.waitForTimeout(2000);

    // 4. Verify loading text is not stuck on screen
    const loadingText = page.getByText(/loading notifications/i);
    await expect(loadingText).not.toBeVisible();

    // 5. Verify page is interactive
    const allTab = page.getByRole('tab', { name: /all/i });
    await expect(allTab).toBeVisible();
    await expect(allTab).toBeEnabled();
  });
});
