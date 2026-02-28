import { useCallback } from 'react';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

interface UseCommentThreadOptions {
  entityType: 'blog' | 'statement' | 'amendment';
  entityId: string;
  threadId: string;
}

/**
 * Shared hook for comment thread operations (add, vote, delete).
 * Works generically with the document actions layer.
 */
export function useCommentThread({ entityType, entityId, threadId }: UseCommentThreadOptions) {
  const { user } = useAuth();
  const { addComment, voteComment, updateCommentVote, deleteCommentVote } = useDocumentActions();

  const addCommentToThread = useCallback(
    async (text: string, parentId?: string) => {
      if (!user?.id) {
        toast.error('Please log in to comment');
        return;
      }
      const commentId = crypto.randomUUID();
      await addComment({
        id: commentId,
        thread_id: threadId,
        parent_id: parentId ?? null,
        content: text,
        upvotes: 0,
        downvotes: 0,
        user_id: user.id,
      });
    },
    [user, addComment],
  );

  const handleVote = useCallback(
    async (
      commentId: string,
      voteValue: number,
      existingVote?: { id: string; vote: number },
    ) => {
      if (!user?.id) {
        toast.error('Please log in to vote');
        return;
      }
      if (existingVote) {
        if (existingVote.vote === voteValue) {
          await deleteCommentVote(existingVote.id);
        } else {
          await updateCommentVote({ id: existingVote.id, vote: voteValue });
        }
      } else {
        await voteComment({
          id: crypto.randomUUID(),
          vote: voteValue,
          comment_id: commentId,
          user_id: user.id,
        });
      }
    },
    [user, voteComment, updateCommentVote, deleteCommentVote],
  );

  return {
    addComment: addCommentToThread,
    voteComment: handleVote,
  };
}
