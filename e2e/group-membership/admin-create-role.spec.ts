// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Membership - Role Creation', () => {
  test('Admin can create new role', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Test Group ${Date.now()}`,
    });

    // 1. Authenticate as admin user
    // 2. Navigate to memberships page (retry on Access Denied from sync delay)
    await gotoWithRetry(page, `/group/${group.id}/memberships`);

    // 3. Navigate to Roles tab
    const rolesTab = page.getByRole('tab', { name: /role/i });
    await rolesTab.click();

    // 4. Click "Add Role" button
    const addRoleButton = page.getByRole('button', { name: /add role|create role|new role/i });
    await addRoleButton.click();

    // 5. Verify dialog opens
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 6. Enter role name
    const timestamp = Date.now();
    const nameInput = dialog.getByLabel(/name|title/i);
    await nameInput.fill(`Test Role ${timestamp}`);

    // 7. Enter role description
    const descInput = dialog.getByLabel(/description/i);
    await descInput.fill('Test role created by automation');

    // 8. Click "Create Role" button
    const createButton = dialog.getByRole('button', { name: /create|save/i });
    await createButton.click();

    // 9. Verify role appears in roles list
    await expect(dialog).not.toBeVisible();
    const roleInList = page.locator(`text=/Test Role ${timestamp}/i`);
    await expect(roleInList).toBeVisible();
  });
});
