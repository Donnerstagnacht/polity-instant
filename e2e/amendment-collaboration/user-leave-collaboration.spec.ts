// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can leave amendment', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    const owner = await userFactory.createUser();
    const amendment = await amendmentFactory.createAmendment(owner.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    await amendmentFactory.addCollaborator(amendment.id, mainUserId, amendment.collaboratorRoleId, 'member');

    await page.goto(`/amendment/${amendment.id}`);

    // User sees "Leave Collaboration" button
    const leaveButton = page.getByRole('button', { name: /leave collaboration/i });
    await expect(leaveButton).toBeVisible();

    // User clicks to leave
    await leaveButton.click();

    // Button changes to request collaboration
    await expect(page.getByRole('button', { name: /request.*collaborat/i })).toBeVisible();
  });
});
