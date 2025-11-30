// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator can make suggestions in suggest mode', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Collaborator navigates to amendment text editor
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/text`);

    // 2. Editor is in "Suggest" mode
    const modeSelector = page.getByRole('button', { name: /suggest/i });
    await expect(modeSelector).toBeVisible();

    // 3. Collaborator makes text changes
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible();
    await editor.click();
    await editor.type('This is a suggestion');

    // 4. Changes appear as suggestions (tracked)
    // 5. Suggestions are highlighted and attributed to user
    await expect(page.getByText(/this is a suggestion/i)).toBeVisible();
    await expect(page.locator('.suggestion, [data-suggestion]')).toBeVisible();
  });
});
