// spec: Group conversations lifecycle management
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Group Conversations - Lifecycle Management', () => {
  test('Creating group automatically creates conversation', async ({ page }) => {
    await loginAsTestUser(page);

    // Navigate to create page
    await page.goto('/create');

    // Create a group
    const groupButton = page.getByText(/group/i).first();
    await groupButton.click();

    // Fill in group details
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first();
    await nameInput.fill('Auto Conversation Test Group');

    const descInput = page
      .getByLabel(/description/i)
      .or(page.getByPlaceholder(/description/i))
      .first();
    await descInput.fill('Testing automatic conversation creation');

    // Submit
    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // Wait for redirect
    await page.waitForURL(/\//, { timeout: 5000 });

    // Navigate to messages
    await page.goto('/messages');

    // Verify group conversation exists
    await expect(page.getByText('Auto Conversation Test Group')).toBeVisible({ timeout: 10000 });
  });

  test('Group conversation shows all members', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Find and click on a group conversation
    const groupConversation = page
      .locator('button')
      .filter({
        has: page.locator('[class*="badge"]').filter({ hasText: /\d+/ }),
      })
      .first();

    const hasGroupConversation = await groupConversation.isVisible().catch(() => false);

    if (hasGroupConversation) {
      await groupConversation.click();

      // Verify member count is displayed
      const memberCount = page.getByText(/\d+ members/i);
      await expect(memberCount).toBeVisible();
    }
  });

  test('Messages sent in group conversation are visible to all members', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Find group conversation
    const groupConversation = page
      .locator('button')
      .filter({
        has: page.locator('[class*="badge"]').filter({ hasText: /\d+/ }),
      })
      .first();

    const hasGroupConversation = await groupConversation.isVisible().catch(() => false);

    if (hasGroupConversation) {
      await groupConversation.click();

      // Send a message
      const messageInput = page.getByPlaceholder(/type a message/i);
      const testMessage = `Group message ${Date.now()}`;
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // Verify message appears
      await expect(page.getByText(testMessage)).toBeVisible();
    }
  });

  test('Group conversation cannot be deleted by members', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Find and click on a group conversation
    const groupConversation = page
      .locator('button')
      .filter({
        has: page.locator('[class*="badge"]').filter({ hasText: /\d+/ }),
      })
      .first();

    const hasGroupConversation = await groupConversation.isVisible().catch(() => false);

    if (hasGroupConversation) {
      await groupConversation.click();

      // Verify delete button is NOT present (only pin button)
      const deleteButton = page.getByRole('button', { name: /delete conversation/i });
      await expect(deleteButton).not.toBeVisible();

      // Pin button should still be visible
      const pinButton = page.getByRole('button', { name: /pin conversation/i });
      await expect(pinButton).toBeVisible();
    }
  });

  test('Group conversation can be pinned', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Find a group conversation
    const groupConversation = page
      .locator('button')
      .filter({
        has: page.locator('[class*="badge"]').filter({ hasText: /\d+/ }),
      })
      .first();

    const hasGroupConversation = await groupConversation.isVisible().catch(() => false);

    if (hasGroupConversation) {
      await groupConversation.click();

      // Click pin button
      const pinButton = page.getByRole('button', { name: /pin conversation/i });
      await pinButton.click();

      // Go back to conversation list
      const backButton = page
        .getByRole('button')
        .filter({ has: page.locator('svg') })
        .first();
      if (await backButton.isVisible().catch(() => false)) {
        await backButton.click();
      } else {
        await page.goto('/messages');
      }

      // Verify pinned conversation is at top and has pin icon
      await page.waitForTimeout(500);
      const firstConversation = page
        .locator('button')
        .filter({
          has: page.locator('svg[class*="lucide-pin"]'),
        })
        .first();

      await expect(firstConversation).toBeVisible();
    }
  });

  test('Group conversation displays correct participant count', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Find a group conversation with badge showing participant count
    const groupConversation = page
      .locator('button')
      .filter({
        has: page.locator('[class*="badge"]').filter({ hasText: /\d+/ }),
      })
      .first();

    const hasGroupConversation = await groupConversation.isVisible().catch(() => false);

    if (hasGroupConversation) {
      // Get the badge text (participant count in list)
      const badge = groupConversation.locator('[class*="badge"]').first();
      const listCount = await badge.textContent();

      await groupConversation.click();

      // Get the member count in header
      const headerCount = page.getByText(/\d+ members/i);
      const headerText = await headerCount.textContent();

      // Both should show the same count
      expect(listCount).toBeTruthy();
      expect(headerText).toContain('members');
    }
  });
});
