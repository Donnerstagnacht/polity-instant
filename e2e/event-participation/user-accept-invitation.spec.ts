// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Accept Invitation', () => {
  test('User can accept event invitation', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page where user is invited
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent2}`);

    // 3. Verify "Accept Invitation" button is visible
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });
    await expect(acceptButton).toBeVisible();

    // 4. Click "Accept Invitation" button
    await acceptButton.click();

    // 5. Verify button changes to "Leave Event"
    const leaveButton = page.getByRole('button', { name: /leave event|leave/i });
    await expect(leaveButton).toBeVisible();
  });
});
