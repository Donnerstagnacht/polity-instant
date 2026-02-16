// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('User can view version history', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Test Amendment ${Date.now()}`,
    });

    // 1. User navigates to amendment text page
    await page.goto(`/amendment/${amendment.id}/text`);

    // 2. User clicks "Version History" button
    const historyButton = page.getByRole('button', { name: /version history|history/i });
    await expect(historyButton).toBeVisible();
    await historyButton.click();

    // 3. List of versions appears
    const versionList = page.locator('.version-list, [data-version-list]');
    await expect(versionList).toBeVisible();

    // 4. Each version shows timestamp and author
    const versionItem = versionList.locator('.version-item, [data-version]').first();
    await expect(versionItem).toBeVisible();
    await expect(versionItem.getByText(/\d{1,2}\/\d{1,2}\/\d{4}|ago/i)).toBeVisible();
    await expect(versionItem.locator('.author, [data-author]')).toBeVisible();

    // 5. User can compare versions
    const compareButton = versionItem.getByRole('button', { name: /compare|view/i });
    await expect(compareButton).toBeVisible();
  });
});
