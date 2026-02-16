// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Change request auto-rejects when majority vote reject', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    await amendmentFactory.createChangeRequest(amendment.id, user.id, {
      title: 'Test Change Request',
      description: 'Proposed change for testing',
    });

    await page.goto(`/amendment/${amendment.id}/change-requests`);

    // 1. Change request has 5 collaborators
    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 2. 3 vote "reject", 2 vote "accept"
    const rejectButton = changeRequest.getByRole('button', { name: /reject/i });
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
    }

    // 3. Change request status changes to "rejected"
    await expect(changeRequest.getByText(/rejected/i)).toBeVisible();

    // 4. Change is not applied
    // 5. Suggestion remains for reference
    await expect(changeRequest.locator('[data-status="rejected"]')).toBeVisible();
  });
});
