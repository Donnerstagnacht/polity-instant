'use client';

import { Vote, ThumbsUp, ThumbsDown, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShareButton } from '@/components/shared/ShareButton';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
} from './TimelineCardBase';

export interface VoteTimelineCardProps {
  vote: {
    id: string;
    amendmentId: string;
    amendmentTitle: string;
    question?: string;
    status: 'open' | 'closing_soon' | 'last_hour' | 'final_minutes' | 'passed' | 'failed' | 'tied';
    endTime?: string | Date;
    supportPercentage: number;
    supportCount: number;
    opposeCount: number;
    abstainCount?: number;
    totalVoters?: number;
    votedCount?: number;
    trend?: 'up' | 'down' | 'stable';
    trendPercentage?: number;
    hasVoted?: boolean;
    userVote?: 'support' | 'oppose' | 'abstain';
    agendaEventId?: string;
    agendaItemId?: string;
    // Indication support
    isIndicationPhase?: boolean;
    indicationSupportPercentage?: number;
    indicationSupportCount?: number;
    indicationOpposeCount?: number;
    indicationAbstainCount?: number;
  };
  onVoteSupport?: () => void;
  onVoteOppose?: () => void;
  onDiscuss?: () => void;
  className?: string;
}

/**
 * Format remaining time for display
 */
function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diffMs = endTime.getTime() - now.getTime();

  if (diffMs <= 0) return 'Ended';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    return `${days}d ${hours}h`;
  }

  if (diffHours > 0) {
    return `${diffHours}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
  }

  return `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
}

/**
 * Status configuration for vote cards
 */
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; pulse?: boolean }> = {
  open: { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/40' },
  closing_soon: { color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/40' },
  last_hour: { color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/40' },
  final_minutes: { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/40', pulse: true },
  passed: { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/40' },
  failed: { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/40' },
  tied: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/40' },
};

/**
 * VoteTimelineCard - Active Vote card
 *
 * Displays an active or completed vote with:
 * - Red-orange gradient header
 * - Status badge with countdown timer
 * - Amendment title as link
 * - Vote question
 * - Live results progress bar
 * - Trend indicator
 * - Actions: Vote Support, Vote Oppose, Discuss
 */
export function VoteTimelineCard({ vote, className }: VoteTimelineCardProps) {
  const { t } = useTranslation();

  const statusConfig = STATUS_CONFIG[vote.status] || STATUS_CONFIG.open;
  const isActive = ['open', 'closing_soon', 'last_hour', 'final_minutes'].includes(vote.status);
  const endDate = vote.endTime ? new Date(vote.endTime) : null;
  const turnout =
    vote.totalVoters && vote.votedCount
      ? Math.round((vote.votedCount / vote.totalVoters) * 100)
      : undefined;

  const TrendIcon = vote.trend === 'up' ? TrendingUp : vote.trend === 'down' ? TrendingDown : Minus;

  const agendaHref =
    vote.agendaEventId && vote.agendaItemId
      ? `/event/${vote.agendaEventId}/agenda/${vote.agendaItemId}`
      : undefined;
  const fallbackHref = `/amendment/${vote.amendmentId}`;

  // Indication display logic
  const hasIndication = vote.indicationSupportPercentage !== undefined;
  const showBothResults = !vote.isIndicationPhase && hasIndication;

  return (
    <TimelineCardBase
      contentType="vote"
      className={cn(statusConfig.pulse && 'ring-2 ring-red-500 ring-opacity-50', className)}
      href={agendaHref || fallbackHref}
    >
      <TimelineCardHeader
        contentType="vote"
        title={t('features.timeline.contentTypes.vote')}
        badge={
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1.5 text-xs',
              statusConfig.bgColor,
              statusConfig.color,
              statusConfig.pulse && 'animate-pulse'
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                vote.status === 'open' && 'bg-green-500',
                vote.status === 'closing_soon' && 'bg-yellow-500',
                vote.status === 'last_hour' && 'bg-orange-500',
                vote.status === 'final_minutes' && 'animate-pulse bg-red-500',
                vote.status === 'passed' && 'bg-green-500',
                vote.status === 'failed' && 'bg-red-500',
                vote.status === 'tied' && 'bg-gray-500'
              )}
            />
            {vote.status.replace('_', ' ').toUpperCase()}
          </Badge>
        }
      >
        {/* Timer */}
        {isActive && endDate && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <Clock className={cn('h-4 w-4', statusConfig.color)} />
            <span className={cn('font-mono text-lg font-bold', statusConfig.color)}>
              {formatTimeRemaining(endDate)}
            </span>
          </div>
        )}
      </TimelineCardHeader>

      <TimelineCardContent>
        {/* Amendment Title (card click handles navigation) */}
        <p className="mb-2 line-clamp-2 text-sm font-medium">{vote.amendmentTitle}</p>

        {vote.question && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{vote.question}</p>
        )}

        {/* Vote Progress Bar */}
        <div className="mb-3 space-y-2">
          {/* Indication results (show only if in indication phase OR if showing both) */}
          {(vote.isIndicationPhase || showBothResults) && hasIndication && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  {t('features.timeline.cards.indication', { defaultValue: 'Indication' })} *
                </span>
                <span className="text-muted-foreground">{vote.indicationSupportPercentage}%</span>
              </div>
              <Progress
                value={vote.indicationSupportPercentage}
                className="h-2 opacity-60 [&>div]:bg-blue-400"
              />
            </div>
          )}

          {/* Actual results (hide if in indication phase only) */}
          {!vote.isIndicationPhase && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    {showBothResults
                      ? t('features.timeline.cards.actual', { defaultValue: 'Actual' })
                      : t('features.timeline.cards.support')}
                  </span>
                  {vote.trend && vote.trendPercentage && (
                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-xs font-medium',
                        vote.trend === 'up' && 'text-green-600',
                        vote.trend === 'down' && 'text-red-600',
                        vote.trend === 'stable' && 'text-gray-500'
                      )}
                    >
                      <TrendIcon className="h-3 w-3" />
                      {vote.trend !== 'stable' && `${vote.trendPercentage}%`}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'font-medium',
                    vote.supportPercentage >= 50 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {vote.supportPercentage}%
                </span>
              </div>
              <Progress
                value={vote.supportPercentage}
                className={cn(
                  'h-2.5',
                  vote.status === 'passed' && '[&>div]:bg-green-500',
                  vote.status === 'failed' && '[&>div]:bg-red-500'
                )}
              />
            </div>
          )}
        </div>

        {/* Vote Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* Show indication counts if in indication phase */}
            {vote.isIndicationPhase && hasIndication ? (
              <>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-blue-500" />
                  {vote.indicationSupportCount} *
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3 text-blue-400" />
                  {vote.indicationOpposeCount} *
                </span>
                {vote.indicationAbstainCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Minus className="h-3 w-3 text-blue-300" />
                    {vote.indicationAbstainCount} *
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-green-600" />
                  {vote.supportCount}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3 text-red-600" />
                  {vote.opposeCount}
                </span>
                {vote.abstainCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Minus className="h-3 w-3" />
                    {vote.abstainCount}
                  </span>
                )}
              </>
            )}
          </div>
          {turnout !== undefined && (
            <span>
              {turnout}% {t('features.timeline.cards.turnout')}
            </span>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        {vote.hasVoted && (
          <Badge variant="secondary" className="text-xs">
            {t('features.timeline.cards.voted')}: {vote.userVote}
          </Badge>
        )}
        <div onClick={e => e.preventDefault()}>
          <ShareButton
            url={agendaHref || fallbackHref}
            title={vote.amendmentTitle}
            description={vote.question || ''}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
