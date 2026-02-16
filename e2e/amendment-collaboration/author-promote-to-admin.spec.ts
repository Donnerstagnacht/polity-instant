// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can promote collaborator to admin', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    // Create a collaborator to promote
    const collaborator = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, collaborator.id, amendment.collaboratorRoleId, 'member');

    // 1. Author navigates to collaborators page
    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // 2. Author finds collaborator in active collaborators list
    const activeCollaborators = page.getByText(/active collaborators/i).locator('..');
    await expect(activeCollaborators).toBeVisible();

    // 3. Author clicks "Promote to Admin"
    const promoteButton = activeCollaborators
      .getByRole('button', { name: /promote to admin/i })
      .first();
    await expect(promoteButton).toBeVisible();
    await promoteButton.click();

    // 4. Collaborator's role changes to "Admin"
    // 5. Collaborator gains admin permissions
    await expect(promoteButton).not.toBeVisible();
    await expect(activeCollaborators.getByText(/admin/i).first()).toBeVisible();
  });
});
