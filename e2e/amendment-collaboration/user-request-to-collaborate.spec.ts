// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can request to collaborate on amendment', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    // 1. User navigates to amendment page
    await page.goto(`/amendment/${amendment.id}`);

    // 2. User clicks "Request to Collaborate" button
    const requestButton = page.getByRole('button', { name: /request to collaborate/i });
    await expect(requestButton).toBeVisible();
    await requestButton.click();

    // 3. Request is created with status "requested"
    // 4. Button changes to "Request Pending"
    await expect(page.getByRole('button', { name: /request pending/i })).toBeVisible();
    await expect(requestButton).not.toBeVisible();
  });
});
