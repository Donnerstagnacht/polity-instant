// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can vote to accept change request', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    await amendmentFactory.createChangeRequest(amendment.id, user.id, {
      title: 'Test Change Request',
      description: 'Proposed change for testing',
    });

    // 1. Collaborator navigates to change requests page
    await page.goto(`/amendment/${amendment.id}/change-requests`);

    // 2. Collaborator sees pending change request
    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 3. Collaborator reviews proposed changes
    await expect(changeRequest.getByText(/proposed change/i)).toBeVisible();

    // 4. Collaborator clicks "Accept" button
    const acceptButton = changeRequest.getByRole('button', { name: /accept/i });
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    // 5. Vote is recorded
    // 6. Vote count updates
    await expect(page.getByText(/vote recorded|voted accept/i)).toBeVisible();
  });
});
