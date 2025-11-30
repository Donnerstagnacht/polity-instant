// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Loading States', () => {
  test('Loading states display during participation operations', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}`);

    // 3. Find participation button
    const participationButton = page
      .getByRole('button', { name: /request to participate|leave event|accept invitation/i })
      .first();
    await expect(participationButton).toBeVisible();

    // 4. Click button
    await participationButton.click();

    // 5. Verify button becomes disabled (loading state)
    await expect(participationButton).toBeDisabled();

    // 6. Wait for operation to complete and button to be enabled again
    await expect(participationButton).not.toBeDisabled();
  });
});
