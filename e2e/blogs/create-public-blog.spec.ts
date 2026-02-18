// spec: e2e/test-plans/blogs-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Blogs - Create Public Blog with Required Fields', () => {
  test('User creates public blog with required fields', async ({ authenticatedPage: page }) => {
    const blogTitle = `E2E Blog ${Date.now()}`;

    // 1. Navigate to /create/blog directly
    await page.goto('/create/blog');
    await page.waitForLoadState('domcontentloaded');

    // 2. Step 1: Enter blog title
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    await titleInput.fill(blogTitle);

    // 3. Click Next to go to Step 2
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await nextButton.click();

    // 4. Step 2: Visibility (default is public) - click Next
    await nextButton.click();

    // 5. Step 3: Review - click Create
    const createButton = page.getByRole('button', { name: /create/i });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    // 6. Verify redirect to blog page
    await page.waitForURL(/\/blog\/.+/, { timeout: 10000 });

    // 7. Verify blog details displayed
    await expect(page.getByText(blogTitle)).toBeVisible({ timeout: 5000 });
  });
});
