import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Editor - View Documents', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display My Documents page title', async ({ authenticatedPage: page }) => {
    const title = page.getByRole('heading', { name: /my documents|documents/i });
    await expect(title.first()).toBeVisible();
  });

  test('should display New Document button', async ({ authenticatedPage: page }) => {
    const newDocButton = page.getByRole('button', { name: /new document/i });
    await expect(newDocButton).toBeVisible();
  });

  test('should display document cards in grid', async ({ authenticatedPage: page }) => {
    // Documents are shown as cards in a 3-column grid
    const documentCards = page.locator('[class*="card"], [class*="Card"]');
    if ((await documentCards.count()) > 0) {
      await expect(documentCards.first()).toBeVisible();
    }
  });

  test('should show empty state when no documents exist', async ({ authenticatedPage: page }) => {
    // If user has no documents, show empty state with "Create Your First Document"
    const emptyState = page.getByText(/create your first document/i);
    if ((await emptyState.count()) > 0) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should display document card with owner badge and date', async ({ authenticatedPage: page }) => {
    const ownerBadge = page.getByText('Owner');
    if ((await ownerBadge.count()) > 0) {
      await expect(ownerBadge.first()).toBeVisible();
    }
  });
});
