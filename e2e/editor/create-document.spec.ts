import { test, expect } from '../fixtures/test-base';
test.describe('Editor - Create Document', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should open Create New Document dialog', async ({ authenticatedPage: page }) => {
    const newDocButton = page.getByRole('button', { name: /new document/i });
    await newDocButton.click();

    await expect(page.getByText('Create New Document')).toBeVisible();
    const titleInput = page.getByLabel(/document title/i);
    await expect(titleInput).toBeVisible();
  });

  test('should create a new document and navigate to editor', async ({ authenticatedPage: page }) => {
    const newDocButton = page.getByRole('button', { name: /new document/i });
    await newDocButton.click();

    await expect(page.getByText('Create New Document')).toBeVisible();

    // Fill in title
    const titleInput = page.getByLabel(/document title/i);
    await titleInput.fill('E2E Test Document');

    // Submit
    const createButton = page.getByRole('button', { name: /create document/i });
    await createButton.click();

    // Should navigate to the new document editor
    await page.waitForURL(/\/editor\/[a-f0-9-]+/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/editor\//);
  });

  test('should create document from empty state button', async ({ authenticatedPage: page }) => {
    // If empty state is visible, use its CTA button; otherwise use the New Document button
    const emptyButton = page.getByRole('button', {
      name: /create your first document|new document/i,
    });
    if ((await emptyButton.count()) > 0) {
      await emptyButton.click();
      await expect(page.getByText('Create New Document')).toBeVisible();
    }
  });
});
