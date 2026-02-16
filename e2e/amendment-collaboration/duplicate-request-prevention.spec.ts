// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Duplicate collaboration request prevention', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}`);

    // 1. User requests to collaborate
    const requestButton = page.getByRole('button', { name: /request to collaborate/i });
    await expect(requestButton).toBeVisible();
    await requestButton.click();

    await expect(page.getByRole('button', { name: /request pending/i })).toBeVisible();

    // 2. User tries to request again
    // 3. System prevents duplicate request
    const pendingButton = page.getByRole('button', { name: /request pending/i });
    await expect(pendingButton).toBeVisible();

    // Verify only one request by canceling and seeing original button
    await pendingButton.click();
    await expect(requestButton).toBeVisible();

    // Try requesting again
    await requestButton.click();

    // 4. Only one request exists
    await expect(page.getByRole('button', { name: /request pending/i })).toBeVisible();
    await expect(requestButton).not.toBeVisible();
  });
});
