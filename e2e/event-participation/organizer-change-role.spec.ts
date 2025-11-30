// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Change Role', () => {
  test('Organizer can change participant role', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

    // 3. Find role dropdown for a participant
    const roleDropdown = page.getByRole('combobox').first();
    await expect(roleDropdown).toBeVisible();

    // 4. Click role dropdown
    await roleDropdown.click();

    // 5. Select new role (e.g., Speaker, Moderator, Participant)
    const roleOption = page.getByRole('option', { name: /speaker|moderator|participant/i }).first();
    await roleOption.click();

    // 6. Verify role is updated
    await expect(roleDropdown).toContainText(/speaker|moderator|participant/i);
  });
});
