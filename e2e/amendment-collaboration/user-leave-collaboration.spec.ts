// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can leave amendment', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    // Create amendment owned by another user, add test user as collaborator
    const owner = await userFactory.createUser();
    const amendment = await amendmentFactory.createAmendment(owner.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    const testUser = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    await amendmentFactory.addCollaborator(amendment.id, testUser.id, amendment.collaboratorRoleId, 'member');

    await page.goto(`/amendment/${amendment.id}`);

    // 1. User is a collaborator of amendment
    const leaveButton = page.getByRole('button', { name: /leave collaboration/i });
    await expect(leaveButton).toBeVisible();

    // 2. User clicks "Leave Collaboration" button
    await leaveButton.click();

    // 3. Collaboration is deleted
    // 4. Button changes to "Request to Collaborate"
    await expect(page.getByRole('button', { name: /request to collaborate/i })).toBeVisible();
    await expect(leaveButton).not.toBeVisible();
  });
});
