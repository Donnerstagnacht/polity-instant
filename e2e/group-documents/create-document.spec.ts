import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Documents - Create Document', () => {
  test('should open Create New Document dialog', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Create Doc Group' });
    await gotoWithRetry(page, `/group/${group.id}/editor`);

    const newDocButton = page.getByRole('button', { name: /new document/i }).first();
    await expect(newDocButton).toBeVisible({ timeout: 10000 });
    await newDocButton.click();

    await expect(page.getByText('Create New Document').first()).toBeVisible();
    const titleInput = page.locator('#title');
    await expect(titleInput).toBeVisible();
  });

  test('should create a group document and navigate to editor', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Create Doc Nav Group' });
    await gotoWithRetry(page, `/group/${group.id}/editor`);

    const newDocButton = page.getByRole('button', { name: /new document/i }).first();
    await expect(newDocButton).toBeVisible({ timeout: 10000 });
    await newDocButton.click();
    await expect(page.getByText('Create New Document').first()).toBeVisible();

    // Fill in title
    const titleInput = page.locator('#title');
    await titleInput.fill('E2E Group Document');

    // Submit
    const createButton = page.getByRole('button', { name: /create document/i });
    await createButton.click();

    // Should navigate to the group document editor
    await page.waitForURL(/\/group\/.*\/editor\/[a-f0-9-]+/, { timeout: 10000 });
  });
});
