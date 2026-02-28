import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'

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
        await zero.mutate(mutators.statements.create(args))
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
        await zero.mutate(mutators.statements.update(args))
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
        await zero.mutate(mutators.statements.delete({ id }))
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
        await zero.mutate(mutators.statements.createSupportVote(args))
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
        await zero.mutate(mutators.statements.updateSupportVote(args))
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
        await zero.mutate(mutators.statements.deleteSupportVote({ id }))
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
        await zero.mutate(mutators.statements.createSurvey(args))
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
        await zero.mutate(mutators.statements.deleteSurvey({ id }))
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
        await zero.mutate(mutators.statements.createSurveyOption(args))
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
        await zero.mutate(mutators.statements.deleteSurveyOption({ id }))
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
        await zero.mutate(mutators.statements.createSurveyVote(args))
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
        await zero.mutate(mutators.statements.deleteSurveyVote({ id }))
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
      await zero.mutate(mutators.statements.update(args))
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
