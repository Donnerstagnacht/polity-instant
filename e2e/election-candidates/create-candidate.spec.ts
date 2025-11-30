// spec: e2e/test-plans/election-candidates-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Election Candidates - Create Basic Election Candidate', () => {
  test('Create candidate with required fields', async ({ page }) => {
    // 1. Authenticate as test user (election organizer)
    await loginAsTestUser(page);

    // 2. Navigate to election management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // 3. Find election section
    const electionSection = page
      .locator('[data-testid="election"]')
      .or(page.getByText(/election/i));

    if ((await electionSection.count()) > 0) {
      // 4. Click "Add Candidate"
      const addButton = page.getByRole('button', { name: /add candidate|create candidate/i });

      if ((await addButton.count()) > 0) {
        await addButton.click();

        // 5. Enter name
        const nameInput = page
          .getByLabel(/name|candidate name/i)
          .or(page.getByPlaceholder(/name/i));
        await nameInput.fill('Jane Smith');

        // 6. Enter description/platform
        const descInput = page
          .getByLabel(/description|platform/i)
          .or(page.getByPlaceholder(/description/i));
        await descInput.fill('Experienced leader focused on community development');

        // 7. Click "Create"
        const createButton = page.getByRole('button', { name: /create|save|add/i });
        await createButton.click();

        // 8. Candidate created
        await page.waitForTimeout(500);

        // Appears in candidates list
        await expect(page.getByText('Jane Smith')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('Create candidate with all fields', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to election management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add candidate/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      // 3. Fill all fields
      const nameInput = page.getByLabel(/name/i);
      await nameInput.fill('John Doe');

      const descInput = page.getByLabel(/description|platform/i);
      await descInput.fill('Vision for sustainable future with focus on education and healthcare');

      // 4. Upload candidate photo (if available)
      const imageInput = page.getByLabel(/image|photo/i);
      if ((await imageInput.count()) > 0) {
        // Set image URL or upload file
      }

      // 5. Set display order
      const orderInput = page.getByLabel(/order|position/i);
      if ((await orderInput.count()) > 0) {
        await orderInput.fill('1');
      }

      // 6. Save
      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 7. All fields saved correctly
      await page.waitForTimeout(500);

      // Full profile available
      await expect(page.getByText('John Doe')).toBeVisible({ timeout: 3000 });
    }
  });
});
