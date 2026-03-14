import { useCallback, useMemo, useState } from 'react';
import { useStatementState } from '@/zero/statements/useStatementState';
import { useStatementActions } from '@/zero/statements/useStatementActions';
import { useStatementMutations } from '@/features/statements/hooks/useStatementMutations';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useAuth } from '@/providers/auth-provider';
import type { VoteValue } from '@/features/shared/ui/voting/VoteButtons';
import type { CommentData } from '@/features/shared/ui/comments/CommentItem';

interface UseStatementDetailOptions {
  id: string;
}

export function useStatementDetail({ id }: UseStatementDetailOptions) {
  const { user } = useAuth();
  const userId = user?.id;

  const { statementWithDetails: statement, isLoading } = useStatementState({
    id,
    includeDetails: true,
  });

  const {
    deleteStatement,
    updateStatement,
    createSupportVote,
    updateSupportVote,
    deleteSupportVote,
    createSurvey,
    deleteSurvey,
    createSurveyOption,
    deleteSurveyOption,
    createSurveyVote,
    deleteSurveyVote,
  } = useStatementMutations();

  const { updateStatement: updateStatementRaw } = useStatementActions();

  const {
    createThread,
    addComment,
    voteComment,
    updateCommentVote,
    deleteCommentVote,
  } = useDocumentActions();

  // ── Edit state ─────────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditOpen = useCallback(() => setIsEditOpen(true), []);
  const handleEditClose = useCallback(() => setIsEditOpen(false), []);

  const handleUpdate = useCallback(
    async (text: string, options?: { imageUrl?: string | null; videoUrl?: string | null; visibility?: 'public' | 'authenticated' | 'private' }) => {
      await updateStatement(id, text, options);
      setIsEditOpen(false);
    },
    [id, updateStatement],
  );

  // ── Vote handling ──────────────────────────────────────────────
  const supportVotes = statement?.support_votes ?? [];

  const computedUpvotes = useMemo(
    () => supportVotes.filter((v) => v.vote === 1).length,
    [supportVotes],
  );

  const computedDownvotes = useMemo(
    () => supportVotes.filter((v) => v.vote === -1).length,
    [supportVotes],
  );

  const currentVote = useMemo(() => {
    if (!userId || !statement) return null;
    return supportVotes.find((v) => v.user_id === userId) ?? null;
  }, [userId, statement, supportVotes]);

  const currentVoteValue: VoteValue = (currentVote?.vote ?? 0) as VoteValue;

  const handleVote = useCallback(
    async (value: VoteValue) => {
      if (!userId) return;
      if (value === 0 && currentVote) {
        await deleteSupportVote(currentVote.id);
      } else if (currentVote) {
        await updateSupportVote({ id: currentVote.id, vote: value });
      } else {
        await createSupportVote({
          id: crypto.randomUUID(),
          statement_id: id,
          vote: value,
        });
      }
    },
    [userId, id, currentVote, createSupportVote, updateSupportVote, deleteSupportVote],
  );

  // ── Survey handling ────────────────────────────────────────────
  const survey = useMemo(() => {
    const surveys = statement?.surveys ?? [];
    return surveys[0] ?? null;
  }, [statement]);

  const handleSurveyVote = useCallback(
    async (optionId: string, existingVoteId?: string) => {
      if (!userId) return;
      // If changing vote, delete the old one first
      if (existingVoteId) {
        await deleteSurveyVote(existingVoteId);
      }
      await createSurveyVote({ id: crypto.randomUUID(), option_id: optionId });
    },
    [userId, createSurveyVote, deleteSurveyVote],
  );

  const handleSurveyRetract = useCallback(
    async (voteId: string) => {
      await deleteSurveyVote(voteId);
    },
    [deleteSurveyVote],
  );

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    await deleteStatement(id);
  }, [id, deleteStatement]);

  // ── Thread / Comment handling ──────────────────────────────────
  const threads = statement?.threads ?? [];

  // Get or lazily create the single discussion thread for this statement
  const discussionThread = threads[0] ?? null;

  // Type aliases for the 3 levels of comment nesting the query returns
  type TopComment = NonNullable<typeof discussionThread>['comments'][number];
  type Level1Reply = TopComment['replies'][number];
  type Level2Reply = Level1Reply['replies'][number];
  type AnyComment = TopComment | Level1Reply | Level2Reply;

  // Count all comments (including nested replies) across all threads
  const computedCommentCount = useMemo(() => {
    let count = 0;
    for (const thread of threads) {
      for (const c of thread.comments ?? []) {
        count++;
        for (const r1 of c.replies ?? []) {
          count++;
          for (const r2 of r1.replies ?? []) {
            count++;
          }
        }
      }
    }
    return count;
  }, [threads]);

  // Map all comments (from all threads) into CommentData shape
  const comments: CommentData[] = useMemo(() => {
    if (!discussionThread) return [];
    const rawComments = discussionThread.comments ?? [];

    const mapComment = (c: AnyComment): CommentData => ({
      id: c.id,
      text: c.content ?? '',
      createdAt: c.created_at,
      creator: c.user
        ? {
            id: c.user.id,
            name: `${c.user.first_name ?? ''} ${c.user.last_name ?? ''}`.trim() || c.user.handle || 'Unknown',
            handle: c.user.handle ?? undefined,
            avatar: c.user.avatar ?? undefined,
          }
        : undefined,
      votes: [...c.votes].map((v) => ({
        id: v.id,
        vote: v.vote ?? 0,
        user: v.user ? { id: v.user.id } : undefined,
      })),
      replies: 'replies' in c ? [...(c.replies as readonly AnyComment[])].map(mapComment) : [],
    });

    // Top-level: comments with no parent_id
    return rawComments.filter((c) => !c.parent_id).map(mapComment);
  }, [discussionThread]);

  const handleAddComment = useCallback(
    async (text: string, parentId?: string) => {
      if (!userId) return;
      let threadId = discussionThread?.id;

      // Create thread on first comment
      if (!threadId) {
        threadId = crypto.randomUUID();
        await createThread({
          id: threadId,
          statement_id: id,
          document_id: null,
          amendment_id: null,
          blog_id: null,
          content: null,
          status: 'open',
          resolved_at: null,
          upvotes: 0,
          downvotes: 0,
          position: null,
          user_id: userId,
        });
      }

      await addComment({
        id: crypto.randomUUID(),
        thread_id: threadId,
        parent_id: parentId ?? null,
        content: text,
        user_id: userId,
        upvotes: 0,
        downvotes: 0,
      });

      // Increment denormalized comment_count on the statement
      await updateStatementRaw({ id, comment_count: computedCommentCount + 1 });
    },
    [userId, id, discussionThread, createThread, addComment, updateStatementRaw, computedCommentCount],
  );

  const handleCommentVote = useCallback(
    async (commentId: string, voteValue: number, existingVote?: { id: string; vote: number }) => {
      if (!userId) return;
      if (existingVote) {
        if (existingVote.vote === voteValue) {
          await deleteCommentVote(existingVote.id);
        } else {
          await updateCommentVote({ id: existingVote.id, vote: voteValue });
        }
      } else {
        await voteComment({
          id: crypto.randomUUID(),
          comment_id: commentId,
          vote: voteValue,
          user_id: userId,
        });
      }
    },
    [userId, voteComment, updateCommentVote, deleteCommentVote],
  );

  const isOwner = !!userId && statement?.user_id === userId;

  // ── Survey CRUD for editing ────────────────────────────────────
  const handleSaveSurvey = useCallback(
    async (question: string, options: string[], durationHours: number) => {
      // Delete existing survey if present
      if (survey) {
        await deleteSurvey(survey.id);
      }

      const surveyId = crypto.randomUUID();
      const endsAt = Date.now() + durationHours * 60 * 60 * 1000;
      await createSurvey({
        id: surveyId,
        statement_id: id,
        question: question.trim(),
        ends_at: endsAt,
      });

      const validOptions = options.filter(o => o.trim());
      for (let i = 0; i < validOptions.length; i++) {
        await createSurveyOption({
          id: crypto.randomUUID(),
          survey_id: surveyId,
          label: validOptions[i].trim(),
          position: i,
        });
      }
    },
    [id, survey, createSurvey, createSurveyOption, deleteSurvey],
  );

  const handleDeleteSurvey = useCallback(async () => {
    if (survey) {
      await deleteSurvey(survey.id);
    }
  }, [survey, deleteSurvey]);

  return {
    statement,
    isLoading,
    userId,
    isOwner,
    // edit
    isEditOpen,
    handleEditOpen,
    handleEditClose,
    handleUpdate,
    // vote
    computedUpvotes,
    computedDownvotes,
    currentVoteValue,
    handleVote,
    // survey
    survey,
    handleSurveyVote,
    handleSurveyRetract,
    handleSaveSurvey,
    handleDeleteSurvey,
    // comments
    comments,
    handleAddComment,
    handleCommentVote,
    // actions
    handleDelete,
    computedCommentCount,
  };
}
