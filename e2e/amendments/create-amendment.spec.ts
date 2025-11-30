// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Amendments - Create Amendment with Required Fields', () => {
  test('User creates amendment with title and subtitle', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /create page
    await page.goto('/create');

    // 3. Select "Amendment" entity type
    const amendmentOption = page
      .getByRole('radio', { name: /amendment/i })
      .or(page.getByText(/amendment/i).first());
    await amendmentOption.click();

    // 4. Enter title
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await titleInput.fill('Climate Action Amendment 2024');

    // 5. Enter subtitle
    const subtitleInput = page.getByLabel(/subtitle/i).or(page.getByPlaceholder(/subtitle/i));
    await subtitleInput.fill('Comprehensive measures for climate change mitigation');

    // 6. Click "Create" button
    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // 7. Verify redirect to amendment page
    await page.waitForURL(/\/amendment\/.+/, { timeout: 5000 });

    // 8. Verify amendment details displayed
    await expect(page.getByText('Climate Action Amendment 2024')).toBeVisible();

    // 9. User automatically set as author
    // Document created and linked
  });
});
