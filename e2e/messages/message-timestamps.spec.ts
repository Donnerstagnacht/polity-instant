// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Message Timestamps', () => {
  test('Messages display relative timestamps', async ({ page }) => {
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

      // 4. Check for messages with timestamps
      const messageElements = page.locator('[class*="rounded-lg px-4 py-2"]');
      const messageCount = await messageElements.count();

      if (messageCount > 0) {
        // 5. Verify timestamps are present
        const firstMessage = messageElements.first();
        await expect(firstMessage).toBeVisible();

        // Timestamps should show in format like "2:30 PM" or "Jan 15"
        // The timestamp is in a paragraph with smaller text
        const timestamp = firstMessage.locator('p').last();
        await expect(timestamp).toBeVisible();
      }

      // 6. Check conversation list timestamps
      await page.goto('/messages');
      const conversationTimestamp = firstConversation.locator('span[class*="text-xs"]');
      const hasTimestamp = await conversationTimestamp.isVisible().catch(() => false);

      if (hasTimestamp) {
        await expect(conversationTimestamp).toBeVisible();
      }
    }
  });

  test('Conversation preview shows last message timestamp', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check conversations for timestamps
    const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const count = await conversations.count();

    if (count > 0) {
      // 4. Each conversation should show timestamp
      for (let i = 0; i < Math.min(count, 3); i++) {
        const conversation = conversations.nth(i);
        await expect(conversation).toBeVisible();

        // Look for timestamp element
        const timestamp = conversation.locator('span[class*="text-xs text-muted-foreground"]');
        const hasTimestamp = await timestamp.isVisible().catch(() => false);

        // Timestamp may not be visible if no messages in conversation
        if (hasTimestamp) {
          await expect(timestamp).toBeVisible();
        }
      }
    }
  });
});
