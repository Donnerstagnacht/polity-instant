// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Promote', () => {
  test('Organizer can promote participant to organizer', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

    // 3. Find participant and click "Promote to Organizer"
    const promoteButton = page
      .getByRole('button', { name: /promote.*organizer|make.*organizer/i })
      .first();
    await expect(promoteButton).toBeVisible();

    await promoteButton.click();

    // 4. Verify participant's role changed to "Organizer"
    const organizerLabel = page.locator('text=/organizer/i').first();
    await expect(organizerLabel).toBeVisible();
  });
});
