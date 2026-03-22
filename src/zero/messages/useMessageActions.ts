import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

/**
 * Action hook for message/conversation mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function useMessageActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── Conversations ──────────────────────────────────────────────────
  const createConversation = useCallback(
    async (args: Parameters<typeof mutators.messages.createConversation>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.createConversation(args))
        await serverConfirmed(result)
        toast.success(t('features.messages.toasts.conversationCreated'))
      } catch (error) {
        console.error('Failed to create conversation:', error)
        toast.error(t('features.messages.toasts.conversationCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateConversation = useCallback(
    async (args: Parameters<typeof mutators.messages.updateConversation>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.updateConversation(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update conversation:', error)
        toast.error(t('features.messages.toasts.conversationUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteConversation = useCallback(
    async (args: Parameters<typeof mutators.messages.deleteConversation>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.deleteConversation(args))
        await serverConfirmed(result)
        toast.success(t('features.messages.toasts.conversationDeleted'))
      } catch (error) {
        console.error('Failed to delete conversation:', error)
        toast.error(t('features.messages.toasts.conversationDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Messages ───────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (args: Parameters<typeof mutators.messages.sendMessage>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.sendMessage(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to send message:', error)
        toast.error(t('features.messages.toasts.sendFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateMessage = useCallback(
    async (args: Parameters<typeof mutators.messages.updateMessage>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.updateMessage(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update message:', error)
        toast.error(t('features.messages.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteMessage = useCallback(
    async (args: Parameters<typeof mutators.messages.deleteMessage>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.deleteMessage(args))
        await serverConfirmed(result)
        toast.success(t('features.messages.toasts.messageDeleted'))
      } catch (error) {
        console.error('Failed to delete message:', error)
        toast.error(t('features.messages.toasts.messageDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Participants ───────────────────────────────────────────────────
  const addParticipant = useCallback(
    async (args: Parameters<typeof mutators.messages.addParticipant>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.addParticipant(args))
        await serverConfirmed(result)
        toast.success(t('features.messages.toasts.participantAdded'))
      } catch (error) {
        console.error('Failed to add participant:', error)
        toast.error(t('features.messages.toasts.participantAddFailed'))
        throw error
      }
    },
    [zero]
  )

  const removeParticipant = useCallback(
    async (args: Parameters<typeof mutators.messages.removeParticipant>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.removeParticipant(args))
        await serverConfirmed(result)
        toast.success(t('features.messages.toasts.participantRemoved'))
      } catch (error) {
        console.error('Failed to remove participant:', error)
        toast.error(t('features.messages.toasts.participantRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Read Status ────────────────────────────────────────────────────
  const markRead = useCallback(
    async (args: Parameters<typeof mutators.messages.markRead>[0]) => {
      try {
        const result = zero.mutate(mutators.messages.markRead(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to mark as read:', error)
        toast.error(t('features.messages.toasts.markReadFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    // Conversations
    createConversation,
    updateConversation,
    deleteConversation,

    // Messages
    sendMessage,
    updateMessage,
    deleteMessage,

    // Participants
    addParticipant,
    removeParticipant,

    // Read Status
    markRead,
  }
}
