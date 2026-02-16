// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can approve collaboration request', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    // Create a user who requested to collaborate
    const requester = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, requester.id, amendment.collaboratorRoleId, 'requested');

    // 1. Author navigates to collaborators management page
    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // 2. Author sees list of pending requests
    const pendingSection = page.getByText(/pending requests/i).locator('..');
    await expect(pendingSection).toBeVisible();

    // 3. Author clicks "Accept" for a request
    const acceptButton = pendingSection.getByRole('button', { name: /accept/i }).first();
    const collaboratorCountBefore = await page.getByText(/\d+ collaborators?/i).textContent();
    await acceptButton.click();

    // 4. User status changes to "member"
    // 5. User appears in active collaborators list
    // 6. Collaborator count increases
    await expect(acceptButton).not.toBeVisible();
    const collaboratorCountAfter = await page.getByText(/\d+ collaborators?/i).textContent();
    expect(collaboratorCountAfter).not.toBe(collaboratorCountBefore);
  });
});
