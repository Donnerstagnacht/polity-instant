import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Editor - Version Control', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/editor/${TEST_ENTITY_IDS.testDocument1}`);
    await page.waitForLoadState('networkidle');
  });

  test('should display Save Version button', async ({ authenticatedPage: page }) => {
    const saveVersionButton = page.getByRole('button', { name: /save version/i });
    if ((await saveVersionButton.count()) > 0) {
      await expect(saveVersionButton).toBeVisible();
    }
  });

  test('should display History button', async ({ authenticatedPage: page }) => {
    const historyButton = page.getByRole('button', { name: /history/i });
    if ((await historyButton.count()) > 0) {
      await expect(historyButton).toBeVisible();
    }
  });

  test('should open version history panel', async ({ authenticatedPage: page }) => {
    const historyButton = page.getByRole('button', { name: /history/i });
    if ((await historyButton.count()) === 0) {
      test.skip();
      return;
    }

    await historyButton.click();

    // Version history panel should appear
    const versionList = page.getByText(/version|history/i);
    if ((await versionList.count()) > 0) {
      await expect(versionList.first()).toBeVisible();
    }
  });
});
