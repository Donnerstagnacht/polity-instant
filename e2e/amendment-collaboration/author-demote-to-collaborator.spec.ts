// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can demote admin to collaborator', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    // Create an admin collaborator to demote
    const admin = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, admin.id, amendment.authorRoleId, 'admin');

    // 1. Author navigates to collaborators page
    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // 2. Author finds admin in active collaborators list
    const activeCollaborators = page.getByText(/active collaborators/i).locator('..');
    await expect(activeCollaborators).toBeVisible();

    // 3. Author clicks "Demote to Collaborator"
    const demoteButton = activeCollaborators
      .getByRole('button', { name: /demote to collaborator/i })
      .first();
    await expect(demoteButton).toBeVisible();
    await demoteButton.click();

    // 4. Admin's role changes to "Collaborator"
    // 5. User loses admin permissions
    await expect(demoteButton).not.toBeVisible();
    await expect(
      activeCollaborators.getByRole('button', { name: /promote to admin/i }).first()
    ).toBeVisible();
  });
});
