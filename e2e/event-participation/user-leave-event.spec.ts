// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Leave Event', () => {
  test('Participant can leave event', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event where user is a participant
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent2}`);

    // 3. Ensure user is a participant
    const leaveButton = page.getByRole('button', { name: /leave event|leave/i });
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });

    const isParticipant = await leaveButton.isVisible().catch(() => false);

    if (!isParticipant) {
      await acceptButton.click();
      await expect(leaveButton).toBeVisible();
    }

    // 4. Click "Leave Event" button
    await leaveButton.click();

    // 5. Verify button changes to "Request to Participate"
    const requestButton = page.getByRole('button', { name: /request to participate/i });
    await expect(requestButton).toBeVisible();
  });
});
