import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

/**
 * Action hook for statement mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function useStatementActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── CRUD ───────────────────────────────────────────────────────────
  const createStatement = useCallback(
    async (args: Parameters<typeof mutators.statements.create>[0]) => {
      try {
        const result = zero.mutate(mutators.statements.create(args))
        await serverConfirmed(result)
        toast.success(t('features.statements.toasts.created'))
      } catch (error) {
        console.error('Failed to create statement:', error)
        toast.error(t('features.statements.toasts.createFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateStatement = useCallback(
    async (args: Parameters<typeof mutators.statements.update>[0]) => {
      try {
        const result = zero.mutate(mutators.statements.update(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update statement:', error)
        toast.error(t('features.statements.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteStatement = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.statements.delete({ id }))
        await serverConfirmed(result)
        toast.success(t('features.statements.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete statement:', error)
        toast.error(t('features.statements.toasts.deleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Support Votes ──────────────────────────────────────────────────
  const createSupportVote = useCallback(
    async (args: Parameters<typeof mutators.statements.createSupportVote>[0]) => {
      try {
        const result = zero.mutate(mutators.statements.createSupportVote(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create statement support vote:', error)
        toast.error(t('features.statements.toasts.voteFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateSupportVote = useCallback(
    async (args: Parameters<typeof mutators.statements.updateSupportVote>[0]) => {
      try {
        const result = zero.mutate(mutators.statements.updateSupportVote(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update statement support vote:', error)
        toast.error(t('features.statements.toasts.voteFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteSupportVote = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.statements.deleteSupportVote({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete statement support vote:', error)
        toast.error(t('features.statements.toasts.voteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Surveys ────────────────────────────────────────────────────────
  const createSurvey = useCallback(
    async (args: Parameters<typeof mutators.statements.createSurvey>[0]) => {
      try {
        const result = zero.mutate(mutators.statements.createSurvey(args))
        await serverConfirmed(result)
        toast.success(t('features.statements.toasts.surveyCreated'))
      } catch (error) {
        console.error('Failed to create survey:', error)
        toast.error(t('features.statements.toasts.surveyCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteSurvey = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.statements.deleteSurvey({ id }))
        await serverConfirmed(result)
        toast.success(t('features.statements.toasts.surveyDeleted'))
      } catch (error) {
        console.error('Failed to delete survey:', error)
        toast.error(t('features.statements.toasts.surveyDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  const createSurveyOption = useCallback(
    async (args: Parameters<typeof mutators.statements.createSurveyOption>[0]) => {
      try {
        const result = zero.mutate(mutators.statements.createSurveyOption(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create survey option:', error)
        throw error
      }
    },
    [zero]
  )

  const deleteSurveyOption = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.statements.deleteSurveyOption({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete survey option:', error)
        throw error
      }
    },
    [zero]
  )

  const createSurveyVote = useCallback(
    async (args: Parameters<typeof mutators.statements.createSurveyVote>[0]) => {
      try {
        const result = zero.mutate(mutators.statements.createSurveyVote(args))
        await serverConfirmed(result)
        toast.success(t('features.statements.toasts.surveyVoteCast'))
      } catch (error) {
        console.error('Failed to cast survey vote:', error)
        toast.error(t('features.statements.toasts.surveyVoteFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteSurveyVote = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.statements.deleteSurveyVote({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to remove survey vote:', error)
        throw error
      }
    },
    [zero]
  )

  // ── Silent Operations ──────────────────────────────────────────────

  /** Update statement without toast — for auto-save scenarios */
  const updateStatementSilent = useCallback(
    async (args: Parameters<typeof mutators.statements.update>[0]) => {
      const result = zero.mutate(mutators.statements.update(args))
      await serverConfirmed(result)
    },
    [zero]
  )

  return {
    // CRUD
    createStatement,
    updateStatement,
    deleteStatement,

    // Support Votes
    createSupportVote,
    updateSupportVote,
    deleteSupportVote,

    // Surveys
    createSurvey,
    deleteSurvey,
    createSurveyOption,
    deleteSurveyOption,
    createSurveyVote,
    deleteSurveyVote,

    // Silent
    updateStatementSilent,
  }
}
