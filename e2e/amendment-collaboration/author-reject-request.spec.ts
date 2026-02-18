// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Amendment Collaboration', () => {
  test('Author can reject collaboration request', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });
    const requester = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, requester.id, amendment.collaboratorRoleId, 'requested');

    await gotoWithRetry(page, `/amendment/${amendment.id}/collaborators`);

    // Author sees pending collaboration requests
    await expect(page.getByText(/Pending Collaboration Requests/i)).toBeVisible({ timeout: 15000 });

    // Author clicks "Decline" for a request
    const declineButton = page.getByRole('button', { name: /decline/i }).first();
    await expect(declineButton).toBeVisible();
    await declineButton.click();

    // Request is rejected - Decline button disappears
    await expect(declineButton).not.toBeVisible({ timeout: 5000 });
  });
});
