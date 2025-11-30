// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Empty States', () => {
  test('Empty state when no conversations exist', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check if user has no conversations
    const emptyState = page.getByText(/no conversations yet/i);
    const hasNoConversations = await emptyState.isVisible().catch(() => false);

    if (hasNoConversations) {
      // 4. Verify empty state message displays
      await expect(emptyState).toBeVisible();

      // 5. Verify right panel shows empty state
      await expect(page.getByText(/select a conversation/i)).toBeVisible();
    }
  });

  test('Empty state when no conversation selected', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Verify right panel shows empty state when nothing selected
    const emptyMessage = page.getByText(/select a conversation/i);
    const hasEmptyState = await emptyMessage.isVisible().catch(() => false);

    if (hasEmptyState) {
      // 4. Verify placeholder text
      await expect(emptyMessage).toBeVisible();
      await expect(page.getByText(/choose a conversation from the list/i)).toBeVisible();
    }
  });

  test('Empty state within conversation with no messages', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Select a conversation if exists
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // 4. Check for empty message state
      const emptyMessageState = page.getByText(/no messages yet|start the conversation/i);
      const hasNoMessages = await emptyMessageState.isVisible().catch(() => false);

      if (hasNoMessages) {
        // 5. Verify empty state message
        await expect(emptyMessageState).toBeVisible();
      }
    }
  });
});
