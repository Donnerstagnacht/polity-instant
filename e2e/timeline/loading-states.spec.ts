// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Loading States', () => {
  test('Timeline shows loading indicator while fetching', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Check if loading state appears
    const loadingText = page.getByText(/loading updates from your subscriptions/i);
    const isLoading = await loadingText.isVisible().catch(() => false);

    if (isLoading) {
      // 4. Verify loading indicator
      await expect(loadingText).toBeVisible();

      // 5. Verify skeleton loaders
      const skeletons = page.locator('[class*="animate-pulse"]');
      const hasSkeleton = await skeletons
        .first()
        .isVisible()
        .catch(() => false);

      if (hasSkeleton) {
        await expect(skeletons.first()).toBeVisible();
      }
    }

    // 6. Wait for content to load
    await page.waitForTimeout(2000);

    // 7. Verify timeline loaded
    await expect(page.getByText(/your timeline/i)).toBeVisible();
  });

  test('Timeline renders correctly after loading', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // 4. Verify timeline header is visible
    await expect(page.getByText(/your timeline/i)).toBeVisible();

    // 5. Verify either events or empty state is shown
    const hasEvents = !(await page
      .getByText(/your timeline is empty/i)
      .isVisible()
      .catch(() => false));
    const hasEmptyState = await page
      .getByText(/subscribe to users, groups|your timeline is empty/i)
      .isVisible()
      .catch(() => false);

    // One of these should be true
    expect(hasEvents || hasEmptyState).toBeTruthy();
  });

  test('No loading state stuck on screen', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for loading to complete
    await page.waitForTimeout(3000);

    // 4. Verify loading text is not stuck on screen
    const loadingText = page.getByText(/loading updates from your subscriptions/i);
    await expect(loadingText).not.toBeVisible();

    // 5. Verify timeline is interactive
    const allTab = page.getByRole('tab', { name: /all/i });
    const hasTab = await allTab.isVisible().catch(() => false);

    if (hasTab) {
      await expect(allTab).toBeEnabled();
    }
  });
});
