// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('User can cancel pending collaboration request', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    const owner = await userFactory.createUser();
    const amendment = await amendmentFactory.createAmendment(owner.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    await amendmentFactory.addCollaborator(amendment.id, mainUserId, amendment.collaboratorRoleId, 'requested');

    await page.goto(`/amendment/${amendment.id}`);

    // User sees "Request Pending" button
    const pendingButton = page.getByRole('button', { name: /request pending/i });
    await expect(pendingButton).toBeVisible();

    // User clicks to cancel
    await pendingButton.click();

    // Button changes back to request collaboration
    await expect(page.getByRole('button', { name: /request.*collaborat/i })).toBeVisible();
  });
});
