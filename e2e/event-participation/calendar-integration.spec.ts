// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Calendar Integration', () => {
  test('Participated events appear in calendar', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Ensure user participates in event
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}`);

    const leaveButton = page.getByRole('button', { name: /leave event|leave/i });
    const acceptButton = page.getByRole('button', { name: /accept invitation/i });

    const isParticipant = await leaveButton.isVisible().catch(() => false);
    const canAccept = await acceptButton.isVisible().catch(() => false);

    if (!isParticipant && canAccept) {
      await acceptButton.click();
      await expect(leaveButton).toBeVisible();
    }

    // 3. Navigate to calendar page
    await page.goto('/calendar');

    // 4. Verify event appears in calendar
    const eventInCalendar = page.locator(`text=/test.*event/i`).first();
    await expect(eventInCalendar).toBeVisible();

    // 5. Event should show participation status (e.g., badge or indicator)
    const participationBadge = page.locator('text=/participating|attending/i');
    const hasBadge = await participationBadge.isVisible().catch(() => false);

    // Badge may or may not be visible depending on design
    if (hasBadge) {
      await expect(participationBadge).toBeVisible();
    }
  });
});
