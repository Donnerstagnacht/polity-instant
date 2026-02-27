import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddPaymentDialog } from './AddPaymentDialog';
import type { ChartData, FinancialSummary } from '../types/group.types';

interface PaymentsSectionProps {
  groupId: string;
  summary: FinancialSummary;
  incomeData: ChartData[];
  expenditureData: ChartData[];
  incomeDialogOpen: boolean;
  onIncomeDialogChange: (open: boolean) => void;
  expenditureDialogOpen: boolean;
  onExpenditureDialogChange: (open: boolean) => void;
  onAddIncome: (data: any) => void;
  onAddExpense: (data: any) => void;
}

export function PaymentsSection({
  groupId,
  summary,
  incomeData,
  expenditureData,
  incomeDialogOpen,
  onIncomeDialogChange,
  expenditureDialogOpen,
  onExpenditureDialogChange,
  onAddIncome,
  onAddExpense,
}: PaymentsSectionProps) {
  const balanceClass =
    summary.balance > 0
      ? 'text-green-600 dark:text-green-400'
      : summary.balance < 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <div className="flex gap-2">
            <AddPaymentDialog
              open={incomeDialogOpen}
              onOpenChange={onIncomeDialogChange}
              onSubmit={onAddIncome}
              direction="income"
              groupId={groupId}
            />
            <AddPaymentDialog
              open={expenditureDialogOpen}
              onOpenChange={onExpenditureDialogChange}
              onSubmit={onAddExpense}
              direction="expense"
              groupId={groupId}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              ${summary.income.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expenditure</p>
            <p className="text-xl font-semibold text-red-600 dark:text-red-400">
              ${summary.expenditure.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-xl font-semibold ${balanceClass}`}>
              ${summary.balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
              Income Breakdown
            </p>
            {incomeData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No income recorded</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={incomeData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {incomeData.map((entry, index) => (
                      <Cell key={`income-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div>
            <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
              Expenditure Breakdown
            </p>
            {expenditureData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No expenditure recorded
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenditureData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {expenditureData.map((entry, index) => (
                      <Cell key={`expense-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
