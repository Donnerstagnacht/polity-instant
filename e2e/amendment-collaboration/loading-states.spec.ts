// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Loading states display during collaboration operations', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}`);

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
