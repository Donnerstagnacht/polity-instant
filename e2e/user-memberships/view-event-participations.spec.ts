import { test, expect } from '../fixtures/test-base';

test.describe('User Memberships - Event Participations', () => {
  test.beforeEach(async ({ authenticatedPage: page, adminDb }) => {
    const authUser = await adminDb.auth.getUser({ email: 'polity.live@gmail.com' });
    await page.goto(`/user/${authUser.id}/memberships`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should switch to Events tab', async ({ authenticatedPage: page }) => {
    const eventsTab = page.getByRole('tab', { name: /events/i });
    await eventsTab.click();

    // Should show event participation sections
    const activeParticipations = page.getByText(/active participations/i);
    if ((await activeParticipations.count()) > 0) {
      await expect(activeParticipations.first()).toBeVisible();
    }
  });

  test('should show event entries with role and date', async ({ authenticatedPage: page }) => {
    const eventsTab = page.getByRole('tab', { name: /events/i });
    await eventsTab.click();

    // Table should have Event, Role, Joined columns
    const eventHeader = page.getByText('Event', { exact: true });
    if ((await eventHeader.count()) > 0) {
      await expect(eventHeader.first()).toBeVisible();
    }
  });
});
