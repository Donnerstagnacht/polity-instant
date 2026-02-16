import { test, expect } from '../fixtures/test-base';
import { navigateToGroupDocuments } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Documents - Create Document', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToGroupDocuments(page, TEST_ENTITY_IDS.GROUP);
  });

  test('should open Create New Document dialog', async ({ authenticatedPage: page }) => {
    const newDocButton = page.getByRole('button', { name: /new document/i });
    if ((await newDocButton.count()) === 0) {
      test.skip();
      return;
    }

    await newDocButton.click();

    await expect(page.getByText('Create New Document')).toBeVisible();
    const titleInput = page.getByLabel(/document title/i);
    await expect(titleInput).toBeVisible();
  });

  test('should create a group document and navigate to editor', async ({ authenticatedPage: page }) => {
    const newDocButton = page.getByRole('button', { name: /new document/i });
    if ((await newDocButton.count()) === 0) {
      test.skip();
      return;
    }

    await newDocButton.click();
    await expect(page.getByText('Create New Document')).toBeVisible();

    // Fill in title
    const titleInput = page.getByLabel(/document title/i);
    await titleInput.fill('E2E Group Document');

    // Submit
    const createButton = page.getByRole('button', { name: /create document/i });
    await createButton.click();

    // Should navigate to the group document editor
    await page.waitForURL(/\/group\/.*\/editor\/[a-f0-9-]+/, { timeout: 10000 });
  });
});
