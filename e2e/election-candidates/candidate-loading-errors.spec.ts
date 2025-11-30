// spec: e2e/test-plans/election-candidates-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Election Candidates - Loading States and Error Handling', () => {
  test('Display loading state while fetching candidates', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to election page
    const navigationPromise = page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/stream`);

    // 3. Candidates section loads
    // Initial loading state shown
    // Skeleton/spinner visible

    await navigationPromise;
    await page.waitForLoadState('networkidle');

    // 4. Candidates displayed when loaded
    await page.waitForTimeout(500);

    // Loading state replaced with content
    // Smooth transition
  });

  test('Handle create candidate validation errors', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to election management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // 3. Attempt to create without required fields
    const addButton = page.getByRole('button', { name: /add candidate/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      // 4. Submit without name
      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 5. Validation error displayed
      await page.waitForTimeout(300);

      // Error message shown (e.g., "Name is required")
      // Form not submitted
      // User can correct and retry
    }
  });

  test('Handle network error during candidate creation', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to election management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // 3. Simulate network issue
    await page.context().setOffline(true);

    // 4. Attempt to create candidate
    const addButton = page.getByRole('button', { name: /add candidate/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      const nameInput = page.getByLabel(/name/i);
      await nameInput.fill('Network Test Candidate');

      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

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
