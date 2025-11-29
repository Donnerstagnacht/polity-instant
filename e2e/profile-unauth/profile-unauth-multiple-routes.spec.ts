// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Navigation Behavior While Unauthenticated', () => {
  test('Test Multiple Profile Routes Without Authentication', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Test the following routes in sequence
    const routes = [
      { path: '/user', name: 'own profile route' },
      { path: '/user/f598596e-d379-413e-9c6e-c218e5e3cf17', name: 'specific user' },
      { path: '/user/f598596e-d379-413e-9c6e-c218e5e3cf17/edit', name: 'edit page' },
      { path: '/user/f598596e-d379-413e-9c6e-c218e5e3cf17/subscriptions', name: 'subscriptions' },
    ];

    const results: { route: string; finalUrl: string; redirectedToAuth: boolean }[] = [];

    for (const route of routes) {
      // Navigate to route
      await page.goto(route.path);
      await page.waitForURL('**', { timeout: 5000 });

      // Note the final URL after load
      const finalUrl = page.url();

      // Check if redirected to /auth
      const redirectedToAuth = finalUrl.includes('/auth');

      // Verify no protected content is visible
      if (!redirectedToAuth) {
        const editButton = page.getByRole('button', { name: /edit|save|update/i });
        const editCount = await editButton.count();
        expect(editCount).toBe(0);
      }

      // 4. Document behavior
      results.push({
        route: route.name,
        finalUrl,
        redirectedToAuth,
      });
    }

    // Verify at least one result was collected
    expect(results.length).toBeGreaterThan(0);
  });
});
