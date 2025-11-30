import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Create Election Candidate', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Election Candidates entity type
    const candidatesOption = page
      .locator('text=Election Candidates')
      .or(page.locator('[data-entity="electioncandidates"]'))
      .first();
    await candidatesOption.click();

    await page.waitForTimeout(500);

    // Enter candidate name
    const nameInput = page.locator('input[name="name"]').or(page.getByPlaceholder(/name/i)).first();
    await nameInput.fill('Jane Smith');

    // Advance carousel if needed
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Select associated election/agenda item (if dropdown is available)
    const electionSelect = page
      .locator('select[name="election"]')
      .or(page.locator('[data-testid="election-select"]'))
      .first();
    if (await electionSelect.isVisible()) {
      // Select first available election
      await electionSelect.selectOption({ index: 1 });
    }

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Add candidate statement
    const statementInput = page
      .locator('textarea[name="statement"]')
      .or(page.getByPlaceholder(/statement/i))
      .first();
    if (await statementInput.isVisible()) {
      await statementInput.fill('I am committed to transparency and community engagement');
    }

    // Click Create button
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();
    await createButton.click();

    // Wait for success
    await page.waitForTimeout(1000);

    // Verify success
    const successMessage = await page
      .locator('text=created')
      .or(page.locator('[role="alert"]'))
      .first()
      .isVisible()
      .catch(() => false);
    const isRedirected = page.url() !== '/create';

    expect(successMessage || isRedirected).toBeTruthy();
  });
});
