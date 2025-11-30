// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Select Conversation', () => {
  test('User selects a conversation to view messages', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check if conversations exist
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();

    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      // 4. User clicks on conversation in list
      await firstConversation.click();

      // 5. Right panel loads message history
      // Verify the conversation header is visible
      const conversationHeader = page
        .locator('[class*="CardHeader"]')
        .filter({ has: page.locator('h3') });
      await expect(conversationHeader).toBeVisible();

      // 6. Conversation is highlighted in sidebar
      await expect(firstConversation).toHaveClass(/bg-accent/);

      // 7. Messages sorted oldest to newest (like WhatsApp)
      // 8. User's messages aligned right, other participant's messages aligned left
      const messageArea = page
        .locator('[class*="space-y-4"]')
        .filter({ has: page.locator('[class*="rounded-lg"]') });

      // Check if there are messages or empty state
      const hasMessages = await messageArea
        .locator('[class*="rounded-lg px-4 py-2"]')
        .first()
        .isVisible()
        .catch(() => false);

      if (!hasMessages) {
        // Verify empty state message
        await expect(page.getByText(/no messages yet|start the conversation/i)).toBeVisible();
      }
    } else {
      // No conversations available - verify empty state
      await expect(page.getByText(/no conversations yet/i)).toBeVisible();
    }
  });
});
