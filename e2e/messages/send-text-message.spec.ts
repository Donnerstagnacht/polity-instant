// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Send Text Message', () => {
  test('User sends a text message', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Select a conversation or verify conversation exists
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();

    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      // 4. User has conversation selected
      await firstConversation.click();

      // Get the count of existing messages
      const messagesBefore = await page.locator('[class*="rounded-lg px-4 py-2"]').count();

      // 5. User types message in input field at bottom
      const messageInput = page.getByPlaceholder(/type a message/i);
      await expect(messageInput).toBeVisible();

      const testMessage = `Test message ${Date.now()}`;
      await messageInput.fill(testMessage);

      // 6. User clicks send button or presses Enter
      const sendButton = page
        .getByRole('button', { name: '' })
        .filter({ has: page.locator('svg') })
        .last();
      await sendButton.click();

      // 7. Message appears in conversation immediately
      await expect(
        page.locator('[class*="rounded-lg px-4 py-2"]').filter({ hasText: testMessage })
      ).toBeVisible();

      // 8. Input field clears
      await expect(messageInput).toHaveValue('');

      // 9. Verify message count increased
      const messagesAfter = await page.locator('[class*="rounded-lg px-4 py-2"]').count();
      expect(messagesAfter).toBeGreaterThan(messagesBefore);
    } else {
      // No conversations available
      await expect(page.getByText(/no conversations yet/i)).toBeVisible();
    }
  });

  test('User sends message using Enter key', async ({ page }) => {
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
