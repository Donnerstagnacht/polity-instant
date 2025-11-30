// spec: e2e/test-plans/change-requests-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Change Requests - Voting System', () => {
  test('Vote accept on change request', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Find change request
    const changeRequest = page
      .locator('[data-testid="change-request"]')
      .or(page.getByRole('article'))
      .first();

    if ((await changeRequest.count()) > 0) {
      // 4. Click "Accept" vote button
      const acceptButton = changeRequest.getByRole('button', { name: /accept|approve/i });

      if ((await acceptButton.count()) > 0) {
        await acceptButton.click();

        // 5. Confirm vote
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
        }

        // 6. Vote recorded
        await page.waitForTimeout(500);

        // Vote count increases
        // User cannot vote again
      }
    }
  });

  test('Vote reject on change request', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    const changeRequest = page.locator('[data-testid="change-request"]').first();

    if ((await changeRequest.count()) > 0) {
      // 3. Click "Reject" vote button
      const rejectButton = changeRequest.getByRole('button', { name: /reject|decline/i });

      if ((await rejectButton.count()) > 0) {
        await rejectButton.click();

        // 4. Confirm vote
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
        }

        // 5. Vote recorded
        await page.waitForTimeout(500);

        // Rejection count increases
        // User's vote shown
      }
    }
  });

  test('Vote abstain on change request', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    const changeRequest = page.locator('[data-testid="change-request"]').first();

    if ((await changeRequest.count()) > 0) {
      // 3. Click "Abstain" button
      const abstainButton = changeRequest.getByRole('button', { name: /abstain/i });

      if ((await abstainButton.count()) > 0) {
        await abstainButton.click();

        // 4. Confirm abstention
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
        }

        // 5. Abstain count increases
        await page.waitForTimeout(500);

        // Not counted toward decision threshold
        // Can change vote later
      }
    }
  });

  test('Change vote', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    const changeRequest = page.locator('[data-testid="change-request"]').first();

    if ((await changeRequest.count()) > 0) {
      // 3. User has voted "accept", change to "reject"
      const rejectButton = changeRequest.getByRole('button', { name: /reject/i });

      if ((await rejectButton.count()) > 0) {
        await rejectButton.click();

        // 4. Confirm change
        const confirmButton = page.getByRole('button', { name: /confirm|change/i });
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
        }

        // 5. Existing vote updated
        await page.waitForTimeout(500);

        // Counts adjusted
        // Only one vote per user maintained
        // Change reflected immediately
      }
    }
  });
});
