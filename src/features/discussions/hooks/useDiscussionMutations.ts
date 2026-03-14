import { useCallback } from 'react';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';

/**
 * Orchestration hook for discussion thread & comment mutations.
 * Replaces direct Supabase calls in thread-operations.ts.
 * Server mutators handle notifications automatically.
 */
export function useDiscussionMutations() {
  const { createThread: zeroCreateThread, addComment: zeroAddComment } = useDocumentActions();

  const createThread = useCallback(
    async (
      amendmentId: string,
      title: string,
      description: string,
      _userId: string,
      fileId?: string,
    ) => {
      const content = description ? `${title}\n\n${description}` : title;
      const threadId = crypto.randomUUID();

      await zeroCreateThread({
        id: threadId,
        amendment_id: amendmentId,
        document_id: fileId ?? null,
        statement_id: null,
        blog_id: null,
        user_id: _userId,
        content,
        status: 'open',
        resolved_at: null,
        upvotes: 0,
        downvotes: 0,
        position: null,
      });

      return threadId;
    },
    [zeroCreateThread]
  );

  const createComment = useCallback(
    async (
      threadId: string,
      text: string,
      _userId: string,
      parentCommentId?: string,
    ) => {
      const commentId = crypto.randomUUID();

      await zeroAddComment({
        id: commentId,
        thread_id: threadId,
        user_id: _userId,
        parent_id: parentCommentId ?? null,
        content: text,
        upvotes: 0,
        downvotes: 0,
      });

      return commentId;
    },
    [zeroAddComment]
  );

  return {
    createThread,
    createComment,
  };
}
