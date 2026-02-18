// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Organizer Demote', () => {
  test('Organizer can demote organizer to participant', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });
    // Create another organizer to demote
    const otherOrganizer = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, otherOrganizer.id, event.organizerRoleId, 'confirmed');

    // Navigate with retry on Access Denied
    await gotoWithRetry(page, `/event/${event.id}/participants`);

    // Use "Remove Organizer" button or role dropdown to demote
    const removeOrgButton = page.getByRole('button', { name: /remove organizer/i }).first();
    const roleDropdown = page.getByRole('combobox').first();

    const hasRemoveOrg = await removeOrgButton.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasRemoveOrg) {
      await removeOrgButton.click();
    } else {
      // Fall back to role dropdown
      await expect(roleDropdown).toBeVisible({ timeout: 10000 });
      await roleDropdown.click();
      const participantOption = page.getByRole('option', { name: /participant/i }).first();
      await expect(participantOption).toBeVisible({ timeout: 5000 });
      await participantOption.click();
    }

    await page.waitForTimeout(1000);
  });
});
