/**
 * Editor Operations Hook
 *
 * Orchestration hook that replaces editor-operations.ts Supabase utilities.
 * Composes useDocumentActions and useAmendmentActions for suggestion
 * accept/decline and voting operations.
 */

import { useCallback } from 'react'
import { toast } from 'sonner'
import type { ReadonlyJSONValue } from '@rocicorp/zero'
import type { Value } from 'platejs'
import { useDocumentActions } from '@/zero/documents/useDocumentActions'
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions'
import { useDocumentState } from '@/zero/documents/useDocumentState'
import type { EditorEntityType, EditorMode, TDiscussion } from '../types'

interface SuggestionRef {
  id?: string
  suggestionId?: string
  keyId?: string
  crId?: string
}

function getDefaultVersionTitle(creationType: string): string {
  const now = new Date()
  const timestamp = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  switch (creationType) {
    case 'suggestion_accepted':
      return `Suggestion accepted - ${timestamp}`
    case 'suggestion_declined':
      return `Suggestion declined - ${timestamp}`
    default:
      return `Auto-save - ${timestamp}`
  }
}

export function useEditorOperations(entityType: EditorEntityType, entityId: string) {
  const { createVersion } = useDocumentActions()
  const { createChangeRequest, updateChangeRequest, voteOnChangeRequest } = useAmendmentActions()

  // Query versions for computing next version number
  const isBlog = entityType === 'blog'
  const { versions } = useDocumentState({
    documentId: !isBlog ? entityId : '',
    includeVersions: !isBlog,
  })

  const latestVersionNumber = versions.length > 0
    ? Math.max(...versions.map((v) => v.version_number ?? 0))
    : 0

  const createVersionForEntity = useCallback(
    async (content: Value, creationType: string, title?: string) => {
      const versionId = crypto.randomUUID()
      const newVersionNumber = latestVersionNumber + 1
      const versionTitle = title || getDefaultVersionTitle(creationType)

      await createVersion({
        id: versionId,
        content: content as unknown as ReadonlyJSONValue,
        version_number: newVersionNumber,
        change_summary: versionTitle,
        document_id: isBlog ? '' : entityId,
        amendment_id: null,
        blog_id: isBlog ? entityId : null,
      })
    },
    [entityId, isBlog, latestVersionNumber, createVersion]
  )

  const handleSuggestionCreated = useCallback(
    async (params: { id: string; crId: string; amendmentId: string }) => {
      console.log('[useEditorOperations] handleSuggestionCreated called:', params);
      try {
        await createChangeRequest({
          id: params.id,
          amendment_id: params.amendmentId,
          title: params.crId,
          description: '',
          status: 'open',
          source_type: null,
          source_id: null,
          source_title: null,
          reason: null,
          voting_status: 'open',
          voting_deadline: null,
          voting_majority_type: null,
          quorum_required: null,
        })
        console.log('[useEditorOperations] change_request created successfully:', params.id);
      } catch (error) {
        console.error('[useEditorOperations] Failed to create change request entity:', error)
      }
    },
    [createChangeRequest]
  )

  const handleSuggestionAccepted = useCallback(
    async (
      userId: string,
      content: Value,
      discussions: TDiscussion[],
      suggestion: SuggestionRef,
      editingMode?: EditorMode,
      amendmentId?: string,
    ): Promise<{ updatedDiscussions: TDiscussion[] }> => {
      if (editingMode === 'vote_internal' || editingMode === 'vote_event') {
        toast.error(
          'This document is in voting mode. Changes must be approved by vote on the Change Requests page.'
        )
        return { updatedDiscussions: discussions }
      }

      try {
        const versionTitle = suggestion?.crId ? `${suggestion.crId} accepted` : undefined

        await createVersionForEntity(content, 'suggestion_accepted', versionTitle)

        const discussion = discussions.find(
          (d) => d.id === suggestion.suggestionId || d.id === suggestion.id
        )

        const updatedDiscussions = discussions.map((d) => {
          if (d.id === suggestion.suggestionId || d.id === suggestion.id) {
            return { ...d, status: 'accepted' }
          }
          return d
        })

        if (entityType === 'amendment' && discussion && amendmentId) {
          if (discussion.changeRequestEntityId) {
            await updateChangeRequest({
              id: discussion.changeRequestEntityId,
              status: 'accepted',
              voting_status: 'completed',
            })
          } else {
            const changeRequestId = crypto.randomUUID()
            await createChangeRequest({
              id: changeRequestId,
              amendment_id: amendmentId,
              title: discussion.crId || 'Change Request',
              description: '',
              status: 'accepted',
              source_type: null,
              source_id: null,
              source_title: null,
              reason: null,
              voting_status: 'completed',
              voting_deadline: null,
              voting_majority_type: null,
              quorum_required: null,
            })
          }
        }

        return { updatedDiscussions }
      } catch (error) {
        console.error('Failed to accept suggestion:', error)
        toast.error('Failed to accept suggestion')
        return { updatedDiscussions: discussions }
      }
    },
    [entityType, createVersionForEntity, createChangeRequest, updateChangeRequest]
  )

  const handleSuggestionDeclined = useCallback(
    async (
      userId: string,
      content: Value,
      discussions: TDiscussion[],
      suggestion: SuggestionRef,
      editingMode?: EditorMode,
      amendmentId?: string,
    ): Promise<{ updatedDiscussions: TDiscussion[] }> => {
      if (editingMode === 'vote_internal' || editingMode === 'vote_event') {
        toast.error(
          'This document is in voting mode. Changes must be declined by vote on the Change Requests page.'
        )
        return { updatedDiscussions: discussions }
      }

      try {
        const versionTitle = suggestion?.crId ? `${suggestion.crId} declined` : undefined

        await createVersionForEntity(content, 'suggestion_declined', versionTitle)

        const updatedDiscussions = discussions.map((d) => {
          if (d.id === suggestion.suggestionId || d.id === suggestion.id) {
            return { ...d, status: 'rejected' }
          }
          return d
        })

        if (entityType === 'amendment' && amendmentId) {
          const discussion = discussions.find(
            (d) => d.id === suggestion.suggestionId || d.id === suggestion.id
          )

          if (discussion) {
            if (discussion.changeRequestEntityId) {
              await updateChangeRequest({
                id: discussion.changeRequestEntityId,
                status: 'rejected',
                voting_status: 'completed',
              })
            } else {
              const changeRequestId = crypto.randomUUID()
              await createChangeRequest({
                id: changeRequestId,
                amendment_id: amendmentId,
                title: discussion.crId || 'Change Request',
                description: '',
                status: 'rejected',
                source_type: null,
                source_id: null,
                source_title: null,
                reason: null,
                voting_status: 'completed',
                voting_deadline: null,
                voting_majority_type: null,
                quorum_required: null,
              })
            }
          }
        }

        return { updatedDiscussions }
      } catch (error) {
        console.error('Failed to decline suggestion:', error)
        toast.error('Failed to decline suggestion')
        return { updatedDiscussions: discussions }
      }
    },
    [entityType, createVersionForEntity, createChangeRequest, updateChangeRequest]
  )

  const handleVoteOnSuggestion = useCallback(
    async (
      amendmentId: string,
      userId: string,
      discussions: TDiscussion[],
      suggestion: SuggestionRef,
      voteType: 'accept' | 'reject' | 'abstain'
    ): Promise<void> => {
      try {
        const discussion = discussions.find(
          (d) => d.id === suggestion.suggestionId || d.id === suggestion.id
        )

        if (!discussion) {
          toast.error('Suggestion not found')
          return
        }

        let changeRequestId = discussion.changeRequestEntityId

        if (!changeRequestId) {
          // Fallback: create change request if none exists yet
          changeRequestId = crypto.randomUUID()
          await createChangeRequest({
            id: changeRequestId,
            amendment_id: amendmentId,
            title: discussion.crId || 'Change Request',
            description: '',
            status: 'pending',
            source_type: null,
            source_id: null,
            source_title: null,
            reason: null,
            voting_status: 'open',
            voting_deadline: null,
            voting_majority_type: null,
            quorum_required: null,
          })
        }

        // Cast the vote on the change request
        const voteId = crypto.randomUUID()
        await voteOnChangeRequest({
          id: voteId,
          change_request_id: changeRequestId,
          vote: voteType,
        })

        toast.success('Vote recorded')
      } catch (error) {
        console.error('Failed to vote on suggestion:', error)
        toast.error('Failed to record vote')
      }
    },
    [createChangeRequest, voteOnChangeRequest]
  )

  return {
    handleSuggestionCreated,
    handleSuggestionAccepted,
    handleSuggestionDeclined,
    handleVoteOnSuggestion,
  }
}
