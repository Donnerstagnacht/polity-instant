// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Cancel Request', () => {
  test('User can cancel pending participation request', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}`);

    // 3. Ensure user has pending request
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    const requestButton = page.getByRole('button', { name: /^request to participate$/i });

    const hasPendingRequest = await pendingButton.isVisible().catch(() => false);

    if (!hasPendingRequest) {
      await requestButton.click();
      await expect(pendingButton).toBeVisible();
    }

    // 4. Click "Request Pending" button to cancel
    await pendingButton.click();

    // 5. Verify button changes back to "Request to Participate"
    await expect(requestButton).toBeVisible();
  });
});
