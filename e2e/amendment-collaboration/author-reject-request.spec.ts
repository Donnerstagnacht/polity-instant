// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can reject collaboration request', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
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

    const requestCount = await pendingSection.getByRole('button', { name: /remove/i }).count();

    // 3. Author clicks "Remove" for a request
    const removeButton = pendingSection.getByRole('button', { name: /remove/i }).first();
    await removeButton.click();

    // 4. Request is deleted
    // 5. User disappears from pending list
    const newRequestCount = await pendingSection.getByRole('button', { name: /remove/i }).count();
    expect(newRequestCount).toBe(requestCount - 1);
  });
});
