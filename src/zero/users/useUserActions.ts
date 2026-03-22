import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

/**
 * Action hook for user mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function useUserActions() {
  const zero = useZero()
  const { t } = useTranslation()

  const updateProfile = useCallback(
    async (args: Parameters<typeof mutators.users.updateProfile>[0]) => {
      try {
        const result = zero.mutate(mutators.users.updateProfile(args))
        await serverConfirmed(result)
        toast.success(t('features.user.toasts.profileUpdated'))
      } catch (error) {
        console.error('Failed to update profile:', error)
        toast.error(t('features.user.toasts.profileUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const follow = useCallback(
    async (args: Parameters<typeof mutators.users.follow>[0]) => {
      try {
        const result = zero.mutate(mutators.users.follow(args))
        await serverConfirmed(result)
        toast.success(t('features.user.toasts.followed'))
      } catch (error) {
        console.error('Failed to follow user:', error)
        toast.error(t('features.user.toasts.followFailed'))
        throw error
      }
    },
    [zero]
  )

  const unfollow = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.users.unfollow({ id }))
        await serverConfirmed(result)
        toast.success(t('features.user.toasts.unfollowed'))
      } catch (error) {
        console.error('Failed to unfollow user:', error)
        toast.error(t('features.user.toasts.unfollowFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    updateProfile,
    follow,
    unfollow,
  }
}
