// spec: Group conversation rename synchronization
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Conversations - Rename Synchronization', () => {
  test('Renaming group updates conversation name', async ({ authenticatedPage: page, groupFactory, adminDb }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    const originalName = `Rename Test ${Date.now()}`;
    const group = await groupFactory.createGroup(authUser.id, { name: originalName });
    await groupFactory.createGroupConversation(group.id, originalName, [authUser.id], authUser.id);

    // Verify conversation exists with original name
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Navigate to group edit page
    await page.goto(`/group/${group.id}/edit`);
    await page.waitForLoadState('domcontentloaded');

    // Change the group name
    const updatedName = `Renamed Group ${Date.now()}`;
    const editNameInput = page.getByLabel(/group name/i).or(page.getByPlaceholder(/group name/i));
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Wait for save and sync to complete (toast appears after syncGroupNameToConversation)
    await expect(page.getByText(/group updated successfully/i)).toBeVisible({ timeout: 10000 });

    // Navigate to messages
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');

    // Verify conversation name is updated
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    // Verify old name is not visible
    const oldNameElement = page.getByText(originalName);
    await expect(oldNameElement).not.toBeVisible();
  });

  test('Group conversation name updates in real-time for all members', async ({
    authenticatedPage: page,
    context,
    groupFactory,
    adminDb,
  }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    const originalName = `Real-time Rename ${Date.now()}`;
    const group = await groupFactory.createGroup(authUser.id, { name: originalName });
    await groupFactory.createGroupConversation(group.id, originalName, [authUser.id], authUser.id);

    // Open messages in first tab
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Open second tab as same user (simulating different device/browser)
    const page2 = await context.newPage();
    await page2.goto('/messages');
    await page2.waitForLoadState('domcontentloaded');
    await expect(page2.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Rename group in first tab
    await page.goto(`/group/${group.id}/edit`);
    await page.waitForLoadState('domcontentloaded');
    const updatedName = `Updated Real-time ${Date.now()}`;
    const editNameInput = page.getByLabel(/group name/i);
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Wait for save and sync to complete
    await expect(page.getByText(/group updated successfully/i)).toBeVisible({ timeout: 10000 });

    // Check first tab shows new name
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    // Check second tab gets updated (refresh to see changes)
    await page2.reload();
    await expect(page2.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    await page2.close();
  });

  test('Conversation name appears correctly in message thread after rename', async ({ authenticatedPage: page, groupFactory, adminDb }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    const originalName = `Thread Rename ${Date.now()}`;
    const group = await groupFactory.createGroup(authUser.id, { name: originalName });
    await groupFactory.createGroupConversation(group.id, originalName, [authUser.id], authUser.id);

    // Go to messages and open the conversation
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    await page.getByText(originalName).click();

    // Verify header shows original name
    await expect(page.getByRole('heading', { name: originalName })).toBeVisible();

    // Rename the group
    await page.goto(`/group/${group.id}/edit`);
    await page.waitForLoadState('domcontentloaded');
    const updatedName = `Thread Updated ${Date.now()}`;
    const editNameInput = page.getByLabel(/group name/i);
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Wait for save and sync to complete
    await expect(page.getByText(/group updated successfully/i)).toBeVisible({ timeout: 10000 });

    // Return to messages
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    await page.getByText(updatedName).click();

    // Verify header shows new name
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
  });
});
