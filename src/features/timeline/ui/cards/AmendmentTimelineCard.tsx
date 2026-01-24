'use client';

import { ScrollText, ThumbsUp, ThumbsDown, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
  TimelineCardBadge,
} from './TimelineCardBase';

export interface AmendmentTimelineCardProps {
  amendment: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    status:
      | 'collaborative_editing'
      | 'internal_suggesting'
      | 'internal_voting'
      | 'viewing'
      | 'event_suggesting'
      | 'event_voting'
      | 'passed'
      | 'rejected';
    supportPercentage?: number;
    supportCount?: number;
    opposeCount?: number;
    commentCount?: number;
    groupName?: string;
  };
  onSupport?: () => void;
  onOppose?: () => void;
  onComment?: () => void;
  className?: string;
}

/**
 * Status badge configuration
 */
const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  collaborative_editing: { label: 'Editing', variant: 'secondary' },
  internal_suggesting: { label: 'Suggesting', variant: 'secondary' },
  internal_voting: { label: 'Voting', variant: 'destructive' },
  viewing: { label: 'Viewing', variant: 'outline' },
  event_suggesting: { label: 'Event Suggesting', variant: 'secondary' },
  event_voting: { label: 'Event Voting', variant: 'destructive' },
  passed: { label: 'Passed', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

/**
 * AmendmentTimelineCard - The Proposal card
 *
 * Displays an amendment with:
 * - Purple-blue gradient header
 * - Status badge (Editing, Voting, Passed, etc.)
 * - Title and description
 * - Vote progress bar (when in voting status)
 * - Support/Oppose counts
 * - Actions: Support, View Document, Discuss
 */
export function AmendmentTimelineCard({
  amendment,
  onSupport,
  onOppose,
  onComment,
  className,
}: AmendmentTimelineCardProps) {
  const { t } = useTranslation();

  const statusConfig = STATUS_CONFIG[amendment.status] || STATUS_CONFIG.viewing;
  const isVoting = amendment.status.includes('voting');
  const isCompleted = amendment.status === 'passed' || amendment.status === 'rejected';

  return (
    <TimelineCardBase contentType="amendment" className={className}>
      <TimelineCardHeader
        contentType="amendment"
        title={amendment.title}
        subtitle={amendment.groupName}
        badge={
          <TimelineCardBadge
            label={t('features.timeline.contentTypes.amendment')}
            icon={ScrollText}
          />
        }
      >
        {/* Status Badge */}
        <div className="mt-2 flex justify-center">
          <Badge
            variant={statusConfig.variant}
            className={cn('px-3 py-1 text-xs', isVoting && 'animate-pulse')}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </TimelineCardHeader>

      <TimelineCardContent>
        {amendment.description && (
          <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{amendment.description}</p>
        )}

        {/* Vote Progress Bar */}
        {(isVoting || isCompleted) && amendment.supportPercentage !== undefined && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('features.timeline.cards.support')}</span>
              <span
                className={cn(
                  'font-medium',
                  amendment.supportPercentage >= 50 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {amendment.supportPercentage}%
              </span>
            </div>
            <Progress
              value={amendment.supportPercentage}
              className={cn(
                'h-2',
                amendment.status === 'passed' && '[&>div]:bg-green-500',
                amendment.status === 'rejected' && '[&>div]:bg-red-500'
              )}
            />
          </div>
        )}

        {/* Vote Counts */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {amendment.supportCount !== undefined && (
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
              <span>{amendment.supportCount}</span>
            </div>
          )}
          {amendment.opposeCount !== undefined && (
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
              <span>{amendment.opposeCount}</span>
            </div>
          )}
          {amendment.commentCount !== undefined && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{amendment.commentCount}</span>
            </div>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        {isVoting && (
          <>
            <TimelineCardActionButton
              icon={ThumbsUp}
              label={t('features.timeline.cards.support')}
              onClick={onSupport}
              variant="outline"
            />
            <TimelineCardActionButton
              icon={ThumbsDown}
              label={t('features.timeline.cards.oppose')}
              onClick={onOppose}
              variant="outline"
            />
          </>
        )}
        <Link href={`/amendment/${amendment.id}`}>
          <TimelineCardActionButton
            icon={ExternalLink}
            label={t('features.timeline.cards.viewDocument')}
          />
        </Link>
        <TimelineCardActionButton
          icon={MessageSquare}
          label={t('features.timeline.cards.discuss')}
          onClick={onComment}
        />
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
