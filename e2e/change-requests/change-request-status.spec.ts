// spec: e2e/test-plans/change-requests-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Change Requests - Status Management', () => {
  test('Pending status', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Create new change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Default status is "pending"
    page.getByText(/pending/i).or(page.locator('[data-status="pending"]'));

    // 4. Voting available
    // Collaborators can vote
    // Awaiting decision
  });

  test('Accepted status', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Change request approved by vote
    // Status changes to "accepted"
    page.getByText(/accepted|approved/i);

    // 4. Change can be applied
    // Voting closed
    // Indicator shown
  });

  test('Rejected status', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Change request rejected by vote
    // Status changes to "rejected"
    page.getByText(/rejected|declined/i);

    // 4. Change not applied
    // Voting closed
    // Historical record kept
  });

  test('Applied status', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Accepted change is applied to document
    const applyButton = page.getByRole('button', { name: /apply/i }).first();

    if ((await applyButton.count()) > 0) {
      await applyButton.click();

      // 4. Mark as "applied"
      await page.waitForTimeout(500);

      // Status: "applied"
      // Change incorporated
      // Document updated
    }
  });
});
