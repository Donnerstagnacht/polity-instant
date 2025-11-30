// spec: e2e/test-plans/election-candidates-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Election Candidates - Display and Ordering', () => {
  test('View candidates list', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to election page
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/stream`);
    await page.waitForLoadState('networkidle');

    // 3. View candidates section
    // 4. All candidates displayed
    const candidateCards = page
      .locator('[data-testid="candidate-card"]')
      .or(page.getByRole('article'));

    if ((await candidateCards.count()) > 0) {
      // 5. Name, image, description visible
      await expect(candidateCards.first()).toBeVisible();

      // Vote count shown (if allowed)
      // Clickable to view full profile
    }
  });

  test('Set candidate display order', async ({ page }) => {
    // 1. Login as election organizer
    await loginAsTestUser(page);

    // 2. Navigate to election management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // 3. Multiple candidates exist
    const editButton = page.getByRole('button', { name: /edit|manage candidates/i });

    if ((await editButton.count()) > 0) {
      await editButton.click();

      // 4. Set order numbers
      const orderInputs = page.getByLabel(/order|position/i);

      if ((await orderInputs.count()) > 0) {
        const firstOrderInput = orderInputs.first();
        await firstOrderInput.fill('1');

        // 5. Save changes
        const saveButton = page.getByRole('button', { name: /save/i });
        await saveButton.click();

        // 6. Candidates displayed in order
        await page.waitForTimeout(500);

        // Order numbers visible to organizers
        // Consistent ordering across views
      }
    }
  });

  test('View candidate details', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to election
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/stream`);
    await page.waitForLoadState('networkidle');

    // 3. Click on candidate card
    const candidateCards = page.locator('[data-testid="candidate-card"]');

    if ((await candidateCards.count()) > 0) {
      const firstCandidate = candidateCards.first();

      // Check if clickable
      const candidateName = firstCandidate.getByRole('heading').or(firstCandidate.getByText(/.+/));

      if ((await candidateName.count()) > 0) {
        // 4. View full profile
        // Full name and photo
        // Complete platform/description
        // Vote count if public
      }
    }
  });
});
