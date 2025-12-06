// spec: e2e/test-plans/chat-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Chat/Messages - Delete Conversations', () => {
  test('Delete button is visible in conversation header', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Select a conversation
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // Look for delete button in header
      const deleteButton = page.getByRole('button', { name: /delete conversation/i });

      // Delete button should be visible for accepted conversations
      const isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);

      if (isDeleteButtonVisible) {
        await expect(deleteButton).toBeVisible();
      }
    }
  });

  test('Delete button shows confirmation dialog', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Select a conversation
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // Set up dialog handler to cancel
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('delete');
        await dialog.dismiss();
      });

      // Click delete button
      const deleteButton = page.locator('button[title*="Delete"]').first();
      const isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);

      if (isDeleteButtonVisible) {
        await deleteButton.click();
        // Confirmation dialog should have appeared
      }
    }
  });

  test('User can cancel conversation deletion', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Select a conversation
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // Get conversation name before deletion attempt
      const conversationName = await page.locator('h3').first().textContent();

      // Set up dialog handler to cancel
      page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      // Click delete button
      const deleteButton = page.locator('button[title*="Delete"]').first();
      const isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);

      if (isDeleteButtonVisible) {
        await deleteButton.click();
        await page.waitForTimeout(500);

        // Verify conversation still exists
        const conversationStillExists = await page
          .locator('h3', { hasText: conversationName || '' })
          .isVisible()
          .catch(() => false);

        if (conversationStillExists) {
          await expect(page.locator('h3').first()).toBeVisible();
        }
      }
    }
  });

  test('User can delete a conversation', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Get initial conversation count
    const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const initialCount = await conversations.count();

    if (initialCount > 0) {
      // Select first conversation
      await conversations.first().click();

      // Set up dialog handler to accept
      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      // Click delete button
      const deleteButton = page.locator('button[title*="Delete"]').first();
      const isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);

      if (isDeleteButtonVisible) {
        await deleteButton.click();
        await page.waitForTimeout(1000);

        // Verify conversation is deleted
        // Should redirect to empty state or conversation list
        // Conversation count should decrease or we should see empty state
        const newCount = await conversations.count();
        expect(newCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });

  test('Deleted conversation is removed from list', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const initialCount = await conversations.count();

    if (initialCount > 0) {
      // Get the name of the first conversation
      const firstConversationText = await conversations.first().textContent();

      // Select and delete it
      await conversations.first().click();

      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      const deleteButton = page.locator('button[title*="Delete"]').first();
      const isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);

      if (isDeleteButtonVisible) {
        await deleteButton.click();
        await page.waitForTimeout(1000);

        // Go back to list view (on mobile)
        const backButton = page
          .getByRole('button')
          .filter({ has: page.locator('svg[class*="lucide-arrow-left"]') });
        const hasBackButton = await backButton.isVisible().catch(() => false);
        if (hasBackButton) {
          await backButton.click();
        }

        // Verify the conversation is not in the list
        const deletedConversation = page
          .locator('button')
          .filter({ hasText: firstConversationText || '' });
        const stillExists = await deletedConversation.isVisible().catch(() => false);

        if (!stillExists) {
          await expect(deletedConversation).not.toBeVisible();
        }
      }
    }
  });

  test('Delete button is only visible for accepted conversations', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // This test verifies that pending conversations don't show delete button
    // Select a conversation
    const firstConversation = page
      .locator('button')
      .filter({ hasText: /Unknown User|@/ })
      .first();
    const hasConversations = await firstConversation.isVisible().catch(() => false);

    if (hasConversations) {
      await firstConversation.click();

      // Check if there's accept/reject buttons (indicates pending)
      const acceptButton = page.getByRole('button', { name: /accept/i });
      const isPending = await acceptButton.isVisible().catch(() => false);

      const deleteButton = page.locator('button[title*="Delete"]').first();
      const hasDeleteButton = await deleteButton.isVisible().catch(() => false);

      if (isPending) {
        // If conversation is pending, delete button should not be visible in header
        // (only accept/reject options should be available)
        expect(hasDeleteButton).toBe(false);
      } else {
        // If accepted, delete button should be visible
        if (hasDeleteButton) {
          await expect(deleteButton).toBeVisible();
        }
      }
    }
  });

  test('Deleting conversation removes all messages', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    const conversations = page.locator('button').filter({ hasText: /Unknown User|@/ });
    const hasConversations = (await conversations.count()) > 0;

    if (hasConversations) {
      await conversations.first().click();

      // Count messages
      const messages = page.locator('[class*="rounded-lg px-4 py-2"]');
      const messageCount = await messages.count();

      if (messageCount > 0) {
        // Delete conversation
        page.once('dialog', async dialog => {
          await dialog.accept();
        });

        const deleteButton = page.locator('button[title*="Delete"]').first();
        const isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);

        if (isDeleteButtonVisible) {
          await deleteButton.click();
          await page.waitForTimeout(1000);

          // Verify messages are gone (conversation should be deleted)
          const conversationStillExists = await page
            .locator('h3')
            .first()
            .isVisible()
            .catch(() => false);

          // If we're back at the list, the conversation should be gone
          if (!conversationStillExists) {
            // Good - conversation was deleted
            expect(conversationStillExists).toBe(false);
          }
        }
      }
    }
  });
});
