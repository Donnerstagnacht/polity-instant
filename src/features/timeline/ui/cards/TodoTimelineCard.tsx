'use client';

import { useState } from 'react';
import { CheckSquare, Square, Users, Clock, UserPlus, Activity, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { differenceInDays, format, isPast, isToday } from 'date-fns';
import { ShareButton } from '@/components/shared/ShareButton';
import { useTodoMutations } from '@/features/todos/hooks/useTodoData';
import type { TodoStatus } from '@/features/todos/types/todo.types';
import { db, tx, id } from '@db/db';
import { toast } from 'sonner';
import {
  TimelineCardBase,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
} from './TimelineCardBase';

export interface TodoTimelineCardProps {
  todo: {
    id: string;
    title: string;
    description?: string;
    isCompleted?: boolean;
    dueDate?: string | Date;
    progress?: number; // 0-100
    currentValue?: number;
    targetValue?: number;
    unit?: string;
    assigneeCount?: number;
    groupName?: string;
    groupId?: string;
    status?: TodoStatus;
    visibility?: 'public' | 'authenticated' | 'private';
    creatorId?: string;
    creatorName?: string;
  };
  onToggle?: () => void;
  onVolunteer?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * Get urgency configuration based on due date
 */
function getUrgencyConfig(dueDate: Date): { color: string; bgColor: string; label: string } {
  const daysUntilDue = differenceInDays(dueDate, new Date());

  if (isPast(dueDate)) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/40',
      label: 'Overdue',
    };
  }

  if (isToday(dueDate) || daysUntilDue === 0) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/40',
      label: 'Due Today',
    };
  }

  if (daysUntilDue <= 3) {
    return {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/40',
      label: `Due in ${daysUntilDue} days`,
    };
  }

  if (daysUntilDue <= 7) {
    return {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/40',
      label: `Due in ${daysUntilDue} days`,
    };
  }

  return {
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/40',
    label: format(dueDate, 'MMM d'),
  };
}

/**
 * TodoTimelineCard - The Action Item card
 *
 * Displays a shared/community todo with:
 * - Checkbox visual for completion status
 * - Title and description
 * - Urgency badge (color-coded by due date)
 * - Progress bar (if applicable)
 * - Assignee count
 * - Actions: View, Volunteer, Share
 */
export function TodoTimelineCard({ todo, onToggle, className }: TodoTimelineCardProps) {
  const { t } = useTranslation();
  const { user } = db.useAuth();
  const [statusOpen, setStatusOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { updateTodo, isLoading } = useTodoMutations();
  const { data: assignmentsData } = db.useQuery(
    todo.id
      ? {
          todoAssignments: {
            $: {
              where: {
                'todo.id': todo.id,
              },
            },
            user: {},
          },
        }
      : null
  );

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const urgency = dueDate ? getUrgencyConfig(dueDate) : null;
  const progress =
    todo.progress ??
    (todo.currentValue && todo.targetValue
      ? Math.round((todo.currentValue / todo.targetValue) * 100)
      : undefined);
  const assignments = assignmentsData?.todoAssignments ?? [];
  const isAssignedToMe = !!user?.id && assignments.some(a => a.user?.id === user.id);

  const currentStatus = todo.status || (todo.isCompleted ? 'completed' : 'pending');
  const statusLabels: Record<TodoStatus, string> = {
    pending: t('features.todos.status.pending'),
    in_progress: t('features.todos.status.in_progress'),
    completed: t('features.todos.status.completed'),
    cancelled: t('features.todos.status.cancelled'),
  };

  const handleStatusUpdate = async (newStatus: TodoStatus) => {
    await updateTodo(
      todo.id,
      { status: newStatus },
      {
        senderId: user?.id,
        senderName: user?.email?.split('@')[0] || 'Someone',
        creatorId: todo.creatorId,
        todoTitle: todo.title,
        visibility: todo.visibility,
      }
    );
    setStatusOpen(false);
  };

  const handleAssignToMe = async () => {
    if (!user?.id) {
      toast.error(t('features.todos.kanban.updateFailed'));
      return;
    }
    if (isAssignedToMe) {
      toast.success(t('features.todos.assignee.assignedToMe'));
      return;
    }
    setAssigning(true);
    try {
      const assignmentId = id();
      await db.transact([
        tx.todoAssignments[assignmentId]
          .update({
            assignedAt: new Date().toISOString(),
            role: 'assignee',
          })
          .link({
            todo: todo.id,
            user: user.id,
          }),
      ]);
      toast.success(t('features.todos.assignee.assignedToMe'));
    } catch (error) {
      console.error('Failed to assign todo:', error);
      toast.error(t('features.todos.kanban.updateFailed'));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <TimelineCardBase contentType="todo" className={className} href={`/todos/${todo.id}`}>
      <TimelineCardContent className="pt-4">
        {/* Title with Checkbox */}
        <div className="mb-3 flex items-start gap-3">
          <button
            onClick={e => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="mt-0.5 flex-shrink-0"
          >
            {todo.isCompleted ? (
              <CheckSquare className="h-5 w-5 text-green-600" />
            ) : (
              <Square className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
            )}
          </button>
          <h3
            className={cn(
              'text-base font-semibold leading-tight',
              todo.isCompleted && 'text-muted-foreground line-through'
            )}
          >
            {todo.title}
          </h3>
        </div>

        {todo.description && (
          <p className="mb-3 ml-8 line-clamp-2 text-sm text-muted-foreground">{todo.description}</p>
        )}

        {/* Urgency Badge */}
        {urgency && !todo.isCompleted && (
          <div className="mb-3">
            <Badge variant="outline" className={cn('text-xs', urgency.bgColor, urgency.color)}>
              <Clock className="mr-1 h-3 w-3" />
              {urgency.label}
            </Badge>
          </div>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('features.timeline.cards.progress')}</span>
              <span className="font-medium">
                {todo.currentValue !== undefined && todo.targetValue !== undefined
                  ? `${todo.currentValue} / ${todo.targetValue}${todo.unit ? ` ${todo.unit}` : ''}`
                  : `${progress}%`}
              </span>
            </div>
            <Progress
              value={progress}
              className={cn('h-2', progress >= 100 && '[&>div]:bg-green-500')}
            />
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {(todo.assigneeCount !== undefined || assignments.length > 0) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-help items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">{todo.assigneeCount ?? assignments.length}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {(todo.assigneeCount ?? assignments.length) || 0}{' '}
                  {t('features.timeline.cards.assigned')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          {progress !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-help items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  <span className="font-medium">{progress}%</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {progress}% {t('features.timeline.cards.progress')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          {todo.groupName && (
            <Link
              href={`/group/${todo.groupId}`}
              className="truncate hover:underline"
              onClick={e => e.stopPropagation()}
            >
              {todo.groupName}
            </Link>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        {/* Status Popover */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" />
              <span className="text-xs">{statusLabels[currentStatus]}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              {(['pending', 'in_progress', 'completed', 'cancelled'] as TodoStatus[])
                .filter(status => status !== currentStatus)
                .map(status => (
                  <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.preventDefault();
                      handleStatusUpdate(status);
                    }}
                    disabled={isLoading}
                    className="justify-start"
                  >
                    {statusLabels[status]}
                  </Button>
                ))}
            </div>
          </PopoverContent>
        </Popover>

        <TimelineCardActionButton
          icon={isAssignedToMe ? UserCheck : UserPlus}
          label={
            isAssignedToMe
              ? t('features.todos.assignee.assignedToMe')
              : t('features.todos.assignee.assignToMe')
          }
          onClick={e => {
            e?.preventDefault();
            e?.stopPropagation();
            handleAssignToMe();
          }}
          disabled={assigning || isAssignedToMe}
          variant={isAssignedToMe ? 'secondary' : 'outline'}
        />

        <div onClick={e => e.preventDefault()}>
          <ShareButton
            url={`/todos/${todo.id}`}
            title={todo.title}
            description={todo.description || ''}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
