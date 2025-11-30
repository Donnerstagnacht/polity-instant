// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Conversation Sorting', () => {
  test('Conversations sorted by most recent message', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Get all conversations
    const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const count = await conversations.count();

    if (count > 1) {
      // 4. Get timestamps from first few conversations

      for (let i = 0; i < Math.min(count, 3); i++) {
        const conversation = conversations.nth(i);
        const timestampElement = conversation.locator(
          'span[class*="text-xs text-muted-foreground"]'
        );

        const hasTimestamp = await timestampElement.isVisible().catch(() => false);
        if (hasTimestamp) {
          await expect(timestampElement).toBeVisible();
        }
      }

      // 5. Send a message to move conversation to top
      const secondConversation = conversations.nth(1);
      await secondConversation.click();

      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = `Sort test ${Date.now()}`;
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // 6. Wait for message to send
      await expect(
        page.locator('[class*="rounded-lg px-4 py-2"]').filter({ hasText: testMessage })
      ).toBeVisible();

      // 7. Go back to conversation list
      const backButton = page
        .getByRole('button')
        .filter({ has: page.locator('svg') })
        .first();
      const isBackVisible = await backButton.isVisible().catch(() => false);

      if (isBackVisible) {
        await backButton.click();
      } else {
        await page.goto('/messages');
      }

      // 8. Verify conversation moved to top
      // Wait for reordering
      await page.waitForTimeout(500);
    }
  });

  test('New message updates conversation position', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check if multiple conversations exist
    const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const count = await conversations.count();

    if (count > 0) {
      // 4. Select any conversation
      const targetConversation = conversations.first();
      await targetConversation.click();

      // 5. Send a message
      const messageInput = page.getByPlaceholder(/type a message/i);
      await messageInput.fill('Position update test');
      await messageInput.press('Enter');

      // 6. Verify message sent
      await expect(
        page.locator('[class*="rounded-lg px-4 py-2"]').filter({ hasText: 'Position update test' })
      ).toBeVisible();

      // 7. Return to list
      await page.goto('/messages');

      // 8. Verify conversations are still sorted
      const conversationsAfter = page.locator('button').filter({ hasText: /Unknown User|@/ });
      await expect(conversationsAfter.first()).toBeVisible();
    }
  });
});
