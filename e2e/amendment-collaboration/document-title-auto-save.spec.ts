// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Document title auto-saves', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Collaborator edits document title
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/text`);

    const titleInput = page
      .getByRole('textbox', { name: /title/i })
      .or(page.locator('input[type="text"]').first());
    await expect(titleInput).toBeVisible();

    const newTitle = `Updated Title ${Date.now()}`;

    await titleInput.clear();
    await titleInput.fill(newTitle);

    // 2. User pauses typing
    // 3. Title auto-saves after delay
    await page.waitForTimeout(2000);

    // 4. Save indicator appears
    await expect(page.getByText(/saved|auto-saved/i)).toBeVisible();

    // 5. Changes persist on page reload
    await page.reload();
    await expect(titleInput).toHaveValue(newTitle);
  });
});
