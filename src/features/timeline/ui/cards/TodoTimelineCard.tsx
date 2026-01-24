'use client';

import { CheckSquare, Square, Users, ExternalLink, Share2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { differenceInDays, format, isPast, isToday } from 'date-fns';
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
export function TodoTimelineCard({
  todo,
  onToggle,
  onVolunteer,
  onShare,
  className,
}: TodoTimelineCardProps) {
  const { t } = useTranslation();

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const urgency = dueDate ? getUrgencyConfig(dueDate) : null;
  const progress =
    todo.progress ??
    (todo.currentValue && todo.targetValue
      ? Math.round((todo.currentValue / todo.targetValue) * 100)
      : undefined);

  return (
    <TimelineCardBase contentType="todo" className={className}>
      <TimelineCardContent className="pt-4">
        {/* Title with Checkbox */}
        <div className="mb-3 flex items-start gap-3">
          <button onClick={onToggle} className="mt-0.5 flex-shrink-0">
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
          {todo.assigneeCount !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {todo.assigneeCount} {t('features.timeline.cards.assigned')}
            </span>
          )}
          {todo.groupName && (
            <Link href={`/group/${todo.groupId}`} className="truncate hover:underline">
              {todo.groupName}
            </Link>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        <Link href={`/todos/${todo.id}`}>
          <TimelineCardActionButton icon={ExternalLink} label={t('features.timeline.cards.view')} />
        </Link>
        {!todo.isCompleted && (
          <TimelineCardActionButton
            icon={Users}
            label={t('features.timeline.cards.volunteer')}
            onClick={onVolunteer}
          />
        )}
        <TimelineCardActionButton
          icon={Share2}
          label={t('features.timeline.cards.share')}
          onClick={onShare}
        />
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
