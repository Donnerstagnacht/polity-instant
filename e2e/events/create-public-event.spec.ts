// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Events - Create Public Event with Required Fields', () => {
  test('User creates public event with required fields', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /create page
    await page.goto('/create');

    // 3. Select "Event" entity type
    const eventOption = page
      .getByRole('radio', { name: /event/i })
      .or(page.getByText(/event/i).first());
    await eventOption.click();

    // 4. Enter event title
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await titleInput.fill('Community Meetup');

    // 5. Enter description
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('Monthly community gathering');

    // 6. Select start date (future date)
    const dateInput = page.getByLabel(/date/i).or(page.getByLabel(/start/i));
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateString);

    // 7. Set event as public
    const publicOption = page
      .getByRole('radio', { name: /public/i })
      .or(page.getByLabel(/public/i));
    if ((await publicOption.count()) > 0) {
      await publicOption.click();
    }

    // 8. Click "Create" button
    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // 9. Verify redirect to event page
    await page.waitForURL(/\/event\/.+/, { timeout: 5000 });

    // 10. Verify event details displayed
    await expect(page.getByText('Community Meetup')).toBeVisible();
    await expect(page.getByText('Monthly community gathering')).toBeVisible();
  });
});
