// spec: e2e/test-plans/group-membership-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Admin Invite', () => {
  test('Admin can invite new members', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Test Group ${Date.now()}`,
    });

    // 1. Authenticate as admin user
    // 2. Navigate to memberships management page
    await page.goto(`/group/${group.id}/memberships`);

    // 3. Click "Invite Member" button
    const inviteButton = page.getByRole('button', { name: /invite member|invite/i });
    await inviteButton.click();

    // 4. Verify dialog opens
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 5. Search for user
    const searchInput = dialog.getByRole('textbox', { name: /search|find/i });
    await searchInput.fill('test');

    // 6. Select first user from results
    const userOption = page.getByRole('option').first();
    await expect(userOption).toBeVisible();
    await userOption.click();

    // 7. Click "Invite" button in dialog
    const confirmButton = dialog.getByRole('button', { name: /invite|send/i });
    await confirmButton.click();

    // 8. Verify invitation created
    await expect(dialog).not.toBeVisible();
  });
});
