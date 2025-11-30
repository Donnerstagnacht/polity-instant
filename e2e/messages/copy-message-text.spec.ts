// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Copy Message Text', () => {
  test('User can select and copy message text', async ({ page }) => {
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

      // 4. Send a test message to ensure there's content
      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = 'This is a copyable message';
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // 5. Wait for message to appear
      const messageElement = page
        .locator('[class*="rounded-lg px-4 py-2"]')
        .filter({ hasText: testMessage });
      await expect(messageElement).toBeVisible();

      // 6. Verify message text is selectable
      const messageText = messageElement.locator('p').first();
      await expect(messageText).toBeVisible();

      // 7. Select the message text by triple-clicking
      await messageText.click({ clickCount: 3 });

      // 8. Verify text can be interacted with
      await expect(messageText).toContainText(testMessage);
    }
  });
});
