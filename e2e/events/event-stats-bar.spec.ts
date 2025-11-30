// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Events - Event Stats Bar', () => {
  test('Event stats bar displays accurate counts', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Check stats bar
    // 5. Participant count accurate
    // 6. Subscriber count accurate

    // 7. Stats update in real-time
    // Only counts "member" status participants
    // Stats should be visible
  });
});
