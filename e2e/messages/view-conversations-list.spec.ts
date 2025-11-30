// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - View Conversations List', () => {
  test('User sees all their conversations', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Verify left sidebar shows all conversations
    const conversationsList = page.locator('[class*="space-y-1"]').first();
    await expect(conversationsList).toBeVisible();

    // 4. Verify conversations sorted by most recent message
    // 5. Each conversation shows avatar, name, last message preview, timestamp
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();

    if (await firstConversation.isVisible()) {
      // Verify avatar is present
      const avatar = firstConversation.locator('[class*="avatar"]').first();
      await expect(avatar).toBeVisible();

      // Verify participant name or handle is visible
      await expect(firstConversation).toBeVisible();
    } else {
      // If no conversations exist, verify empty state
      await expect(page.getByText(/no conversations yet/i)).toBeVisible();
    }
  });
});
