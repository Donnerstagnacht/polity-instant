// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Chat/Messages - Send Text Message', () => {
  test('User sends a text message', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Select a conversation or verify conversation exists
    const conversationList = page.locator('main').locator('button').filter({ has: page.locator('p') });
    const conversationCount = await conversationList.count();
    const hasConversations = conversationCount > 0;

    if (hasConversations) {
      const firstConversation = conversationList.first();
      // 4. User has conversation selected
      await firstConversation.click();

      // 5. User types message in input field at bottom
      const messageInput = page.getByPlaceholder(/type a message|write a message/i);
      await expect(messageInput).toBeVisible({ timeout: 10000 });

      const testMessage = `Test message ${Date.now()}`;
      await messageInput.fill(testMessage);

      // 6. User clicks send button or presses Enter
      await messageInput.press('Enter');

      // 7. Message appears in conversation
      await expect(page.getByText(testMessage)).toBeVisible({ timeout: 5000 });

      // 8. Input field clears
      await expect(messageInput).toHaveValue('');
    } else {
      // No conversations available
      await expect(page.getByText(/select a conversation|no conversations/i)).toBeVisible();
    }
  });

  test('User sends message using Enter key', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
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

      // 4. Type message and press Enter
      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = `Enter key test ${Date.now()}`;
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // 5. Verify message appears
      await expect(
        page.locator('[class*="rounded-lg px-4 py-2"]').filter({ hasText: testMessage })
      ).toBeVisible();

      // 6. Verify input cleared
      await expect(messageInput).toHaveValue('');
    }
  });
});
