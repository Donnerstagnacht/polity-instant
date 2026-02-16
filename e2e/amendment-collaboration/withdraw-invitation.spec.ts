// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can withdraw invitation', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    // Create an invited collaborator
    const invited = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, invited.id, amendment.collaboratorRoleId, 'invited');

    // 1. Author navigates to collaborators page
    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // 2. Author sees pending invitations list
    const pendingInvitations = page.getByText(/pending invitations/i).locator('..');
    await expect(pendingInvitations).toBeVisible();

    const invitationCount = await pendingInvitations
      .locator('.invitation-item, [data-invitation]')
      .count();

    // 3. Author clicks "Withdraw Invitation"
    const withdrawButton = pendingInvitations
      .getByRole('button', { name: /withdraw|cancel/i })
      .first();
    await expect(withdrawButton).toBeVisible();
    await withdrawButton.click();

    // 4. Invitation is deleted
    const newInvitationCount = await pendingInvitations
      .locator('.invitation-item, [data-invitation]')
      .count();
    expect(newInvitationCount).toBe(invitationCount - 1);

    // 5. User can no longer accept invitation
    await expect(page.getByText(/invitation withdrawn/i)).toBeVisible();
  });
});
