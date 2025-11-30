// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Statements - Create Public Statement', () => {
  test('User creates public statement with tag and text', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /create page
    await page.goto('/create');

    // 3. Select "Statement" entity type
    const statementOption = page
      .getByRole('radio', { name: /statement/i })
      .or(page.getByText(/statement/i).first());
    await statementOption.click();

    // 4. Select or enter tag
    const tagInput = page.getByLabel(/tag|category/i).or(page.getByPlaceholder(/tag|category/i));
    await tagInput.fill('Climate Change');

    // 5. Enter statement text
    const textInput = page
      .getByLabel(/statement|text/i)
      .or(page.getByPlaceholder(/statement|text/i));
    await textInput.fill('We need urgent action on climate change');

    // 6. Set visibility to public
    const publicOption = page
      .getByRole('radio', { name: /public/i })
      .or(page.getByLabel(/public/i));
    if ((await publicOption.count()) > 0) {
      await publicOption.click();
    }

    // 7. Click "Create" button
    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // 8. Verify redirect to statement page
    await page.waitForURL(/\/statement\/.+/, { timeout: 5000 });

    // 9. Verify statement details displayed
    await expect(page.getByText('We need urgent action on climate change')).toBeVisible();
    await expect(page.getByText('Climate Change')).toBeVisible();
  });
});
