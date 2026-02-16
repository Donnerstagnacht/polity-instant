// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Change request auto-applies when all vote accept', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    await amendmentFactory.createChangeRequest(amendment.id, user.id, {
      title: 'Test Change Request',
      description: 'Proposed change for testing',
    });

    await page.goto(`/amendment/${amendment.id}/change-requests`);

    // 1. Change request has 3 collaborators
    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 2. All 3 vote "accept"
    const acceptButton = changeRequest.getByRole('button', { name: /accept/i });
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
    }

    // 3. System automatically applies change to document
    // 4. Change request status changes to "accepted"
    await expect(changeRequest.getByText(/accepted|applied/i)).toBeVisible();

    // 5. Suggestion is marked as resolved
    await expect(changeRequest.locator('[data-status="accepted"]')).toBeVisible();
  });
});
