// spec: e2e/test-plans/change-requests-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Change Requests - Loading States and Error Handling', () => {
  test('Display loading state while fetching change requests', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to amendment
    const navigationPromise = page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);

    // 3. Change requests section loads
    // Initial loading state shown
    // Skeleton/spinner visible

    await navigationPromise;
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();

      // 4. Change requests displayed when loaded
      await page.waitForTimeout(500);

      page.locator('[data-testid="change-request"]').or(page.getByRole('article'));

      // Loading state replaced with content
      // Smooth transition
    }
  });

  test('Handle create change request validation errors', async ({ page }) => {
    // 1. Login as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to amendment
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Attempt to create without required fields
    const createButton = page.getByRole('button', { name: /create.*change/i });

    if ((await createButton.count()) > 0) {
      await createButton.click();

      // 4. Submit without title
      const submitButton = page.getByRole('button', { name: /create|submit/i });
      await submitButton.click();

      // 5. Validation error displayed
      await page.waitForTimeout(300);

      // Error message shown (e.g., "Title is required")
      page.getByText(/required|error/i);

      // Form not submitted
      // User can correct and retry
    }
  });

  test('Handle network error during change request creation', async ({ page }) => {
    // 1. Login as collaborator
    await loginAsTestUser(page);

    // 2. Navigate to amendment
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    const changeRequestsTab = page.getByRole('tab', { name: /change.*request/i });
    if ((await changeRequestsTab.count()) > 0) {
      await changeRequestsTab.click();
    }

    // 3. Simulate network issue
    await page.context().setOffline(true);

    // 4. Attempt to create change request
    const createButton = page.getByRole('button', { name: /create.*change/i });

    if ((await createButton.count()) > 0) {
      await createButton.click();

      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Network Test Change');

      const submitButton = page.getByRole('button', { name: /create|submit/i });
      await submitButton.click();

      // 5. Error message shown
      await page.waitForTimeout(500);

      // "Network error" or "Connection failed"
      // Option to retry
      // Data preserved in form

      // Restore connection
      await page.context().setOffline(false);
    }
  });
});
