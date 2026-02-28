import { Label } from '@/features/shared/ui/ui/label'
import { Button } from '@/features/shared/ui/ui/button'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useTranslation } from '@/features/shared/hooks/use-translation'

type PaymentDirection = 'income' | 'expense'

interface DirectionInputProps {
  value: PaymentDirection
  onChange: (direction: PaymentDirection) => void
}

export function DirectionInput({ value, onChange }: DirectionInputProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Label>{t('pages.create.payment.direction')}</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={value === 'income' ? 'default' : 'outline'}
          className={`flex-1 gap-2 ${value === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          onClick={() => onChange('income')}
        >
          <ArrowDownLeft className="h-4 w-4" />
          {t('pages.create.payment.income')}
        </Button>
        <Button
          type="button"
          variant={value === 'expense' ? 'default' : 'outline'}
          className={`flex-1 gap-2 ${value === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
          onClick={() => onChange('expense')}
        >
          <ArrowUpRight className="h-4 w-4" />
          {t('pages.create.payment.expense')}
        </Button>
      </div>
    </div>
  )
}
