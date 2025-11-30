// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Approve Request', () => {
  test('Organizer can approve participation request', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants management page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

    // 3. Verify participants page loaded
    const heading = page.getByRole('heading', { name: /participant|manage/i });
    await expect(heading).toBeVisible();

    // 4. Find first pending request and click "Accept"
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    await expect(acceptButton).toBeVisible();

    await acceptButton.click();

    // 5. Verify user appears in active participants list
    // Request should be removed from pending section
  });
});
