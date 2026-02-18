// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Event Participation - Action Rights', () => {
  test('Organizer can assign action rights to role', async ({ authenticatedPage: page, eventFactory, mainUserId }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as organizer user
    // 2. Navigate to Roles tab
    await page.goto(`/event/${event.id}/participants`);

    const rolesTab = page.getByRole('tab', { name: /role/i });
    await rolesTab.click();

    // 3. Find action rights matrix
    const permissionsTable = page.getByRole('table').or(page.getByRole('grid')).first();
    await expect(permissionsTable).toBeVisible();

    // 4. Toggle checkbox for specific permission
    const checkbox = page.getByRole('checkbox').first();
    const wasChecked = await checkbox.isChecked();

    await checkbox.click();

    // 5. Verify checkbox state changed
    const isNowChecked = await checkbox.isChecked();
    expect(isNowChecked).toBe(!wasChecked);
  });
});
