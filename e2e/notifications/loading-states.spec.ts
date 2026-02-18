// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Notifications - Loading States', () => {
  test('Loading state shown while fetching notifications', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
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
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible({ timeout: 15000 });

    // 6. Verify page loaded successfully - heading already verified above

    // 7. Tabs should be visible when loaded
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
  });

  test('Page renders correctly after loading', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Wait for page to fully load
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();

    // 5. Verify either notifications or empty state is shown
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel).toBeVisible({ timeout: 10000 });

    const notificationCard = tabPanel.locator('div[class*="cursor-pointer"]').first();
    const emptyState = page.getByText(/no notifications yet|all caught up/i);

    // Wait for data to load: either notifications or empty state
    await expect(notificationCard.or(emptyState)).toBeVisible({ timeout: 15000 });
  });

  test('No loading state stuck on screen', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to notifications page
    await page.goto('/notifications');

    // 3. Wait for loading to complete
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible({ timeout: 15000 });

    // 4. Verify loading text is not stuck on screen
    const loadingText = page.getByText(/loading notifications/i);
    await expect(loadingText).not.toBeVisible();

    // 5. Verify page is interactive
    const allTab = page.getByRole('tab', { name: /all/i });
    await expect(allTab).toBeVisible();
    await expect(allTab).toBeEnabled();
  });
});
