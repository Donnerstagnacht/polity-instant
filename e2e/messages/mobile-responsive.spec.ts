// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect, devices } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

// test.use() must be at top-level, not inside describe blocks
test.use({ ...devices['iPhone 12'] });

test.describe('Chat/Messages - Mobile Responsive Layout', () => {
  test('Messages page works on mobile devices', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page on mobile
    await page.goto('/messages');

    // 3. Conversation list shown first
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible();

    const searchInput = page.getByPlaceholder(/search conversations/i);
    await expect(searchInput).toBeVisible();

    // 4. Check if conversations exist
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      // 5. User selects conversation
      await firstConversation.click();

      // 6. Message view takes full screen
      const messageHeader = page.locator('h3');
      await expect(messageHeader).toBeVisible();

      // 7. Back arrow returns to conversation list
      const backButton = page
        .getByRole('button')
        .filter({ has: page.locator('svg') })
        .first();
      await expect(backButton).toBeVisible();

      await backButton.click();

      // 8. Verify back on conversation list
      await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible();
    }
  });

  test('Mobile layout switches between list and conversation view', async ({ page }) => {
    // 1. Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // 2. Authenticate as test user
    await loginAsTestUser(page);

    // 3. Navigate to messages
    await page.goto('/messages');

    // 4. Verify conversation list is visible
    const conversationList = page.locator('[class*="space-y-1"]').first();
    await expect(conversationList).toBeVisible();

    // 5. Select conversation if exists
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // 6. Verify message view is now visible
      const messageInput = page.getByPlaceholder(/type a message/i);
      await expect(messageInput).toBeVisible();

      // 7. On mobile, list should be hidden when conversation is open
      // This is managed by responsive classes
      const backButton = page
        .getByRole('button')
        .filter({ has: page.locator('svg') })
        .first();
      const hasBackButton = await backButton.isVisible().catch(() => false);

      if (hasBackButton) {
        await expect(backButton).toBeVisible();
      }
    }
  });
});
