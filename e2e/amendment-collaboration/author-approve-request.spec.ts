// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can approve collaboration request', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author navigates to collaborators management page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    // 2. Author sees list of pending requests
    const pendingSection = page.getByText(/pending requests/i).locator('..');
    await expect(pendingSection).toBeVisible();

    // 3. Author clicks "Accept" for a request
    const acceptButton = pendingSection.getByRole('button', { name: /accept/i }).first();
    const collaboratorCountBefore = await page.getByText(/\d+ collaborators?/i).textContent();
    await acceptButton.click();

    // 4. User status changes to "member"
    // 5. User appears in active collaborators list
    // 6. Collaborator count increases
    await expect(acceptButton).not.toBeVisible();
    const collaboratorCountAfter = await page.getByText(/\d+ collaborators?/i).textContent();
    expect(collaboratorCountAfter).not.toBe(collaboratorCountBefore);
  });
});
