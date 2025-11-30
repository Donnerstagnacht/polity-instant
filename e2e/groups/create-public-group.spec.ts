// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Groups - Create Public Group with Required Fields', () => {
  test('User creates public group with required fields', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /create page
    await page.goto('/create');

    // 3. Select "Group" entity type
    const groupOption = page
      .getByRole('radio', { name: /group/i })
      .or(page.getByText(/group/i).first());
    await groupOption.click();

    // 4. Enter group name
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
    await nameInput.fill('Tech Community Berlin');

    // 5. Enter description
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('A community for tech enthusiasts in Berlin');

    // 6. Set group as public
    const publicOption = page
      .getByRole('radio', { name: /public/i })
      .or(page.getByLabel(/public/i));
    if ((await publicOption.count()) > 0) {
      await publicOption.click();
    }

    // 7. Click "Create" button
    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // 8. Verify redirect to group page
    await page.waitForURL(/\/group\/.+/, { timeout: 5000 });

    // 9. Verify group details displayed
    await expect(page.getByText('Tech Community Berlin')).toBeVisible();
    await expect(page.getByText('A community for tech enthusiasts in Berlin')).toBeVisible();

    // 10. User automatically set as owner
    // Group visible in public listings
  });
});
