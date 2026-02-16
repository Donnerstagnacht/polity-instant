// spec: e2e/test-plans/groups-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Groups - Create Public Group with Required Fields', () => {
  test('User creates public group with required fields', async ({ authenticatedPage: page }) => {
    const groupName = `E2E Group ${Date.now()}`;

    // 1. Navigate to /create/group directly
    await page.goto('/create/group');
    await page.waitForLoadState('domcontentloaded');

    // 2. Step 1: Enter group name
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill(groupName);

    // 3. Enter description if available
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    if ((await descInput.count()) > 0) {
      await descInput.fill('A community for tech enthusiasts in Berlin');
    }

    // 4. Click Next through wizard steps
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();

    // Keep clicking Next until we reach the Create/Submit step
    for (let i = 0; i < 5; i++) {
      const createButton = page.getByRole('button', { name: /create/i });
      if ((await createButton.count()) > 0 && await createButton.isEnabled()) {
        await createButton.click();
        break;
      }
      if ((await nextButton.count()) > 0 && await nextButton.isEnabled()) {
        await nextButton.click();
      }
    }

    // 5. Verify redirect to group page
    await page.waitForURL(/\/group\/.+/, { timeout: 10000 });

    // 6. Verify group details displayed
    await expect(page.getByText(groupName)).toBeVisible({ timeout: 5000 });
  });
});
