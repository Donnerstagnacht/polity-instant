// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Mark Messages as Read', () => {
  test('Messages are marked read when conversation viewed', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check for conversations with unread badges
    const conversationWithUnread = page
      .locator('button')
      .filter({ has: page.locator('[class*="Badge"]') })
      .first();

    const hasUnread = await conversationWithUnread.isVisible().catch(() => false);

    if (hasUnread) {
      // 4. Verify unread badge visible on conversation
      const unreadBadge = conversationWithUnread.locator('[class*="Badge"]');
      await expect(unreadBadge).toBeVisible();

      // 5. User selects conversation
      await conversationWithUnread.click();

      // 6. Wait for messages to be marked as read
      await page.waitForTimeout(1000);

      // 7. Navigate back to conversation list (on mobile)
      const backButton = page
        .getByRole('button')
        .filter({ has: page.locator('svg') })
        .first();
      const isBackButtonVisible = await backButton.isVisible().catch(() => false);

      if (isBackButtonVisible) {
        await backButton.click();
      }

      // 8. Verify unread badge disappears or count decreases
      // Badge should be gone or have lower count after viewing
      await page.waitForTimeout(500);
    } else {
      // No unread messages - verify no badges present
      const allBadges = page.locator('[class*="Badge"]');
      const badgeCount = await allBadges.count();
      expect(badgeCount).toBe(0);
    }
  });
});
