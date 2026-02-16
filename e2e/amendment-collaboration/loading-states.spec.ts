// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Loading states display during collaboration operations', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}`);

    // 1. User performs action (join, leave, vote, etc.)
    const actionButton = page
      .getByRole('button', { name: /request to collaborate|leave/i })
      .first();
    await expect(actionButton).toBeVisible();

    // 2. Button shows loading state
    const buttonPromise = actionButton.click();

    // 3. Button is disabled during operation
    await expect(actionButton).toBeDisabled();

    await buttonPromise;

    // 4. Loading completes and UI updates
    await expect(actionButton).not.toBeDisabled();
  });
});
