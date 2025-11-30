// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Load Messages Page', () => {
  test('User accesses the messages page', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /messages
    await page.goto('/messages');

    // 3. Verify page loads with conversation list on left
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible();

    // 4. Verify search bar visible at top
    const searchInput = page.getByPlaceholder(/search conversations/i);
    await expect(searchInput).toBeVisible();

    // 5. Verify message area on right (empty if no conversation selected)
    await expect(page.getByText(/select a conversation/i)).toBeVisible();
    await expect(page.getByText(/choose a conversation from the list/i)).toBeVisible();
  });
});
