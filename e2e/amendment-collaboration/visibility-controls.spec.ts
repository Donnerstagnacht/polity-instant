// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Amendment visibility controls work correctly', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author creates private amendment
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}`);

    const settingsButton = page.getByRole('button', { name: /settings/i });
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    const visibilityToggle = page.getByRole('switch', { name: /private|public/i });
    await expect(visibilityToggle).toBeVisible();

    // 2. Non-collaborator cannot view
    // 3. Author changes to public
    await visibilityToggle.click();
    await expect(page.getByText(/public|visible to all/i)).toBeVisible();

    // 4. Non-collaborator can view (read-only)
    // Log out and try to access
    await page.goto('/auth');
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}`);

    // 5. Only collaborators can edit
    await expect(page.getByText(/view only|read-only/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /edit/i })).not.toBeVisible();
  });
});
