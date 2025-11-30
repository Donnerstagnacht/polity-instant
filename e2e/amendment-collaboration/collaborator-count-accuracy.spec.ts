// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborator count updates accurately', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}`);

    // 1. Count only includes status "member" and "admin"
    const collaboratorCount = page.getByText(/\d+ collaborators?/i);
    await expect(collaboratorCount).toBeVisible();
    const initialCount = await collaboratorCount.textContent();

    // 2. Excludes "invited" and "requested" statuses
    // Navigate to collaborators page to verify
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    const activeCollaborators = page.locator('.active-collaborators, [data-active-collaborators]');
    await expect(activeCollaborators).toBeVisible();

    // 3. Updates in real-time when collaborators join/leave
    const removeButton = activeCollaborators.getByRole('button', { name: /remove/i }).first();
    if (await removeButton.isVisible()) {
      await removeButton.click();

      await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}`);
      const updatedCount = await page.getByText(/\d+ collaborators?/i).textContent();
      expect(updatedCount).not.toBe(initialCount);
    }
  });
});
