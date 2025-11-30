// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Message Alignment', () => {
  test('User messages aligned right, other messages aligned left', async ({ page }) => {
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

      // 4. Send a message from current user
      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = `Test alignment ${Date.now()}`;
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // 5. Verify user's message is aligned right
      const userMessage = page
        .locator('[class*="rounded-lg px-4 py-2"]')
        .filter({ hasText: testMessage })
        .last();
      await expect(userMessage).toBeVisible();

      // 6. Check if message has primary background (user's messages)
      const messageContainer = userMessage.locator('..');
      const hasRightAlignment = await messageContainer.evaluate(el => {
        return el.className.includes('flex-row-reverse');
      });

      // User's messages should have flex-row-reverse class
      expect(hasRightAlignment).toBeTruthy();

      // 7. Verify other participant's messages (if any) are aligned left
      const allMessages = page.locator('[class*="rounded-lg px-4 py-2"]');
      const messageCount = await allMessages.count();

      if (messageCount > 1) {
        // Check first message (likely from other user)
        const otherMessage = allMessages.first();
        const otherContainer = otherMessage.locator('..');

        const otherAlignment = await otherContainer.evaluate(el => {
          return el.className.includes('flex-row-reverse');
        });

        // Other user's messages should NOT have flex-row-reverse
        const isOwnMessage = await otherMessage.evaluate(el => {
          return el.className.includes('bg-primary');
        });

        if (!isOwnMessage) {
          expect(otherAlignment).toBeFalsy();
        }
      }
    }
  });

  test('Message bubbles have correct styling', async ({ page }) => {
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

      // 4. Send a message
      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = 'Styling test message';
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // 5. Verify message bubble styling
      const messageBubble = page
        .locator('[class*="rounded-lg px-4 py-2"]')
        .filter({ hasText: testMessage })
        .last();
      await expect(messageBubble).toBeVisible();

      // 6. User's messages should have primary background
      await expect(messageBubble).toHaveClass(/bg-primary/);

      // 7. Check for text styling
      await expect(messageBubble).toHaveClass(/text-primary-foreground/);
    }
  });
});
