import { useState } from 'react';
import { useTodoActions } from '@/zero/todos/useTodoActions';
import { useCommonActions } from '@/zero/common/useCommonActions';
import { useNotificationActions } from '@/zero/notifications/useNotificationActions';

/**
 * Orchestration hook for todo mutations.
 * Composes facade actions (todo, common, notification) — no direct Zero usage.
 */
export function useTodoMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const todoActions = useTodoActions();
  const commonActions = useCommonActions();
  const notificationActions = useNotificationActions();

  const createTodo = async (todoData: {
    title: string;
    description?: string;
    ownerId: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    dueDate?: number;
    groupId?: string;
    eventId?: string;
    amendmentId?: string;
    senderId?: string;
    visibility?: 'public' | 'authenticated' | 'private';
  }) => {
    setIsLoading(true);
    try {
      const todoId = crypto.randomUUID();

      await todoActions.createTodo({
        id: todoId,
        title: todoData.title,
        description: todoData.description ?? '',
        status: todoData.status || 'open',
        priority: todoData.priority || 'medium',
        due_date: todoData.dueDate ?? 0,
        completed_at: 0,
        tags: [],
        visibility: todoData.visibility || 'private',
        group_id: todoData.groupId ?? '',
        event_id: todoData.eventId ?? '',
        amendment_id: todoData.amendmentId ?? '',
      });

      if (todoData.assigneeId) {
        await todoActions.assignUser({
          id: crypto.randomUUID(),
          todo_id: todoId,
          user_id: todoData.assigneeId,
          role: 'assignee',
        });
      }

      if (todoData.visibility === 'public') {
        await commonActions.createTimelineEvent({
          id: crypto.randomUUID(),
          event_type: 'todo_created',
          entity_type: 'todo',
          entity_id: todoId,
          actor_id: todoData.ownerId,
          title: `New task: ${todoData.title}`,
          description: todoData.description?.substring(0, 100) ?? '',
          metadata: null,
          image_url: '',
          video_url: '',
          video_thumbnail_url: '',
          content_type: 'todo',
          tags: null,
          stats: null,
          vote_status: '',
          election_status: '',
          ends_at: 0,
          user_id: null,
          group_id: todoData.groupId ?? '',
          amendment_id: todoData.amendmentId ?? '',
          event_id: todoData.eventId ?? '',
          todo_id: todoId,
          blog_id: null,
          statement_id: null,
          election_id: null,
          amendment_vote_id: null,
        });
      }

      if (todoData.senderId && todoData.assigneeId && todoData.assigneeId !== todoData.senderId) {
        await notificationActions.createNotification({
          id: crypto.randomUUID(),
          sender_id: todoData.senderId,
          recipient_id: todoData.assigneeId,
          type: 'todo_assigned',
          category: null,
          title: 'Task Assigned',
          message: `You have been assigned "${todoData.title}"`,
          action_url: '/todos',
          related_entity_type: '',
          on_behalf_of_entity_type: '',
          on_behalf_of_entity_id: null,
          recipient_entity_type: '',
          recipient_entity_id: null,
          related_user_id: null,
          related_group_id: null,
          related_amendment_id: null,
          related_event_id: null,
          related_blog_id: null,
          on_behalf_of_group_id: null,
          on_behalf_of_event_id: null,
          on_behalf_of_amendment_id: null,
          on_behalf_of_blog_id: null,
          recipient_group_id: null,
          recipient_event_id: null,
          recipient_amendment_id: null,
          recipient_blog_id: null,
        });
      }

      return { success: true, todoId };
    } catch (error) {
      console.error('Failed to create todo:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateTodo = async (
    todoId: string,
    updates: Omit<Parameters<typeof todoActions.updateTodo>[0], 'id'>,
    options?: {
      senderId?: string;
      senderName?: string;
      creatorId?: string;
      todoTitle?: string;
      visibility?: 'public' | 'authenticated' | 'private';
    }
  ) => {
    setIsLoading(true);
    try {
      await todoActions.updateTodo({ id: todoId, ...updates });

      if (updates.status === 'completed' && options?.visibility === 'public' && options?.senderId) {
        await commonActions.createTimelineEvent({
          id: crypto.randomUUID(),
          event_type: 'status_changed',
          entity_type: 'todo',
          entity_id: todoId,
          actor_id: options.senderId,
          title: `Task completed: ${options.todoTitle || 'Task'}`,
          description: 'A task has been marked as completed',
          metadata: null,
          image_url: '',
          video_url: '',
          video_thumbnail_url: '',
          content_type: 'todo',
          tags: null,
          stats: null,
          vote_status: '',
          election_status: '',
          ends_at: 0,
          user_id: null,
          group_id: null,
          amendment_id: null,
          event_id: null,
          todo_id: todoId,
          blog_id: null,
          statement_id: null,
          election_id: null,
          amendment_vote_id: null,
        });
      }

      if (
        updates.status === 'completed' &&
        options?.senderId &&
        options?.creatorId &&
        options.senderId !== options.creatorId &&
        options.todoTitle
      ) {
        await notificationActions.createNotification({
          id: crypto.randomUUID(),
          sender_id: options.senderId,
          recipient_id: options.creatorId,
          type: 'todo_completed',
          category: null,
          title: 'Task Completed',
          message: `${options.senderName || 'Someone'} has completed "${options.todoTitle}"`,
          action_url: '/todos',
          related_entity_type: '',
          on_behalf_of_entity_type: '',
          on_behalf_of_entity_id: null,
          recipient_entity_type: '',
          recipient_entity_id: null,
          related_user_id: null,
          related_group_id: null,
          related_amendment_id: null,
          related_event_id: null,
          related_blog_id: null,
          on_behalf_of_group_id: null,
          on_behalf_of_event_id: null,
          on_behalf_of_amendment_id: null,
          on_behalf_of_blog_id: null,
          recipient_group_id: null,
          recipient_event_id: null,
          recipient_amendment_id: null,
          recipient_blog_id: null,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update todo:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (
    todoId: string,
    params?: {
      senderId?: string;
      senderName?: string;
      todoTitle?: string;
      assigneeUserIds?: string[];
    }
  ) => {
    setIsLoading(true);
    try {
      await todoActions.deleteTodo(todoId);

      if (params?.senderId && params?.senderName && params?.todoTitle && params?.assigneeUserIds) {
        for (const assigneeId of params.assigneeUserIds) {
          if (assigneeId !== params.senderId) {
            await notificationActions.createNotification({
              id: crypto.randomUUID(),
              sender_id: params.senderId,
              recipient_id: assigneeId,
              type: 'todo_deleted',
              category: null,
              title: 'Task Deleted',
              message: `${params.senderName} has deleted "${params.todoTitle}"`,
              action_url: '/todos',
              related_entity_type: '',
              on_behalf_of_entity_type: '',
              on_behalf_of_entity_id: null,
              recipient_entity_type: '',
              recipient_entity_id: null,
              related_user_id: null,
              related_group_id: null,
              related_amendment_id: null,
              related_event_id: null,
              related_blog_id: null,
              on_behalf_of_group_id: null,
              on_behalf_of_event_id: null,
              on_behalf_of_amendment_id: null,
              on_behalf_of_blog_id: null,
              recipient_group_id: null,
              recipient_event_id: null,
              recipient_amendment_id: null,
              recipient_blog_id: null,
            });
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete todo:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTodo,
    updateTodo,
    deleteTodo,
    isLoading,
  };
}
