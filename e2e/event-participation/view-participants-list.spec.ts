// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - View Participants', () => {
  test('User can view participants list', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}`);

    // 3. Verify participant count is visible
    const participantCount = page.locator('text=/\\d+\\s*participant/i').first();
    await expect(participantCount).toBeVisible();

    // 4. Participant avatars and names should be displayed (if public)
    const participantAvatars = page.locator('img[alt*="avatar"], [class*="avatar"]');
    const avatarCount = await participantAvatars.count();

    // If event is public, avatars should be visible
    if (avatarCount > 0) {
      await expect(participantAvatars.first()).toBeVisible();
    }
  });
});
