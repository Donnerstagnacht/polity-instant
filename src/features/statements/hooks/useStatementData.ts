import { useState, useMemo } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

/**
 * Hook to query statement data
 */
export function useStatementData(statementId?: string) {
  const { data, isLoading, error } = db.useQuery(
    statementId
      ? {
          statements: {
            $: { where: { id: statementId } },
            user: {},
          },
        }
      : null
  );

  const statement = useMemo(() => data?.statements?.[0] || null, [data]);

  return {
    statement,
    isLoading,
    error,
  };
}

/**
 * Hook for statement mutations
 */
export function useStatementMutations() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Create a new statement
   */
  const createStatement = async (
    userId: string,
    text: string,
    tag: string,
    visibility: 'public' | 'authenticated' | 'private' = 'public'
  ) => {
    setIsLoading(true);
    try {
      const statementId = id();
      const transactions: any[] = [
        tx.statements[statementId]
          .update({
            text,
            tag,
            visibility,
          })
          .link({ user: userId }),
      ];

      // Add timeline event for public statements
      if (visibility === 'public') {
        transactions.push(
          createTimelineEvent({
            eventType: 'statement_posted',
            entityType: 'statement',
            entityId: statementId,
            actorId: userId,
            title: `New statement posted`,
            description: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            tags: tag ? [tag] : undefined,
          })
        );
      }

      await db.transact(transactions);
      toast.success('Statement created successfully');
      return { success: true, statementId };
    } catch (error) {
      console.error('Failed to create statement:', error);
      toast.error('Failed to create statement');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a statement
   */
  const updateStatement = async (
    statementId: string,
    text: string,
    tag: string,
    userId?: string,
    visibility?: 'public' | 'authenticated' | 'private'
  ) => {
    setIsLoading(true);
    try {
      const transactions: any[] = [
        tx.statements[statementId].update({
          text,
          tag,
          updatedAt: new Date().toISOString(),
        }),
      ];

      // Add timeline event for public statement updates
      if (visibility === 'public' && userId) {
        transactions.push(
          createTimelineEvent({
            eventType: 'updated',
            entityType: 'statement',
            entityId: statementId,
            actorId: userId,
            title: 'Statement updated',
            description: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            tags: tag ? [tag] : undefined,
          })
        );
      }

      await db.transact(transactions);
      toast.success('Statement updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to update statement:', error);
      toast.error('Failed to update statement');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a statement
   */
  const deleteStatement = async (statementId: string) => {
    setIsLoading(true);
    try {
      await db.transact([tx.statements[statementId].delete()]);
      toast.success('Statement deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete statement:', error);
      toast.error('Failed to delete statement');
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
