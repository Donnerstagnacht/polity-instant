import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

export function useAccreditationActions() {
  const zero = useZero()
  const { t } = useTranslation()

  const confirmAccreditation = useCallback(
    async (args: { event_id: string; agenda_item_id: string; password: string }) => {
      try {
        const result = zero.mutate(mutators.accreditation.confirmAccreditation(args))
        await serverConfirmed(result)
        toast.success(t('common.accreditation.confirmed'))
      } catch (error) {
        console.error('Failed to confirm accreditation:', error)
        toast.error(t('common.accreditation.confirmFailed'))
        throw error
      }
    },
    [zero, t]
  )

  const deleteAccreditation = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.accreditation.deleteAccreditation({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete accreditation:', error)
        toast.error(t('common.accreditation.deleteFailed'))
        throw error
      }
    },
    [zero, t]
  )

  return { confirmAccreditation, deleteAccreditation }
}
