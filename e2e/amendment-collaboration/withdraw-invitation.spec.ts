// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Author can withdraw invitation', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });
    const invited = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, invited.id, amendment.collaboratorRoleId, 'invited');

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // Author sees pending invitations
    await expect(page.getByText(/Pending Invitations/i)).toBeVisible();

    // Author clicks "Withdraw Invitation"
    const withdrawButton = page.getByRole('button', { name: /withdraw invitation/i }).first();
    await expect(withdrawButton).toBeVisible();
    await withdrawButton.click();

    // Invitation is withdrawn - button disappears
    await expect(withdrawButton).not.toBeVisible({ timeout: 5000 });
  });
});
