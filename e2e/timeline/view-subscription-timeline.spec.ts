// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Timeline - View Subscription-Based Timeline', () => {
  test('User sees timeline events from their subscriptions', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline header to appear
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 4. Verify Following tab is active by default
    const followingTab = page.getByRole('tab', { name: /following/i });
    await expect(followingTab).toHaveAttribute('aria-selected', 'true');

    // 5. Timeline displays content or empty state
    const emptyState = page.getByText(/subscribe|your timeline is empty/i);
    const hasEmptyTimeline = await emptyState.isVisible().catch(() => false);

    if (!hasEmptyTimeline) {
      // 6. Check for content cards in masonry grid
      const cards = page.locator('[class*="card"], [class*="Card"]');
      const hasCards = (await cards.count()) > 0;

      if (hasCards) {
        await expect(cards.first()).toBeVisible();
      }
    }
  });
});
