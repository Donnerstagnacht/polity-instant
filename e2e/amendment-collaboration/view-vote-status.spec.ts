// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can view change request vote status', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });
    await amendmentFactory.createChangeRequest(amendment.id, user.id, {
      title: 'Test Change Request',
      description: 'Proposed change for testing',
    });

    // 1. User navigates to change request
    await page.goto(`/amendment/${amendment.id}/change-requests`);

    const changeRequest = page.locator('.change-request, [data-change-request]').first();
    await expect(changeRequest).toBeVisible();

    // 2. Vote status is displayed
    await expect(changeRequest.getByText(/vote status|voting progress/i)).toBeVisible();

    // 3. Shows who has voted (accept/reject/abstain)
    await expect(changeRequest.locator('.vote-count, [data-vote-count]')).toBeVisible();

    // 4. Shows who hasn't voted yet
    await expect(changeRequest.getByText(/pending votes|waiting for/i)).toBeVisible();

    // 5. Progress bar or count is visible
    await expect(changeRequest.locator('.progress, [role="progressbar"]')).toBeVisible();
  });
});
