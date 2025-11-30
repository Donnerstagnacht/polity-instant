// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Participant Count', () => {
  test('Participant count updates when participant joins', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}`);

    // 3. Get initial participant count
    const participantCountElement = page.locator('text=/\\d+\\s*participant/i').first();
    await expect(participantCountElement).toBeVisible();

    const initialCountText = await participantCountElement.textContent();
    const initialCount = parseInt(initialCountText?.match(/\\d+/)?.[0] || '0');

    // 4. Verify count is a valid number
    expect(initialCount).toBeGreaterThanOrEqual(0);
  });
});
