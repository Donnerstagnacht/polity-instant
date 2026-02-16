// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Chat/Messages - View Conversations List', () => {
  test('User sees all their conversations', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Verify conversations list or empty state
    const conversationList = page.locator('main').locator('button').filter({ has: page.locator('p') });
    const conversationCount = await conversationList.count();

    if (conversationCount > 0) {
      const firstConversation = conversationList.first();
      // Verify conversation item is visible
      await expect(firstConversation).toBeVisible();
    } else {
      // If no conversations exist, verify empty state
      await expect(page.getByText(/select a conversation|no conversations/i)).toBeVisible();
    }
  });
});
