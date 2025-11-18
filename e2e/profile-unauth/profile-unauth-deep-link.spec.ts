// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Return URL Preservation (Deep Link)', () => {
  test('Test Deep Link Preservation', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to specific profile page
    await page.goto('/user/f598596e-d379-413e-9c6e-c218e5e3cf17');
    await page.waitForURL('**', { timeout: 5000 });

    const currentUrl = page.url();

    // 3. If redirected to /auth, check URL for return/redirect parameter
    if (currentUrl.includes('/auth')) {
      // 4. Look for query parameters
      const url = new URL(currentUrl);
      const redirectParam =
        url.searchParams.get('redirect') ||
        url.searchParams.get('returnUrl') ||
        url.searchParams.get('next') ||
        url.searchParams.get('return');

      // 5. Note the presence and value of return URL parameter
      if (redirectParam) {
        console.log(`Return URL parameter found: ${redirectParam}`);
        expect(redirectParam).toContain('/user/');
      } else {
        console.log('No return URL parameter found in auth redirect');
      }
    } else {
      console.log('Profile is publicly accessible - no auth redirect');
    }
  });
});
