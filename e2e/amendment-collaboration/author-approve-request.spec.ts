// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Author can approve collaboration request', async ({ authenticatedPage: page, amendmentFactory, userFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });
    const requester = await userFactory.createUser();
    await amendmentFactory.addCollaborator(amendment.id, requester.id, amendment.collaboratorRoleId, 'requested');

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // Author sees pending collaboration requests card
    await expect(page.getByText(/Pending Collaboration Requests/i)).toBeVisible();

    // Author clicks "Accept" for a request
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    // Request is approved - Accept button disappears
    await expect(acceptButton).not.toBeVisible({ timeout: 5000 });
  });
});
