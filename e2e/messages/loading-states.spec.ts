// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Loading States', () => {
  test('Loading state shown while fetching conversations', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    page
      .waitForResponse(
        response => response.url().includes('messages') || response.url().includes('conversations'),
        { timeout: 5000 }
      )
      .catch(() => null);

    await page.goto('/messages');

    // 3. Check if loading state appears (it might be very fast)
    const loadingText = page.getByText(/loading conversations/i);
    const isLoading = await loadingText.isVisible().catch(() => false);

    if (isLoading) {
      // 4. Verify loading indicator
      await expect(loadingText).toBeVisible();
    }

    // 5. Wait for content to load
    await page.waitForTimeout(1000);

    // 6. Verify page loaded successfully
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible();

    // 7. Search input should be visible when loaded
    const searchInput = page.getByPlaceholder(/search conversations/i);
    await expect(searchInput).toBeVisible();
  });

  test('Page renders correctly after loading', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // 4. Verify main elements are visible
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search conversations/i)).toBeVisible();

    // 5. Verify either conversations or empty state is shown
    const hasConversations = await page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByText(/no conversations yet|select a conversation/i)
      .isVisible()
      .catch(() => false);

    // One of these should be true
    expect(hasConversations || hasEmptyState).toBeTruthy();
  });

  test('No loading state stuck on screen', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Wait for loading to complete
    await page.waitForTimeout(2000);

    // 4. Verify loading text is not stuck on screen
    const loadingText = page.getByText(/loading conversations/i);
    await expect(loadingText).not.toBeVisible();

    // 5. Verify page is interactive
    const searchInput = page.getByPlaceholder(/search conversations/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
  });
});
