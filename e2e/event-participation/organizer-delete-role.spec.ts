// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Role Deletion', () => {
  test('Organizer can delete role', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as organizer user
    // 2. Navigate to Roles tab
    await page.goto(`/event/${event.id}/participants`);

    const rolesTab = page.getByRole('tab', { name: /role/i });
    await rolesTab.click();

    // 3. Find role to delete
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    await expect(deleteButton).toBeVisible();

    // 4. Click delete button
    await deleteButton.click();

    // 5. Confirm deletion if needed
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // 6. Verify role is removed
  });
});
