// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Non-collaborator cannot access collaboration management', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Non-collaborator tries to access /amendment/[id]/collaborators
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment2}/collaborators`);

    // 2. Access is denied
    // 3. User sees "Access Denied" message
    await expect(page.getByText(/access denied|not authorized|forbidden/i)).toBeVisible();

    // 4. Collaboration buttons are not visible
    await expect(page.getByRole('button', { name: /invite collaborator/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /add role/i })).not.toBeVisible();
  });
});
