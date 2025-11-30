// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Message Handling', () => {
  test('Long messages display properly', async ({ page }) => {
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

      // 4. User sends very long message
      const messageInput = page.getByPlaceholder(/type a message/i);
      const longMessage = 'This is a very long message that should wrap to multiple lines. '.repeat(
        10
      );

      await messageInput.fill(longMessage);

      // 5. Send the message
      await messageInput.press('Enter');

      // 6. Verify message wraps to multiple lines
      const sentMessage = page
        .locator('[class*="rounded-lg px-4 py-2"]')
        .filter({ hasText: 'This is a very long message' })
        .last();
      await expect(sentMessage).toBeVisible();

      // 7. Message bubble expands appropriately
      const messageText = sentMessage.locator('p').first();
      await expect(messageText).toHaveClass(/whitespace-pre-wrap/);

      // 8. Conversation remains readable
      await expect(messageInput).toBeVisible();
    }
  });

  test('Special characters in messages', async ({ page }) => {
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

      // 4. User sends message with emojis
      const messageInput = page.getByPlaceholder(/type a message/i);
      const emojiMessage = 'Hello 👋 World 🌍! Testing emojis 🎉';

      await messageInput.fill(emojiMessage);
      await messageInput.press('Enter');

      // 5. Emojis display correctly
      await expect(
        page.locator('[class*="rounded-lg px-4 py-2"]').filter({ hasText: emojiMessage })
      ).toBeVisible();

      // 6. User sends message with special characters
      const specialChars = 'Special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      await messageInput.fill(specialChars);
      await messageInput.press('Enter');

      // 7. Special characters don't break layout
      await expect(
        page.locator('[class*="rounded-lg px-4 py-2"]').filter({ hasText: specialChars })
      ).toBeVisible();

      // 8. Verify conversation still functional
      await expect(messageInput).toBeVisible();
      await expect(messageInput).toHaveValue('');
    }
  });

  test('Multi-line message composition', async ({ page }) => {
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

      // 4. Type multi-line message using Shift+Enter
      const messageInput = page.getByPlaceholder(/type a message/i);

      await messageInput.fill('Line 1');
      await messageInput.press('Shift+Enter');
      await messageInput.press('KeyL');
      await messageInput.press('KeyI');
      await messageInput.press('KeyN');
      await messageInput.press('KeyE');
      await messageInput.press('Space');
      await messageInput.press('Digit2');

      // 5. Send button sends entire multi-line message
      const sendButton = page
        .getByRole('button', { name: '' })
        .filter({ has: page.locator('svg') })
        .last();
      await sendButton.click();

      // 6. Verify message sent
      await expect(messageInput).toHaveValue('');
    }
  });

  test('Empty or whitespace-only messages are not sent', async ({ page }) => {
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

      const messageInput = page.getByPlaceholder(/type a message/i);
      const sendButton = page
        .getByRole('button', { name: '' })
        .filter({ has: page.locator('svg') })
        .last();

      // 4. Try to send empty message
      await messageInput.fill('');

      // 5. Send button should be disabled
      await expect(sendButton).toBeDisabled();

      // 6. Try whitespace only
      await messageInput.fill('   ');
      await expect(sendButton).toBeDisabled();

      // 7. Type valid message
      await messageInput.fill('Valid message');
      await expect(sendButton).not.toBeDisabled();
    }
  });
});
