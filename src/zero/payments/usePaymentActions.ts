import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

/**
 * Action hook for payment mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function usePaymentActions() {
  const zero = useZero()
  const { t } = useTranslation()

  const createCustomer = useCallback(
    async (args: Parameters<typeof mutators.payments.createCustomer>[0]) => {
      try {
        const result = zero.mutate(mutators.payments.createCustomer(args))
        await serverConfirmed(result)
        toast.success(t('common.paymentToasts.customerCreated'))
      } catch (error) {
        console.error('Failed to create customer:', error)
        toast.error(t('common.paymentToasts.customerCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateSubscription = useCallback(
    async (args: Parameters<typeof mutators.payments.updateSubscription>[0]) => {
      try {
        const result = zero.mutate(mutators.payments.updateSubscription(args))
        await serverConfirmed(result)
        toast.success(t('common.paymentToasts.subscriptionUpdated'))
      } catch (error) {
        console.error('Failed to update subscription:', error)
        toast.error(t('common.paymentToasts.subscriptionUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const recordPayment = useCallback(
    async (args: Parameters<typeof mutators.payments.recordPayment>[0]) => {
      try {
        const result = zero.mutate(mutators.payments.recordPayment(args))
        await serverConfirmed(result)
        toast.success(t('common.paymentToasts.paymentRecorded'))
      } catch (error) {
        console.error('Failed to record payment:', error)
        toast.error(t('common.paymentToasts.paymentRecordFailed'))
        throw error
      }
    },
    [zero]
  )

  const createPayment = useCallback(
    async (args: Parameters<typeof mutators.payments.createPayment>[0]) => {
      try {
        const result = zero.mutate(mutators.payments.createPayment(args))
        await serverConfirmed(result)
        toast.success(t('common.paymentToasts.paymentCreated'))
      } catch (error) {
        console.error('Failed to create payment:', error)
        toast.error(t('common.paymentToasts.paymentCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deletePayment = useCallback(
    async (args: Parameters<typeof mutators.payments.deletePayment>[0]) => {
      try {
        const result = zero.mutate(mutators.payments.deletePayment(args))
        await serverConfirmed(result)
        toast.success(t('common.paymentToasts.paymentDeleted'))
      } catch (error) {
        console.error('Failed to delete payment:', error)
        toast.error(t('common.paymentToasts.paymentDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    createCustomer,
    updateSubscription,
    recordPayment,
    createPayment,
    deletePayment,
  }
}
