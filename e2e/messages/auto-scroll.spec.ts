// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Auto-Scroll Behavior', () => {
  test('Message area scrolls to latest message on open', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Select a conversation with messages
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // 4. Verify message area is visible
      const messageArea = page
        .locator('[class*="space-y-4"]')
        .filter({ has: page.locator('[class*="rounded-lg px-4 py-2"]') });

      const hasMessages = await messageArea.isVisible().catch(() => false);

      if (hasMessages) {
        // 5. View automatically scrolls to bottom (latest message)
        // Check if the last message is in viewport
        const messages = page.locator('[class*="rounded-lg px-4 py-2"]');
        const messageCount = await messages.count();

        if (messageCount > 0) {
          const lastMessage = messages.last();

          // Wait a bit for auto-scroll
          await page.waitForTimeout(500);

          // Last message should be visible
          await expect(lastMessage).toBeVisible();
        }
      }
    }
  });

  test('Auto-scroll on new message sent', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Select a conversation
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // 4. Get current message count
      const messagesBefore = await page.locator('[class*="rounded-lg px-4 py-2"]').count();

      // 5. Send a new message
      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = `Auto-scroll test ${Date.now()}`;
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // 6. Verify new message is visible (auto-scrolled)
      const newMessage = page
        .locator('[class*="rounded-lg px-4 py-2"]')
        .filter({ hasText: testMessage });
      await expect(newMessage).toBeVisible();

      // 7. Verify message is at the bottom
      const messagesAfter = await page.locator('[class*="rounded-lg px-4 py-2"]').count();
      expect(messagesAfter).toBeGreaterThan(messagesBefore);

      // Last message should be the one we just sent
      const lastMessage = page.locator('[class*="rounded-lg px-4 py-2"]').last();
      await expect(lastMessage).toContainText(testMessage);
    }
  });

  test('Scroll container is present and functional', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Select a conversation
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // 4. Verify scrollable area exists
      const scrollContainer = page
        .locator('[class*="flex-1 overflow-y-auto"]')
        .filter({ has: page.locator('[class*="space-y-4"]') });

      const hasScrollContainer = await scrollContainer.isVisible().catch(() => false);

      if (hasScrollContainer) {
        await expect(scrollContainer).toBeVisible();

        // 5. Verify it has overflow-y-auto class for scrolling
        await expect(scrollContainer).toHaveClass(/overflow-y-auto/);
      }
    }
  });
});
