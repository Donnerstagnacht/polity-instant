// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Demote', () => {
  test('Organizer can demote organizer to participant', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

    // 3. Find organizer and click "Demote to Participant"
    const demoteButton = page
      .getByRole('button', { name: /demote.*participant|remove.*organizer/i })
      .first();
    await expect(demoteButton).toBeVisible();

    await demoteButton.click();

    // 4. Verify role changed to "Participant"
    const participantLabel = page.locator('text=/^participant$/i').first();
    await expect(participantLabel).toBeVisible();
  });
});
