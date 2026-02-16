// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can cancel pending collaboration request', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}`);

    // 1. User has pending request
    const requestPendingButton = page.getByRole('button', { name: /request pending/i });
    await expect(requestPendingButton).toBeVisible();

    // 2. User clicks "Request Pending" button
    await requestPendingButton.click();

    // 3. Request is deleted
    // 4. Button changes back to "Request to Collaborate"
    await expect(page.getByRole('button', { name: /request to collaborate/i })).toBeVisible();
    await expect(requestPendingButton).not.toBeVisible();
  });
});
