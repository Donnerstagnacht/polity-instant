import { useState } from 'react';
import { useStatementActions } from '@/zero/statements/useStatementActions';
import { useCommonActions } from '@/zero/common/useCommonActions';

/**
 * Hook for statement mutations with cross-domain orchestration (timeline events).
 * Composes useStatementActions + useCommonActions.
 */
export function useStatementMutations() {
  const {
    createStatement: create,
    updateStatement: update,
    deleteStatement: remove,
    createSupportVote,
    updateSupportVote,
    deleteSupportVote,
    createSurvey,
    deleteSurvey,
    createSurveyOption,
    deleteSurveyOption,
    createSurveyVote,
    deleteSurveyVote,
  } = useStatementActions();
  const { createTimelineEvent } = useCommonActions();
  const [isLoading, setIsLoading] = useState(false);

  const createStatement = async (
    userId: string,
    text: string,
    options: {
      groupId?: string | null;
      imageUrl?: string | null;
      videoUrl?: string | null;
      visibility?: 'public' | 'authenticated' | 'private';
    } = {}
  ) => {
    const { groupId, imageUrl, videoUrl, visibility = 'public' } = options;
    setIsLoading(true);
    try {
      const statementId = crypto.randomUUID();

      await create({
        id: statementId,
        text,
        group_id: groupId ?? null,
        image_url: imageUrl ?? null,
        video_url: videoUrl ?? null,
        visibility,
      });

      if (visibility === 'public') {
        await createTimelineEvent({
          id: crypto.randomUUID(),
          event_type: 'statement_posted',
          entity_type: 'statement',
          entity_id: statementId,
          actor_id: userId,
          title: 'New statement posted',
          description: text ? text.substring(0, 100) + (text.length > 100 ? '...' : '') : '',
          content_type: 'statement',
          metadata: {},
          image_url: imageUrl ?? '',
          video_url: videoUrl ?? '',
          video_thumbnail_url: '',
          tags: [],
          stats: {},
          vote_status: '',
          election_status: '',
          ends_at: 0,
          user_id: userId,
          group_id: groupId ?? null,
          amendment_id: null,
          event_id: null,
          todo_id: null,
          blog_id: null,
          statement_id: statementId,
          election_id: null,
          amendment_vote_id: null,
        });
      }

      return { success: true, statementId };
    } catch (error) {
      console.error('Failed to create statement:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatement = async (
    statementId: string,
    text: string,
    options: {
      imageUrl?: string | null;
      videoUrl?: string | null;
      visibility?: 'public' | 'authenticated' | 'private';
      userId?: string;
    } = {}
  ) => {
    const { imageUrl, videoUrl, visibility, userId } = options;
    setIsLoading(true);
    try {
      await update({
        id: statementId,
        text,
        ...(imageUrl !== undefined && { image_url: imageUrl }),
        ...(videoUrl !== undefined && { video_url: videoUrl }),
        ...(visibility !== undefined && { visibility }),
      });

      if (visibility === 'public' && userId) {
        await createTimelineEvent({
          id: crypto.randomUUID(),
          event_type: 'updated',
          entity_type: 'statement',
          entity_id: statementId,
          actor_id: userId,
          title: 'Statement updated',
          description: text ? text.substring(0, 100) + (text.length > 100 ? '...' : '') : '',
          content_type: 'statement',
          metadata: {},
          image_url: imageUrl ?? '',
          video_url: videoUrl ?? '',
          video_thumbnail_url: '',
          tags: [],
          stats: {},
          vote_status: '',
          election_status: '',
          ends_at: 0,
          user_id: userId,
          group_id: null,
          amendment_id: null,
          event_id: null,
          todo_id: null,
          blog_id: null,
          statement_id: statementId,
          election_id: null,
          amendment_vote_id: null,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update statement:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStatement = async (statementId: string) => {
    setIsLoading(true);
    try {
      await remove(statementId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete statement:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createStatement,
    updateStatement,
    deleteStatement,
    createSupportVote,
    updateSupportVote,
    deleteSupportVote,
    createSurvey,
    deleteSurvey,
    createSurveyOption,
    deleteSurveyOption,
    createSurveyVote,
    deleteSurveyVote,
    isLoading,
  };
}
