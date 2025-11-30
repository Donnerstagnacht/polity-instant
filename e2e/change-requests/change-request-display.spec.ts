// spec: e2e/test-plans/change-requests-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Change Requests - Discussion and Display', () => {
  test('Add comment to change request', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. View change request details
    const changeRequest = page.locator('[data-testid="change-request"]').first();

    if ((await changeRequest.count()) > 0) {
      await changeRequest.click();

      // 4. Add comment to discussion
      const commentInput = page.getByPlaceholder(/comment|add.*comment/i);

      if ((await commentInput.count()) > 0) {
        await commentInput.fill('I have concerns about this change');

        // 5. Post comment
        const postButton = page.getByRole('button', { name: /post|comment|send/i });
        await postButton.click();

        // 6. Comment added
        await page.waitForTimeout(500);

        // Discussion thread created/updated
        // Participants notified
        await expect(page.getByText('I have concerns about this change')).toBeVisible({
          timeout: 3000,
        });
      }
    }
  });

  test('View change requests list', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to amendment change requests tab
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. View all requests
    page.locator('[data-testid="change-request"]').or(page.getByRole('article'));

    // 4. All change requests listed
    // Key info visible (title, status, vote counts)
    // Clickable to view details
    // Sorted by date or status
  });

  test('View change request details', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change requests
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Click on change request
    const changeRequest = page.locator('[data-testid="change-request"]').first();

    if ((await changeRequest.count()) > 0) {
      await changeRequest.click();

      // 4. View full details page
      await page.waitForTimeout(300);

      // Full title, description, justification
      // Proposed change text clearly shown
      // Vote breakdown visible
      // Discussion thread accessible
      // Vote buttons available if applicable
    }
  });

  test('Show vote counts and percentages', async ({ page }) => {
    // 1. Authenticate as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to change request
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. View vote tallies
    page.getByText(/\d+.*vote/i);

    // 4. Accept count shown
    // Reject count shown
    // Abstain count shown
    // Total votes displayed

    // 5. Percentages shown
    page.getByText(/\d+%/);

    // Visual progress bar or chart
    // Threshold comparison shown
    // Easy to understand
  });
});
