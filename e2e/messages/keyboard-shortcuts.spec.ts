// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Keyboard Shortcuts', () => {
  test('Enter key sends message', async ({ page }) => {
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

      // 4. User presses Enter to send message
      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = `Enter key ${Date.now()}`;

      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // 5. Verify message sent
      await expect(
        page.locator('[class*="rounded-lg px-4 py-2"]').filter({ hasText: testMessage })
      ).toBeVisible();

      // 6. Input field cleared
      await expect(messageInput).toHaveValue('');
    }
  });

  test('Shift+Enter creates new line without sending', async ({ page }) => {
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

      // 4. User presses Shift+Enter
      const messageInput = page.getByPlaceholder(/type a message/i);

      await messageInput.fill('Line 1');
      const initialMessageCount = await page.locator('[class*="rounded-lg px-4 py-2"]').count();

      // 5. Press Shift+Enter (should create new line, not send)
      await messageInput.press('Shift+Enter');

      // 6. Wait a moment
      await page.waitForTimeout(300);

      // 7. Verify message was NOT sent
      const currentMessageCount = await page.locator('[class*="rounded-lg px-4 py-2"]').count();
      expect(currentMessageCount).toBe(initialMessageCount);

      // 8. Input should still have content
      const inputValue = await messageInput.inputValue();
      expect(inputValue).toContain('Line 1');
    }
  });

  test('Input focus management', async ({ page }) => {
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

      // 4. Click in message input
      const messageInput = page.getByPlaceholder(/type a message/i);
      await messageInput.click();

      // 5. Verify input is focused
      await expect(messageInput).toBeFocused();

      // 6. Type and send message
      await messageInput.fill('Focus test');
      await messageInput.press('Enter');

      // 7. Wait for send
      await page.waitForTimeout(300);

      // 8. Input should be ready for next message
      await expect(messageInput).toHaveValue('');
    }
  });

  test('Send button works as alternative to Enter', async ({ page }) => {
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

      // 4. Type message
      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = `Send button ${Date.now()}`;
      await messageInput.fill(testMessage);

      // 5. Click send button
      const sendButton = page
        .getByRole('button', { name: '' })
        .filter({ has: page.locator('svg') })
        .last();
      await sendButton.click();

      // 6. Verify message sent
      await expect(
        page.locator('[class*="rounded-lg px-4 py-2"]').filter({ hasText: testMessage })
      ).toBeVisible();

      // 7. Input cleared
      await expect(messageInput).toHaveValue('');
    }
  });
});
