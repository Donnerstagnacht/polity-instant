// spec: Group conversation member synchronization
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Group Conversations - Member Synchronization', () => {
  test('Joining group adds user to group conversation', async ({ page }) => {
    await loginAsTestUser(page);

    // Find a public group to join
    await page.goto('/search?type=groups');

    // Find a group with "Join" or "Request to Join" button
    const joinButton = page.getByRole('button', { name: /request to join|join/i }).first();
    const hasJoinableGroup = await joinButton.isVisible().catch(() => false);

    if (hasJoinableGroup) {
      // Get the group name before joining
      const groupCard = joinButton
        .locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "Card")]')
        .first();
      const groupName = await groupCard.getByRole('heading').first().textContent();

      // Join the group
      await joinButton.click();
      await page.waitForTimeout(1000);

      // Navigate to messages
      await page.goto('/messages');

      // Verify group conversation appears
      if (groupName) {
        await expect(page.getByText(groupName)).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('Leaving group removes user from conversation', async ({ page }) => {
    await loginAsTestUser(page);

    // Go to messages to find a group conversation
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
      // Navigate to the group page (assuming we can extract group ID)
      // For now, we'll navigate to search and find the group
      await page.goto('/search?type=groups');

      // Find the "Leave Group" button for a group
      const groupCards = page.getByRole('article').or(page.locator('[data-entity-type="group"]'));
      const leaveButton = page.getByRole('button', { name: /leave group/i }).first();
      const canLeave = await leaveButton.isVisible().catch(() => false);

      if (canLeave) {
        // Leave the group
        const groupCard = groupCards.first();
        const groupName = await groupCard.textContent();
        await leaveButton.click();
        await page.waitForTimeout(1000);

        // Navigate to messages
        await page.goto('/messages');

        // Verify group conversation is no longer visible
        if (groupName) {
          const removedConversation = page.getByText(groupName);
          await expect(removedConversation).not.toBeVisible();
        }
      }
    }
  });

  test('Accepting group invitation adds user to conversation', async ({ page }) => {
    await loginAsTestUser(page);

    // Check if there are any group invitations
    await page.goto('/');

    // Look for group invitation notifications or invitations
    const acceptInviteButton = page.getByRole('button', { name: /accept.*invitation/i }).first();
    const hasInvitation = await acceptInviteButton.isVisible().catch(() => false);

    if (hasInvitation) {
      // Accept the invitation
      await acceptInviteButton.click();
      await page.waitForTimeout(1000);

      // Navigate to messages
      await page.goto('/messages');

      // Verify group conversation appears
      const conversations = page.locator('button').filter({
        has: page.locator('[class*="badge"]'),
      });

      const count = await conversations.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('Group creator is automatically added to conversation', async ({ page }) => {
    await loginAsTestUser(page);

    // Create a new group
    await page.goto('/create');

    const groupButton = page.getByText(/group/i).first();
    await groupButton.click();

    const uniqueName = `Member Sync Test ${Date.now()}`;
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first();
    await nameInput.fill(uniqueName);

    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    await page.waitForURL(/\//, { timeout: 5000 });

    // Navigate to messages
    await page.goto('/messages');

    // Verify conversation exists
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10000 });

    // Click on it
    await page.getByText(uniqueName).click();

    // Verify "1 members" or similar
    await expect(page.getByText(/1 member/i)).toBeVisible();
  });

  test('Multiple members can see the same group conversation', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/messages');

    // Find a group conversation with multiple members
    const groupConversation = page
      .locator('button')
      .filter({
        has: page.locator('[class*="badge"]').filter({ hasText: /[2-9]\d*/ }), // 2 or more members
      })
      .first();

    const hasMultiMemberGroup = await groupConversation.isVisible().catch(() => false);

    if (hasMultiMemberGroup) {
      const badge = groupConversation.locator('[class*="badge"]').first();
      const memberCountText = await badge.textContent();
      const memberCount = parseInt(memberCountText || '0');

      // Verify member count is greater than 1
      expect(memberCount).toBeGreaterThan(1);

      await groupConversation.click();

      // Verify header shows same count
      const headerCount = page.getByText(new RegExp(`${memberCount} members`, 'i'));
      await expect(headerCount).toBeVisible();
    }
  });
});
