/**
 * Hook for calculating financial data and chart data from payments
 */

import { useMemo } from 'react';
import type { GroupPayment, FinancialSummary, ChartData } from '../types/group.types';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function useFinancialData(payments: GroupPayment[], groupId: string) {
  const financialData = useMemo(() => {
    const incomeByType: Record<string, number> = {};
    const expenditureByType: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenditure = 0;

    payments.forEach((payment: any) => {
      const isIncome = payment.receiverGroup?.id === groupId;

      if (isIncome) {
        totalIncome += payment.amount;
        incomeByType[payment.type || 'other'] = (incomeByType[payment.type || 'other'] || 0) + payment.amount;
      } else {
        totalExpenditure += payment.amount;
        expenditureByType[payment.type || 'other'] = (expenditureByType[payment.type || 'other'] || 0) + payment.amount;
      }
    });

    const balance = totalIncome - totalExpenditure;

    // Prepare data for income chart
    const incomeChartData: ChartData[] = Object.entries(incomeByType).map(([type, value], index) => ({
      name: type.replace(/_/g, ' '),
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

    // Add available/balance to income chart if positive
    if (balance > 0) {
      incomeChartData.push({
        name: 'Available',
        value: balance,
        fill: CHART_COLORS[incomeChartData.length % CHART_COLORS.length],
      });
    }

    // Prepare data for expenditure chart
    const expenditureChartData: ChartData[] = Object.entries(expenditureByType).map(([type, value], index) => ({
      name: type.replace(/_/g, ' '),
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

    // Add deficit to expenditure chart if negative balance
    if (balance < 0) {
      expenditureChartData.push({
        name: 'Deficit',
        value: Math.abs(balance),
        fill: CHART_COLORS[expenditureChartData.length % CHART_COLORS.length],
      });
    }

    const summary: FinancialSummary = {
      income: totalIncome,
      expenditure: totalExpenditure,
      balance,
    };

    return {
      summary,
      incomeData: incomeChartData,
      expenditureData: expenditureChartData,
      colors: CHART_COLORS,
    };
  }, [payments, groupId]);

  return financialData;
}
