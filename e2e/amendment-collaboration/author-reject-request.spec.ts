// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can reject collaboration request', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author navigates to collaborators management page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    // 2. Author sees list of pending requests
    const pendingSection = page.getByText(/pending requests/i).locator('..');
    await expect(pendingSection).toBeVisible();

    const requestCount = await pendingSection.getByRole('button', { name: /remove/i }).count();

    // 3. Author clicks "Remove" for a request
    const removeButton = pendingSection.getByRole('button', { name: /remove/i }).first();
    await removeButton.click();

    // 4. Request is deleted
    // 5. User disappears from pending list
    const newRequestCount = await pendingSection.getByRole('button', { name: /remove/i }).count();
    expect(newRequestCount).toBe(requestCount - 1);
  });
});
