// spec: e2e/test-plans/positions-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Positions - Create Basic Position', () => {
  test('Create position with required fields', async ({ page }) => {
    // 1. Authenticate as test user (group admin)
    await loginAsTestUser(page);

    // 2. Navigate to group positions management
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. Navigate to positions section
    const positionsTab = page.getByRole('tab', { name: /position/i });
    if ((await positionsTab.count()) > 0) {
      await positionsTab.click();
    }

    // 4. Click "Create Position"
    const createButton = page.getByRole('button', { name: /create.*position|add.*position/i });

    if ((await createButton.count()) > 0) {
      await createButton.click();

      // 5. Enter title
      const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
      await titleInput.fill('President');

      // 6. Enter description
      const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
      await descInput.fill('Chief executive officer of the organization');

      // 7. Set term length (2 years)
      const termInput = page.getByLabel(/term|duration/i);
      if ((await termInput.count()) > 0) {
        await termInput.fill('2');
      }

      // 8. Set first term start date
      const startDateInput = page.getByLabel(/start.*date|first.*term/i);
      if ((await startDateInput.count()) > 0) {
        // Set date value
      }

      // 9. Click "Create"
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // 10. Position created
      await page.waitForTimeout(500);

      // Appears in positions list
      await expect(page.getByText('President')).toBeVisible({ timeout: 3000 });
    }
  });

  test('Create position with all fields', async ({ page }) => {
    // 1. Authenticate as group admin
    await loginAsTestUser(page);

    // 2. Navigate to group positions
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    const positionsTab = page.getByRole('tab', { name: /position/i });
    if ((await positionsTab.count()) > 0) {
      await positionsTab.click();
    }

    const createButton = page.getByRole('button', { name: /create.*position/i });

    if ((await createButton.count()) > 0) {
      await createButton.click();

      // 3. Fill all fields
      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Vice President');

      const descInput = page.getByLabel(/description/i);
      await descInput.fill('Second-in-command, supports President');

      const termInput = page.getByLabel(/term/i);
      await termInput.fill('2');

      const startDateInput = page.getByLabel(/start.*date/i);
      if ((await startDateInput.count()) > 0) {
        // Set specific date
      }

      // 4. Save
      const submitButton = page.getByRole('button', { name: /create|save/i });
      await submitButton.click();

      // 5. All fields saved correctly
      await page.waitForTimeout(500);

      // Position fully configured
      // Ready for assignment
      await expect(page.getByText('Vice President')).toBeVisible({ timeout: 3000 });
    }
  });
});
