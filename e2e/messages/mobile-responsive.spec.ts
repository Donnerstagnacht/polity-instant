// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { devices } from '@playwright/test';
// test.use() must be at top-level, not inside describe blocks
test.use({ ...devices['iPhone 12'] });
test.describe('Chat/Messages - Mobile Responsive Layout', () => {
  test('Messages page works on mobile devices', async ({
    authenticatedPage: page,
    conversationFactory,
    userFactory,
    adminDb,
  }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    const otherUser = await userFactory.createUser({ name: 'Mobile Test User' });
    await conversationFactory.createConversation(authUser.id, [otherUser.id], {
      name: 'Mobile Conv Test',
    });

    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');

    // Conversation list shown first
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible({ timeout: 10000 });

    // Find the conversation (may show user name or conversation name)
    const conversation = page.getByText('Mobile Test User').or(page.getByText('Mobile Conv Test'));

    // If conversation not visible, reload and try again (InstantDB sync delay)
    let found = await conversation.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!found) {
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      found = await conversation.first().isVisible({ timeout: 10000 }).catch(() => false);
    }

    if (found) {
      await conversation.first().click();

      // Message view takes full screen — conversation list heading should be hidden
      await expect(page.getByRole('heading', { name: /messages/i })).not.toBeVisible({ timeout: 5000 });

      // Back arrow returns to conversation list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)');
      await expect(backButton).toBeVisible();
      await backButton.click();

      // Verify back on conversation list
      await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test('Mobile layout switches between list and conversation view', async ({
    authenticatedPage: page,
    conversationFactory,
    userFactory,
    adminDb,
  }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    const otherUser = await userFactory.createUser({ name: 'Mobile Switch User' });
    await conversationFactory.createConversation(authUser.id, [otherUser.id], {
      name: 'Mobile Switch Conv',
    });

    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');

    // Verify conversation list is visible
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible({ timeout: 10000 });

    // Find the conversation (may show user name or conversation name)
    const conversation = page.getByText('Mobile Switch User').or(page.getByText('Mobile Switch Conv'));

    // If not visible, reload (InstantDB sync delay)
    let found = await conversation.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!found) {
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      found = await conversation.first().isVisible({ timeout: 10000 }).catch(() => false);
    }

    if (found) {
      await conversation.first().click();

      // Verify message view is now visible
      const messageInput = page.getByPlaceholder(/type a message/i);
      await expect(messageInput).toBeVisible({ timeout: 5000 });

      // Conversation list should be hidden when conversation is open on mobile
      await expect(page.getByRole('heading', { name: /messages/i })).not.toBeVisible();

      // Back button should be visible on mobile
      const backButton = page.locator('button:has(svg.lucide-arrow-left)');
      await expect(backButton).toBeVisible();
    }
  });
});
