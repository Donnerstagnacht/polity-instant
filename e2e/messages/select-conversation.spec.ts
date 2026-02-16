// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Chat/Messages - Select Conversation', () => {
  test('User selects a conversation to view messages', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check if conversations exist - look for conversation items (buttons with text in main)
    const conversationList = page.locator('main').locator('button').filter({ has: page.locator('p') });
    const conversationCount = await conversationList.count();
    const hasConversations = conversationCount > 0;

    if (hasConversations) {
      const firstConversation = conversationList.first();
      // 4. User clicks on conversation in list
      await firstConversation.click();

      // 5. Right panel loads message history
      // Verify the conversation header is visible
      const conversationHeader = page.locator('main h3, main h2').first();
      await expect(conversationHeader).toBeVisible();
    } else {
      // No conversations available - verify empty state
      await expect(page.getByText(/select a conversation|no conversations/i)).toBeVisible();
    }
  });
});
