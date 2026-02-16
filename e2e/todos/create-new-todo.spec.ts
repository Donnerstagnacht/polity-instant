// spec: e2e/test-plans/todos-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Todos - Create New Todo', () => {
  test('User creates a new todo item', async ({ authenticatedPage: page }) => {
    // Use unique name to avoid collisions in parallel runs
    const todoName = `E2E Todo ${Date.now()}`;

    // 1. Navigate to /todos
    await page.goto('/todos');

    // 2. Click "Create Todo" or "New Todo" button
    const createButton = page
      .getByRole('button', { name: /create/i })
      .or(page.getByRole('button', { name: /new todo/i }));
    await createButton.first().click();

    // 3. Todo creation form or dialog appears
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await expect(titleInput.first()).toBeVisible();

    // 4. Fill in todo details (step 1)
    await titleInput.first().fill(todoName);

    const descriptionInput = page
      .getByLabel(/description/i)
      .or(page.getByPlaceholder(/description/i));
    if ((await descriptionInput.count()) > 0) {
      await descriptionInput.first().fill('This is a test todo');
    }

    // 5. Navigate through carousel steps to reach the Create button
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click(); // Step 1 → Step 2 (Details)
    await nextButton.click(); // Step 2 → Step 3 (Settings)
    await nextButton.click(); // Step 3 → Step 4 (Review)

    // 6. Submit the form (Create button appears on last step)
    const submitButton = page.getByRole('button', { name: /create todo/i });
    await submitButton.click();

    // 7. New todo appears in the list (allow time for reactive DB update)
    await expect(page.getByText(todoName)).toBeVisible({ timeout: 15000 });
  });
});
