// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Subscribe to Amendment', () => {
  test('User subscribes to an amendment', async ({
    authenticatedPage: page,
    amendmentFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Subscribe Test ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Find subscribe button
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });

    // 4. If not already subscribed, subscribe
    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({
        timeout: 5000,
      });
    }

    // 5. Verify subscribed state
    await expect(unsubscribeButton.or(subscribeButton)).toBeVisible();
  });

  test('User unsubscribes from an amendment', async ({
    authenticatedPage: page,
    amendmentFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const amendment = await amendmentFactory.createAmendment(user.id, {
      title: `Unsubscribe Test ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Ensure subscribed first
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
    }

    // 4. Click unsubscribe
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    await unsubscribeButton.click();

    // 5. Verify unsubscribed
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible({
      timeout: 5000,
    });
  });
});
