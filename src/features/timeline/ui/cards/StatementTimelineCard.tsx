'use client';

import { Quote, ThumbsUp, ThumbsDown, HelpCircle, MessageSquare, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShareButton } from '@/components/shared/ShareButton';
import { getContentTypeGradient } from '../../constants/content-type-config';
import {
  TimelineCardBase,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
} from './TimelineCardBase';

export interface StatementTimelineCardProps {
  statement: {
    id: string;
    content: string;
    authorName: string;
    authorTitle?: string;
    authorAvatar?: string;
    supportCount?: number;
    opposeCount?: number;
    interestedCount?: number;
    commentCount?: number;
    userReaction?: 'support' | 'oppose' | 'interested' | null;
    createdAt?: string | Date;
  };
  onReact?: (reaction: 'support' | 'oppose' | 'interested') => void;
  onComment?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * StatementTimelineCard - The Voice card
 *
 * Displays a statement/quote with:
 * - Indigo gradient background with large quote marks
 * - Statement text prominently displayed
 * - Author info with avatar
 * - Three civic reactions: Support, Oppose, Interested
 * - Actions: React, Comment, Share
 */
export function StatementTimelineCard({
  statement,
  onReact,
  onComment,
  onShare,
  className,
}: StatementTimelineCardProps) {
  const { t } = useTranslation();
  const gradient = getContentTypeGradient('statement');

  const handleReact = (reaction: 'support' | 'oppose' | 'interested') => {
    onReact?.(reaction);
  };

  return (
    <TimelineCardBase
      contentType="statement"
      className={className}
      href={`/statement/${statement.id}`}
    >
      {/* Quote Header */}
      <div className={cn('relative p-6', gradient)}>
        {/* Large Quote Mark */}
        <Quote className="absolute left-4 top-4 h-8 w-8 text-indigo-300 opacity-50 dark:text-indigo-700" />

        {/* Statement Text */}
        <blockquote className="relative z-10 px-4 py-2 text-center">
          <p className="line-clamp-6 text-base font-medium italic leading-relaxed">
            "{statement.content}"
          </p>
        </blockquote>

        {/* Closing Quote Mark */}
        <Quote className="absolute bottom-4 right-4 h-8 w-8 rotate-180 text-indigo-300 opacity-50 dark:text-indigo-700" />
      </div>

      <TimelineCardContent>
        {/* Author Info */}
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={statement.authorAvatar} alt={statement.authorName} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{statement.authorName}</p>
            {statement.authorTitle && (
              <p className="truncate text-xs text-muted-foreground">{statement.authorTitle}</p>
            )}
          </div>
        </div>

        {/* Reaction Buttons */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              handleReact('support');
            }}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors',
              'hover:bg-green-100 dark:hover:bg-green-900/40',
              statement.userReaction === 'support' && 'bg-green-100 dark:bg-green-900/40'
            )}
          >
            <ThumbsUp
              className={cn(
                'h-5 w-5',
                statement.userReaction === 'support'
                  ? 'fill-green-600 text-green-600'
                  : 'text-muted-foreground'
              )}
            />
            <span className="text-xs font-medium">{statement.supportCount ?? 0}</span>
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              handleReact('oppose');
            }}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors',
              'hover:bg-red-100 dark:hover:bg-red-900/40',
              statement.userReaction === 'oppose' && 'bg-red-100 dark:bg-red-900/40'
            )}
          >
            <ThumbsDown
              className={cn(
                'h-5 w-5',
                statement.userReaction === 'oppose'
                  ? 'fill-red-600 text-red-600'
                  : 'text-muted-foreground'
              )}
            />
            <span className="text-xs font-medium">{statement.opposeCount ?? 0}</span>
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              handleReact('interested');
            }}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors',
              'hover:bg-amber-100 dark:hover:bg-amber-900/40',
              statement.userReaction === 'interested' && 'bg-amber-100 dark:bg-amber-900/40'
            )}
          >
            <HelpCircle
              className={cn(
                'h-5 w-5',
                statement.userReaction === 'interested' ? 'text-amber-600' : 'text-muted-foreground'
              )}
            />
            <span className="text-xs font-medium">{statement.interestedCount ?? 0}</span>
          </button>
        </div>

        {/* Stats Bar with Tooltips */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-help items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="font-medium">{statement.supportCount ?? 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {statement.supportCount ?? 0} {t('features.timeline.cards.support')}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-help items-center gap-1">
                <ThumbsDown className="h-3.5 w-3.5" />
                <span className="font-medium">{statement.opposeCount ?? 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {statement.opposeCount ?? 0} {t('features.timeline.cards.oppose')}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-help items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="font-medium">{statement.interestedCount ?? 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {statement.interestedCount ?? 0} {t('features.timeline.cards.interested')}
              </p>
            </TooltipContent>
          </Tooltip>
          {statement.commentCount !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="font-medium">{statement.commentCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {statement.commentCount} {t('features.timeline.cards.comments')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        <TimelineCardActionButton
          icon={MessageSquare}
          label={
            statement.commentCount !== undefined
              ? `${statement.commentCount}`
              : t('features.timeline.cards.comment')
          }
          onClick={e => {
            e?.preventDefault();
            onComment?.();
          }}
        />
        <div onClick={e => e.preventDefault()}>
          <ShareButton
            url={`/statement/${statement.id}`}
            title={statement.authorName}
            description={statement.content}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
