import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { usePaymentActions } from '@/zero/payments/usePaymentActions'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GroupSearchInput } from '../ui/inputs/GroupSearchInput'
import { UserSearchInput } from '../ui/inputs/UserSearchInput'
import { DirectionInput } from '../ui/inputs/DirectionInput'
import { PaymentTypeInput } from '../ui/inputs/PaymentTypeInput'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import type { CreateFormConfig } from '../types/create-form.types'

export function useCreatePaymentForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createPayment } = usePaymentActions()

  const [groupId, setGroupId] = useState('')
  const [direction, setDirection] = useState<'income' | 'expense'>('income')
  const [label, setLabel] = useState('')
  const [type, setType] = useState<string>('donation')
  const [amount, setAmount] = useState('')
  const [entityType, setEntityType] = useState<'user' | 'group'>('user')
  const [entityId, setEntityId] = useState('')
  const [entityGroupId, setEntityGroupId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const paymentId = crypto.randomUUID()
      const parsedAmount = parseFloat(amount)

      let payer_user_id: string | null = null
      let payer_group_id: string | null = null
      let receiver_user_id: string | null = null
      let receiver_group_id: string | null = null

      if (direction === 'income') {
        receiver_group_id = groupId
        if (entityType === 'user') payer_user_id = entityId
        else payer_group_id = entityGroupId
      } else {
        payer_group_id = groupId
        if (entityType === 'user') receiver_user_id = entityId
        else receiver_group_id = entityGroupId
      }

      await createPayment({
        id: paymentId,
        label,
        type,
        amount: parsedAmount,
        payer_user_id,
        payer_group_id,
        receiver_user_id,
        receiver_group_id,
      })
      toast.success(t('pages.create.success.created'))
      navigate({ to: '/group/$id', params: { id: groupId } })
    } catch {
      toast.error(t('pages.create.error.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasEntity = entityType === 'user' ? !!entityId : !!entityGroupId

  const config = useMemo((): CreateFormConfig => ({
    entityType: 'action',
    title: 'pages.create.payment.title',
    isSubmitting,
    onSubmit: handleSubmit,
    steps: [
      {
        label: t('pages.create.common.group'),
        isValid: () => !!groupId,
        content: (
          <GroupSearchInput
            value={groupId}
            onChange={setGroupId}
            label={t('pages.create.common.group')}
            placeholder={t('pages.create.common.searchGroup')}
          />
        ),
      },
      {
        label: t('pages.create.payment.direction'),
        isValid: () => !!label.trim() && !!amount,
        content: (
          <div className="space-y-4">
            <DirectionInput value={direction} onChange={setDirection} />
            <div className="space-y-2">
              <Label>
                {t('pages.create.payment.labelField')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t('pages.create.payment.labelPlaceholder')}
              />
            </div>
            <PaymentTypeInput value={type as any} onChange={setType} />
            <div className="space-y-2">
              <Label>
                {t('pages.create.payment.amount')} <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
        ),
      },
      {
        label: direction === 'income' ? t('pages.create.payment.fromPayer') : t('pages.create.payment.toReceiver'),
        isValid: () => hasEntity,
        content: (
          <div className="space-y-4">
            <Label>
              {direction === 'income' ? t('pages.create.payment.fromPayer') : t('pages.create.payment.toReceiver')}
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={entityType === 'user' ? 'default' : 'outline'}
                onClick={() => { setEntityType('user'); setEntityGroupId('') }}
                className="flex-1"
              >
                {t('pages.create.payment.entityUser')}
              </Button>
              <Button
                type="button"
                variant={entityType === 'group' ? 'default' : 'outline'}
                onClick={() => { setEntityType('group'); setEntityId('') }}
                className="flex-1"
              >
                {t('pages.create.payment.entityGroup')}
              </Button>
            </div>
            {entityType === 'user' ? (
              <UserSearchInput
                value={entityId ? [entityId] : []}
                onChange={(ids) => setEntityId(ids[0] || '')}
                placeholder={t('pages.create.payment.searchUsers')}
                multi={false}
              />
            ) : (
              <GroupSearchInput
                value={entityGroupId}
                onChange={setEntityGroupId}
                placeholder={t('pages.create.payment.searchGroups')}
              />
            )}
          </div>
        ),
      },
      {
        label: t('pages.create.common.review'),
        isValid: () => !!groupId && !!label.trim() && !!amount && hasEntity,
        content: (
          <CreateSummaryStep
            entityType="action"
            badge={t('pages.create.payment.reviewBadge')}
            title={label || 'Untitled Payment'}
            subtitle={`${parseFloat(amount || '0').toFixed(2)} €`}
            fields={[
              { label: t('pages.create.payment.direction'), value: direction === 'income' ? t('pages.create.payment.income') : t('pages.create.payment.expense') },
              { label: t('pages.create.payment.typeField'), value: t(`pages.create.payment.types.${type}`) },
              { label: t('pages.create.payment.amount'), value: `${parseFloat(amount || '0').toFixed(2)} €` },
            ]}
          />
        ),
      },
    ],
  }), [groupId, direction, label, type, amount, entityType, entityId, entityGroupId, isSubmitting, hasEntity, t])

  return config
}
