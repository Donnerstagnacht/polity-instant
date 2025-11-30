// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Request to Participate', () => {
  test('User can request to participate in event', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}`);

    // 3. Verify "Request to Participate" button is visible
    const requestButton = page.getByRole('button', { name: /request to participate/i });
    await expect(requestButton).toBeVisible();

    // 4. Click "Request to Participate" button
    await requestButton.click();

    // 5. Verify button changes to "Request Pending"
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    await expect(pendingButton).toBeVisible();
  });
});
