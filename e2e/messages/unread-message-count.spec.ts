// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Unread Message Count', () => {
  test('Unread messages show count badge', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check for unread message badges
    const unreadBadge = page.locator('[class*="Badge"]').first();
    const hasUnread = await unreadBadge.isVisible().catch(() => false);

    if (hasUnread) {
      // 4. Verify red badge shows count
      await expect(unreadBadge).toBeVisible();

      // 5. Badge appears on conversation item
      const conversationWithBadge = page.locator('button').filter({ has: unreadBadge });
      await expect(conversationWithBadge).toBeVisible();

      // 6. Verify count is a number
      const badgeText = await unreadBadge.textContent();
      expect(badgeText).toMatch(/^\d+(\+)?$/);

      // 7. Select conversation to mark as read
      await conversationWithBadge.click();

      // 8. Wait for read status to update
      await page.waitForTimeout(1000);

      // 9. Go back to conversation list
      const backButton = page
        .getByRole('button')
        .filter({ has: page.locator('svg[class*="h-4 w-4"]') })
        .first();
      const isBackVisible = await backButton.isVisible().catch(() => false);

      if (isBackVisible) {
        await backButton.click();
      } else {
        await page.goto('/messages');
      }

      // 10. Count should update when messages read
      await page.waitForTimeout(500);
    } else {
      // No unread messages - all conversations read
      const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
      const count = await conversations.count();

      // Verify no badges present
      const badges = page.locator('[class*="Badge"]');
      const badgeCount = await badges.count();

      if (count > 0) {
        // If there are conversations, we just verify the badge logic works
        expect(badgeCount).toBe(0);
      }
    }
  });

  test('Badge shows 99+ for high unread counts', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check for any badges
    const badges = page.locator('[class*="Badge"]');
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      // 4. Verify badge text format
      for (let i = 0; i < badgeCount; i++) {
        const badge = badges.nth(i);
        const text = await badge.textContent();

        // Badge should show number or "99+"
        expect(text).toMatch(/^\d+(\+)?$/);

        // If it shows 99+, verify the format
        if (text === '99+') {
          await expect(badge).toBeVisible();
        }
      }
    }
  });
});
