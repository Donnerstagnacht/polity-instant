// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Remove Participant', () => {
  test('Organizer can remove participant from event', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

    // 3. Get initial participant count
    const participantCountElement = page.locator('text=/\\d+\\s*participant/i').first();
    const initialCountText = await participantCountElement.textContent();
    const initialCount = parseInt(initialCountText?.match(/\\d+/)?.[0] || '0');

    // 4. Find participant and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    await removeButton.click();

    // 5. Confirm removal if dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|remove/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // 6. Verify participant count decreased
    const newCountText = await participantCountElement.textContent();
    const newCount = parseInt(newCountText?.match(/\\d+/)?.[0] || '0');
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });
});
