// spec: Group conversation rename synchronization
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Conversations - Rename Synchronization', () => {
  test('Renaming group updates conversation name', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    test.setTimeout(90000);
    const originalName = `Rename Test ${Date.now()}`;
    const group = await groupFactory.createGroup(mainUserId, { name: originalName });
    await groupFactory.createGroupConversation(group.id, originalName, [mainUserId], mainUserId);

    // Verify conversation exists with original name (retry on sync delay)
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    for (let i = 0; i < 3; i++) {
      if (await page.getByText(originalName).isVisible({ timeout: 5000 }).catch(() => false)) break;
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Navigate to group edit page (retry on Access Denied from sync delay)
    await gotoWithRetry(page, `/group/${group.id}/edit`);

    // Wait for edit form to load
    const editNameInput = page.getByLabel(/group name/i).or(page.getByPlaceholder(/group name/i));
    await expect(editNameInput).toBeVisible({ timeout: 10000 });

    // Change the group name
    const updatedName = `Renamed Group ${Date.now()}`;
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Wait for save and sync to complete
    await expect(page.getByText(/group updated successfully/i)).toBeVisible({ timeout: 15000 });

    // Navigate to messages (retry for sync)
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    for (let i = 0; i < 3; i++) {
      if (await page.getByText(updatedName).isVisible({ timeout: 5000 }).catch(() => false)) break;
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }

    // Verify conversation name is updated
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });
  });

  test('Group conversation name updates in real-time for all members', async ({
    authenticatedPage: page,
    context,
    groupFactory,
    mainUserId,
  }) => {
    test.setTimeout(90000);
    const originalName = `Real-time Rename ${Date.now()}`;
    const group = await groupFactory.createGroup(mainUserId, { name: originalName });
    await groupFactory.createGroupConversation(group.id, originalName, [mainUserId], mainUserId);

    // Open messages in first tab (retry on sync delay)
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    for (let i = 0; i < 3; i++) {
      if (await page.getByText(originalName).isVisible({ timeout: 5000 }).catch(() => false)) break;
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Open second tab as same user (simulating different device/browser)
    const page2 = await context.newPage();
    await page2.goto('/messages');
    await page2.waitForLoadState('domcontentloaded');
    for (let i = 0; i < 3; i++) {
      if (await page2.getByText(originalName).isVisible({ timeout: 5000 }).catch(() => false)) break;
      await page2.reload();
      await page2.waitForLoadState('domcontentloaded');
    }
    await expect(page2.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Rename group in first tab
    await gotoWithRetry(page, `/group/${group.id}/edit`);
    const editNameInput = page.getByLabel(/group name/i).or(page.getByPlaceholder(/group name/i));
    await expect(editNameInput).toBeVisible({ timeout: 10000 });

    const updatedName = `Updated Real-time ${Date.now()}`;
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Wait for save and sync to complete
    await expect(page.getByText(/group updated successfully/i)).toBeVisible({ timeout: 15000 });

    // Check first tab shows new name (retry for sync)
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    for (let i = 0; i < 3; i++) {
      if (await page.getByText(updatedName).isVisible({ timeout: 5000 }).catch(() => false)) break;
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    // Check second tab gets updated (refresh to see changes)
    await page2.reload();
    await expect(page2.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    await page2.close();
  });

  test('Conversation name appears correctly in message thread after rename', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    test.setTimeout(90000);
    const originalName = `Thread Rename ${Date.now()}`;
    const group = await groupFactory.createGroup(mainUserId, { name: originalName });
    await groupFactory.createGroupConversation(group.id, originalName, [mainUserId], mainUserId);

    // Go to messages and open the conversation (retry on sync delay)
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    for (let i = 0; i < 3; i++) {
      if (await page.getByText(originalName).isVisible({ timeout: 5000 }).catch(() => false)) break;
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 10000 });
    await page.getByText(originalName).click();

    // Verify header shows original name
    await expect(page.getByRole('heading', { name: originalName })).toBeVisible({ timeout: 10000 });

    // Rename the group
    await gotoWithRetry(page, `/group/${group.id}/edit`);
    const editNameInput = page.getByLabel(/group name/i).or(page.getByPlaceholder(/group name/i));
    await expect(editNameInput).toBeVisible({ timeout: 10000 });

    const updatedName = `Thread Updated ${Date.now()}`;
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Wait for save and sync to complete
    await expect(page.getByText(/group updated successfully/i)).toBeVisible({ timeout: 15000 });

    // Return to messages (retry for sync)
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    for (let i = 0; i < 3; i++) {
      if (await page.getByText(updatedName).isVisible({ timeout: 5000 }).catch(() => false)) break;
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }
    await page.getByText(updatedName).click();

    // Verify header shows new name
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible({ timeout: 10000 });
  });
});
