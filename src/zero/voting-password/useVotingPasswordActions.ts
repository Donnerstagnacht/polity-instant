import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

export function useVotingPasswordActions() {
  const zero = useZero()
  const { t } = useTranslation()

  const setVotingPassword = useCallback(
    async (password: string) => {
      try {
        const result = zero.mutate(mutators.votingPassword.setVotingPassword({ password }))
        await serverConfirmed(result)
        toast.success(t('common.votingPassword.setSuccess'))
      } catch (error) {
        console.error('Failed to set voting password:', error)
        toast.error(t('common.votingPassword.setFailed'))
        throw error
      }
    },
    [zero, t]
  )

  const verifyVotingPassword = useCallback(
    async (password: string) => {
      try {
        const result = zero.mutate(mutators.votingPassword.verifyVotingPassword({ password }))
        await serverConfirmed(result)
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : t('common.votingPassword.verifyFailed', 'Incorrect password')
        console.error('Failed to verify voting password:', error)
        toast.error(message)
        throw error
      }
    },
    [zero, t]
  )

  return { setVotingPassword, verifyVotingPassword }
}
