import { useCallback } from 'react'
import { toast } from 'sonner'
import { useDocumentActions } from '@/zero/documents'

/**
 * Orchestration hook that replaces the Supabase-based voteOnThread / voteOnComment
 * utilities with Zero mutators.
 *
 * Composes:
 *  - voteThread / updateThreadVote / deleteThreadVote / updateThread
 *  - voteComment / updateCommentVote / deleteCommentVote / updateComment
 */
export function useVotingMutations() {
  const actions = useDocumentActions()

  const voteOnThread = useCallback(
    async (
      threadId: string,
      voteValue: number,
      currentVote: { id: string; vote?: number | null } | undefined,
      currentUpvotes: number = 0,
      currentDownvotes: number = 0,
      userId?: string,
    ) => {
      if (!userId) {
        toast.error('Please log in to vote')
        return
      }

      try {
        if (currentVote) {
          if (currentVote.vote === voteValue) {
            // Same vote → remove
            await actions.deleteThreadVote(currentVote.id)
            await actions.updateThread({
              id: threadId,
              upvotes: voteValue === 1 ? Math.max(0, currentUpvotes - 1) : currentUpvotes,
              downvotes: voteValue === -1 ? Math.max(0, currentDownvotes - 1) : currentDownvotes,
            })
          } else {
            // Different vote → change
            await actions.updateThreadVote({ id: currentVote.id, vote: voteValue })
            await actions.updateThread({
              id: threadId,
              upvotes: voteValue === 1 ? currentUpvotes + 1 : Math.max(0, currentUpvotes - 1),
              downvotes: voteValue === -1 ? currentDownvotes + 1 : Math.max(0, currentDownvotes - 1),
            })
          }
        } else {
          // New vote → insert
          await actions.voteThread({
            id: crypto.randomUUID(),
            vote: voteValue,
            thread_id: threadId,
            user_id: userId,
          })
          await actions.updateThread({
            id: threadId,
            upvotes: voteValue === 1 ? currentUpvotes + 1 : currentUpvotes,
            downvotes: voteValue === -1 ? currentDownvotes + 1 : currentDownvotes,
          })
        }
      } catch (error) {
        console.error('Error voting on thread:', error)
        throw error
      }
    },
    [actions],
  )

  const voteOnComment = useCallback(
    async (
      commentId: string,
      voteValue: number,
      currentVote: { id: string; vote: number | null } | undefined,
      currentUpvotes: number = 0,
      currentDownvotes: number = 0,
      userId?: string,
    ) => {
      if (!userId) {
        toast.error('Please log in to vote')
        return
      }

      try {
        if (currentVote) {
          if (currentVote.vote === voteValue) {
            // Same vote → remove
            await actions.deleteCommentVote(currentVote.id)
            await actions.updateComment({
              id: commentId,
              upvotes: voteValue === 1 ? Math.max(0, currentUpvotes - 1) : currentUpvotes,
              downvotes: voteValue === -1 ? Math.max(0, currentDownvotes - 1) : currentDownvotes,
            })
          } else {
            // Different vote → change
            await actions.updateCommentVote({ id: currentVote.id, vote: voteValue })
            await actions.updateComment({
              id: commentId,
              upvotes: voteValue === 1 ? currentUpvotes + 1 : Math.max(0, currentUpvotes - 1),
              downvotes: voteValue === -1 ? currentDownvotes + 1 : Math.max(0, currentDownvotes - 1),
            })
          }
        } else {
          // New vote → insert
          await actions.voteComment({
            id: crypto.randomUUID(),
            vote: voteValue,
            comment_id: commentId,
            user_id: userId,
          })
          await actions.updateComment({
            id: commentId,
            upvotes: voteValue === 1 ? currentUpvotes + 1 : currentUpvotes,
            downvotes: voteValue === -1 ? currentDownvotes + 1 : currentDownvotes,
          })
        }
      } catch (error) {
        console.error('Error voting on comment:', error)
        throw error
      }
    },
    [actions],
  )

  return { voteOnThread, voteOnComment }
}
