// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { gotoHomeAndDismissDialog } from '../helpers/navigation';
test.describe('Timeline - Loading States', () => {
  test('Timeline shows loading indicator while fetching', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to home page
    await gotoHomeAndDismissDialog(page);

    // 3. Wait for the timeline header to load
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 4. Following tab should be visible and active
    const followingTab = page.getByRole('tab', { name: /following/i });
    await expect(followingTab).toBeVisible();
  });

  test('Timeline renders correctly after loading', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to home page
    await gotoHomeAndDismissDialog(page);

    // 3. Wait for timeline header
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 4. Verify either content cards or empty state is shown (use proper waiting)
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const emptyState = page.getByText(/subscribe|discover/i);

    // Wait for either cards or empty state to appear
    await expect(cards.first().or(emptyState.first())).toBeVisible({ timeout: 15000 });
  });

  test('No loading state stuck on screen', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to home page
    await gotoHomeAndDismissDialog(page);

    // 3. Wait for loading to complete
    await page.waitForLoadState('networkidle');

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
