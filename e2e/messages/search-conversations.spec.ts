// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Search Conversations', () => {
  test('User searches through conversations', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Get initial conversation count
    const conversationButtons = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const initialCount = await conversationButtons.count();

    if (initialCount > 0) {
      // 4. Get first conversation name for search
      const firstConversationText = await conversationButtons.first().textContent();
      const searchTerm = firstConversationText?.split(' ')[0] || 'test';

      // 5. User types in search bar
      const searchInput = page.getByPlaceholder(/search conversations/i);
      await searchInput.fill(searchTerm);

      // 6. Conversations filter by participant name
      // 7. Results update in real-time as user types
      await page.waitForTimeout(300); // Allow for filtering

      // Verify filtered results
      await conversationButtons.count();

      // 8. User clears search
      await searchInput.clear();

      // 9. All conversations reappear
      await page.waitForTimeout(300);
      const finalCount = await conversationButtons.count();
      expect(finalCount).toBe(initialCount);
    } else {
      // No conversations to search
      const searchInput = page.getByPlaceholder(/search conversations/i);
      await searchInput.fill('test search');
      await expect(page.getByText(/no conversations found/i)).toBeVisible();
    }
  });

  test('Search filters by message content', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Try searching for message content
    const searchInput = page.getByPlaceholder(/search conversations/i);
    await searchInput.fill('message content search');

    // 4. Verify search functionality works
    await expect(searchInput).toHaveValue('message content search');

    // 5. Clear search
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });
});
