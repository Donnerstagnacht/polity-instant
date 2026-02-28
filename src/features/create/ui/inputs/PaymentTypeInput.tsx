import { Label } from '@/features/shared/ui/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/ui/select'
import { useTranslation } from '@/features/shared/hooks/use-translation'

const PAYMENT_TYPES = [
  'membership_fee',
  'donation',
  'subsidies',
  'campaign',
  'material',
  'events',
  'others',
] as const

type PaymentType = (typeof PAYMENT_TYPES)[number]

interface PaymentTypeInputProps {
  value: PaymentType
  onChange: (type: PaymentType) => void
}

export function PaymentTypeInput({ value, onChange }: PaymentTypeInputProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Label>{t('pages.create.payment.typeField')}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as PaymentType)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {t(`pages.create.payment.types.${type}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
