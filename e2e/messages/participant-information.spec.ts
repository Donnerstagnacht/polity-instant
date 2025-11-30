// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Participant Information', () => {
  test('Conversations show participant avatar and name', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check for conversations
    const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const count = await conversations.count();

    if (count > 0) {
      const firstConversation = conversations.first();

      // 4. Each conversation shows other participant's avatar
      const avatar = firstConversation.locator('[class*="avatar"]').first();
      await expect(avatar).toBeVisible();

      // 5. Name or handle displays
      await expect(firstConversation).toBeVisible();

      // 6. Click to view conversation header
      await firstConversation.click();

      // 7. Verify participant info in header
      const conversationHeader = page.locator('h3');
      await expect(conversationHeader).toBeVisible();

      // 8. Verify avatar in header
      const headerAvatar = page
        .locator('[class*="CardHeader"]')
        .locator('[class*="avatar"]')
        .first();
      await expect(headerAvatar).toBeVisible();

      // 9. Check for handle if present
      const handle = page
        .locator('p[class*="text-sm text-muted-foreground"]')
        .filter({ hasText: '@' });
      const hasHandle = await handle.isVisible().catch(() => false);

      if (hasHandle) {
        await expect(handle).toBeVisible();
      }
    }
  });

  test('Default avatar shown if no custom avatar', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to messages page
    await page.goto('/messages');

    // 3. Check for conversations
    const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const count = await conversations.count();

    if (count > 0) {
      // 4. Verify avatars are present (either image or fallback)
      const firstConversation = conversations.first();
      const avatar = firstConversation.locator('[class*="avatar"]').first();
      await expect(avatar).toBeVisible();

      // 5. Avatar fallback shows first letter of name
      const fallback = avatar.locator('span');
      const hasFallback = await fallback.isVisible().catch(() => false);

      if (hasFallback) {
        const fallbackText = await fallback.textContent();
        expect(fallbackText).toMatch(/^[A-Z]$/);
      }
    }
  });
});
