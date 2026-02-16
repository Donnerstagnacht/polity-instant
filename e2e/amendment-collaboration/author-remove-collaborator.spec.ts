// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can remove collaborator from amendment', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    // Create a collaborator
    const collaborator = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, collaborator.id, amendment.collaboratorRoleId, 'member');

    // 1. Author navigates to collaborators page
    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // 2. Author finds collaborator in active collaborators list
    const activeCollaborators = page.getByText(/active collaborators/i).locator('..');
    await expect(activeCollaborators).toBeVisible();

    const collaboratorCountBefore = await page.getByText(/\d+ collaborators?/i).textContent();

    // 3. Author clicks "Remove" button
    const removeButton = activeCollaborators.getByRole('button', { name: /remove/i }).first();
    await removeButton.click();

    // 4. Collaboration is deleted
    // 5. Collaborator loses editing access
    // 6. Collaborator count decreases
    const collaboratorCountAfter = await page.getByText(/\d+ collaborators?/i).textContent();
    expect(collaboratorCountAfter).not.toBe(collaboratorCountBefore);
  });
});
