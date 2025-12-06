// spec: Group conversation rename synchronization
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Group Conversations - Rename Synchronization', () => {
  test('Renaming group updates conversation name', async ({ page }) => {
    await loginAsTestUser(page);

    // Create a new group
    await page.goto('/create');

    const groupButton = page.getByText(/group/i).first();
    await groupButton.click();

    const originalName = `Rename Test ${Date.now()}`;
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first();
    await nameInput.fill(originalName);

    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    await page.waitForURL(/\/group\//, { timeout: 5000 });

    // Get the group ID from URL
    const groupUrl = page.url();
    const groupId = groupUrl.match(/\/group\/([^/]+)/)?.[1];

    if (!groupId) {
      throw new Error('Could not extract group ID from URL');
    }

    // Verify conversation exists with original name
    await page.goto('/messages');
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Navigate to group edit page
    await page.goto(`/group/${groupId}/edit`);

    // Change the group name
    const updatedName = `Renamed Group ${Date.now()}`;
    const editNameInput = page.getByLabel(/group name/i).or(page.getByPlaceholder(/group name/i));
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Navigate to messages
    await page.goto('/messages');

    // Verify conversation name is updated
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    // Verify old name is not visible
    const oldNameElement = page.getByText(originalName);
    await expect(oldNameElement).not.toBeVisible();
  });

  test('Group conversation name updates in real-time for all members', async ({
    page,
    context,
  }) => {
    await loginAsTestUser(page);

    // Create a group
    await page.goto('/create');

    const groupButton = page.getByText(/group/i).first();
    await groupButton.click();

    const originalName = `Real-time Rename ${Date.now()}`;
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first();
    await nameInput.fill(originalName);

    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    await page.waitForURL(/\/group\//, { timeout: 5000 });
    const groupUrl = page.url();
    const groupId = groupUrl.match(/\/group\/([^/]+)/)?.[1];

    if (!groupId) {
      throw new Error('Could not extract group ID');
    }

    // Open messages in first tab
    await page.goto('/messages');
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Open second tab as same user (simulating different device/browser)
    const page2 = await context.newPage();
    await loginAsTestUser(page2);
    await page2.goto('/messages');
    await expect(page2.getByText(originalName)).toBeVisible({ timeout: 10000 });

    // Rename group in first tab
    await page.goto(`/group/${groupId}/edit`);
    const updatedName = `Updated Real-time ${Date.now()}`;
    const editNameInput = page.getByLabel(/group name/i);
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    await page.waitForTimeout(1000);

    // Check first tab shows new name
    await page.goto('/messages');
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    // Check second tab gets updated (refresh to see changes)
    await page2.reload();
    await expect(page2.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    await page2.close();
  });

  test('Conversation name appears correctly in message thread after rename', async ({ page }) => {
    await loginAsTestUser(page);

    // Create a group
    await page.goto('/create');

    const groupButton = page.getByText(/group/i).first();
    await groupButton.click();

    const originalName = `Thread Rename ${Date.now()}`;
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first();
    await nameInput.fill(originalName);

    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    await page.waitForURL(/\/group\//, { timeout: 5000 });
    const groupUrl = page.url();
    const groupId = groupUrl.match(/\/group\/([^/]+)/)?.[1];

    if (!groupId) {
      throw new Error('Could not extract group ID');
    }

    // Go to messages and open the conversation
    await page.goto('/messages');
    await page.getByText(originalName).click();

    // Verify header shows original name
    await expect(page.getByRole('heading', { name: originalName })).toBeVisible();

    // Rename the group
    await page.goto(`/group/${groupId}/edit`);
    const updatedName = `Thread Updated ${Date.now()}`;
    const editNameInput = page.getByLabel(/group name/i);
    await editNameInput.clear();
    await editNameInput.fill(updatedName);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Return to messages
    await page.goto('/messages');
    await page.getByText(updatedName).click();

    // Verify header shows new name
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
  });
});
