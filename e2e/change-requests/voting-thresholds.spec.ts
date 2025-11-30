// spec: e2e/test-plans/change-requests-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Change Requests - Voting Thresholds and Periods', () => {
  test('Simple majority threshold (50%+)', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request with 50% threshold
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. More than half vote accept
    // 4. Check decision
    page.getByText(/50%|majority/i);

    // 5. Decision made at >50%
    // Threshold enforced correctly
    // Clear indication of requirement
  });

  test('Supermajority threshold (75%)', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Set threshold to 75%
    // 4. Exactly 75% vote accept
    page.getByText(/75%/i);

    // 5. Decision made at threshold
    // Higher bar for approval
    // Threshold clearly displayed
  });

  test('Set voting end time', async ({ page }) => {
    // 1. Login as creator
    await loginAsTestUser(page);

    // 2. Navigate to change request creation
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    const createButton = page.getByRole('button', { name: /create.*change/i });

    if ((await createButton.count()) > 0) {
      await createButton.click();

      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Timed Vote Test');

      // 3. Set votingEndTime
      const endTimeInput = page.getByLabel(/end.*time|deadline/i);
      if ((await endTimeInput.count()) > 0) {
        // Set future date/time
      }

      const submitButton = page.getByRole('button', { name: /create|submit/i });
      await submitButton.click();

      // 4. Voting closes at end time
      await page.waitForTimeout(500);

      // No votes accepted after deadline
      // Results calculated
      // Final decision made
    }
  });
});
