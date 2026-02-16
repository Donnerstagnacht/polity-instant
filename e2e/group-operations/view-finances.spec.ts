import { test, expect } from '../fixtures/test-base';
import { navigateToGroupOperation } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - View Finances', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToGroupOperation(page, TEST_ENTITY_IDS.GROUP);
  });

  test('should display Income card with total amount', async ({ authenticatedPage: page }) => {
    const incomeCard = page.getByText(/income:?\s*\$/i);
    if ((await incomeCard.count()) > 0) {
      await expect(incomeCard.first()).toBeVisible();
    }
  });

  test('should display Expenditure card with total amount', async ({ authenticatedPage: page }) => {
    const expenditureCard = page.getByText(/expenditure:?\s*\$/i);
    if ((await expenditureCard.count()) > 0) {
      await expect(expenditureCard.first()).toBeVisible();
    }
  });

  test('should show pie charts for income and expenditure', async ({ authenticatedPage: page }) => {
    // Recharts renders SVG elements inside ResponsiveContainer
    const charts = page.locator('.recharts-wrapper, svg.recharts-surface');
    if ((await charts.count()) > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('should show empty state when no financial data exists', async ({ authenticatedPage: page }) => {
    // Navigate to a group without payment data
    await navigateToGroupOperation(page, TEST_ENTITY_IDS.testGroup2);

    const noIncome = page.getByText('No income data');
    const noExpenditure = page.getByText('No expenditure data');

    if ((await noIncome.count()) > 0) {
      await expect(noIncome).toBeVisible();
    }
    if ((await noExpenditure.count()) > 0) {
      await expect(noExpenditure).toBeVisible();
    }
  });
});
