// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Blogs - Create Public Blog with Required Fields', () => {
  test('User creates public blog with required fields', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /create page
    await page.goto('/create');

    // 3. Select "Blog" entity type
    const blogOption = page
      .getByRole('radio', { name: /blog/i })
      .or(page.getByText(/blog/i).first());
    await blogOption.click();

    // 4. Enter blog title
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await titleInput.fill('Tech Insights Weekly');

    // 5. Enter description
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('Weekly insights on technology trends');

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

    // 8. Verify redirect to blog page
    await page.waitForURL(/\/blog\/.+/, { timeout: 5000 });

    // 9. Verify blog details displayed
    await expect(page.getByText('Tech Insights Weekly')).toBeVisible();

    // 10. User automatically set as owner/blogger
    // Blog visible in public listings
  });
});
