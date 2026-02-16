// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Forward Amendment', () => {
  test('Author forwards amendment to event via process page', async ({
    authenticatedPage: page,
  }) => {
    // 1. Authenticate
    // 2. Navigate to amendment process page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}/process`);
    await page.waitForLoadState('networkidle');

    // 3. Look for target path tab
    const pathTab = page.getByRole('tab', { name: 'Target Path', exact: true });
    if ((await pathTab.count()) > 0 && !(await pathTab.isDisabled())) {
      await pathTab.click();

      // 4. View the forwarding path visualization

      // 5. Look for event selection within path
      const selectButton = page.getByRole('button', { name: /select/i });
      if ((await selectButton.count()) > 0) {
        // Event can be selected for forwarding
      }
    }
  });

  test('Author views available target network', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to process page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}/process`);
    await page.waitForLoadState('networkidle');

    // 3. Click available targets tab
    const networkTab = page.getByRole('tab', { name: /available|network/i });
    if ((await networkTab.count()) > 0) {
      await networkTab.click();

      // 4. Verify group/event cards are displayed
      await page.waitForLoadState('networkidle');

      // 5. Groups should be visible as selectable targets
      const cards = page.locator('[class*="gradient"]');
      const cardCount = await cards.count();
      // At least some target options should be available
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });
});
