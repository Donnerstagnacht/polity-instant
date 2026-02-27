import { useState } from 'react';
import { useStatementActions } from '@/zero/statements/useStatementActions';
import { useCommonActions } from '@/zero/common/useCommonActions';

/**
 * Hook for statement mutations with cross-domain orchestration (timeline events).
 * Composes useStatementActions + useCommonActions.
 */
export function useStatementMutations() {
  const { createStatement: create, updateStatement: update, deleteStatement: remove } = useStatementActions();
  const { createTimelineEvent } = useCommonActions();
  const [isLoading, setIsLoading] = useState(false);

  const createStatement = async (
    userId: string,
    text: string,
    tag: string,
    visibility: 'public' | 'authenticated' | 'private' = 'public'
  ) => {
    setIsLoading(true);
    try {
      const statementId = crypto.randomUUID();

      await create({
        id: statementId,
        text,
        tag,
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
          description: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          content_type: 'statement',
          metadata: {},
          image_url: '',
          video_url: '',
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
    tag: string,
    userId?: string,
    visibility?: 'public' | 'authenticated' | 'private'
  ) => {
    setIsLoading(true);
    try {
      await update({
        id: statementId,
        text,
        tag,
      });

      if (visibility === 'public' && userId) {
        await createTimelineEvent({
          id: crypto.randomUUID(),
          event_type: 'updated',
          entity_type: 'statement',
          entity_id: statementId,
          actor_id: userId,
          title: 'Statement updated',
          description: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          content_type: 'statement',
          metadata: {},
          image_url: '',
          video_url: '',
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
    isLoading,
  };
}
