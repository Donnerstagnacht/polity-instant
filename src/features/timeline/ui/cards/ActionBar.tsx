'use client';

import * as React from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/utils';
import { useTranslation } from '@/hooks/use-translation';

export interface ActionBarProps {
  /** Entity ID for actions */
  entityId: string;
  /** Type of entity */
  entityType: 'group' | 'event' | 'amendment' | 'blog' | 'statement' | 'video' | 'image';
  /** Current follow/subscribe state */
  isFollowing?: boolean;
  /** Current bookmark state */
  isBookmarked?: boolean;
  /** User's reaction: 'support' | 'oppose' | 'interested' | null */
  userReaction?: 'support' | 'oppose' | 'interested' | null;
  /** Number of reactions */
  reactionCounts?: {
    support: number;
    oppose: number;
    interested: number;
  };
  /** Number of comments */
  commentCount?: number;
  /** Show reaction buttons (for voteable items) */
  showReactions?: boolean;
  /** Show follow button */
  showFollow?: boolean;
  /** Compact mode (icons only) */
  compact?: boolean;
  /** Callbacks */
  onFollow?: () => void;
  onDiscuss?: () => void;
  onReact?: (reaction: 'support' | 'oppose' | 'interested') => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
  className?: string;
}

/**
 * ActionBar - Universal action bar for timeline cards
 *
 * Provides follow, discuss, react, share, and bookmark actions
 */
export function ActionBar({
  entityId,
  entityType,
  isFollowing = false,
  isBookmarked = false,
  userReaction = null,
  reactionCounts = { support: 0, oppose: 0, interested: 0 },
  commentCount = 0,
  showReactions = true,
  showFollow = true,
  compact = false,
  onFollow,
  onDiscuss,
  onReact,
  onShare,
  onBookmark,
  onMore,
  className,
}: ActionBarProps) {
  const { t } = useTranslation();

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex items-center gap-1', className)}>
        {/* Follow/Subscribe Button */}
        {showFollow && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isFollowing ? 'secondary' : 'ghost'}
                size="sm"
                onClick={onFollow}
                className={cn('gap-1.5', isFollowing && 'text-primary', compact && 'px-2')}
              >
                {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {!compact && (
                  <span className="text-xs">
                    {isFollowing
                      ? t('features.timeline.cards.following')
                      : t('features.timeline.cards.follow')}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFollowing ? 'Unfollow' : 'Follow'}</TooltipContent>
          </Tooltip>
        )}

        {/* Discuss Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDiscuss}
              className={cn('gap-1.5', compact && 'px-2')}
            >
              <MessageCircle className="h-4 w-4" />
              {!compact && commentCount > 0 && <span className="text-xs">{commentCount}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('features.timeline.cards.discuss')}</TooltipContent>
        </Tooltip>

        {/* Reaction Buttons (for amendments, statements) */}
        {showReactions && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={userReaction === 'support' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onReact?.('support')}
                  className={cn(
                    'gap-1.5',
                    userReaction === 'support' && 'text-green-600 dark:text-green-400',
                    compact && 'px-2'
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {!compact && reactionCounts.support > 0 && (
                    <span className="text-xs">{reactionCounts.support}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('features.timeline.cards.support')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={userReaction === 'oppose' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onReact?.('oppose')}
                  className={cn(
                    'gap-1.5',
                    userReaction === 'oppose' && 'text-red-600 dark:text-red-400',
                    compact && 'px-2'
                  )}
                >
                  <ThumbsDown className="h-4 w-4" />
                  {!compact && reactionCounts.oppose > 0 && (
                    <span className="text-xs">{reactionCounts.oppose}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('features.timeline.cards.oppose')}</TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Like Button (for non-voteable items) */}
        {!showReactions && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={userReaction === 'support' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onReact?.('support')}
                className={cn(
                  'gap-1.5',
                  userReaction === 'support' && 'text-pink-600 dark:text-pink-400',
                  compact && 'px-2'
                )}
              >
                <Heart className={cn('h-4 w-4', userReaction === 'support' && 'fill-current')} />
                {!compact && reactionCounts.support > 0 && (
                  <span className="text-xs">{reactionCounts.support}</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {userReaction === 'support'
                ? t('features.timeline.cards.liked')
                : t('features.timeline.cards.like')}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Share Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className={cn('gap-1.5', compact && 'px-2')}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('features.timeline.cards.share')}</TooltipContent>
        </Tooltip>

        {/* Bookmark Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isBookmarked ? 'secondary' : 'ghost'}
              size="sm"
              onClick={onBookmark}
              className={cn(
                'gap-1.5',
                isBookmarked && 'text-amber-600 dark:text-amber-400',
                compact && 'px-2'
              )}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isBookmarked
              ? t('features.timeline.cards.bookmarked')
              : t('features.timeline.cards.bookmark')}
          </TooltipContent>
        </Tooltip>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={cn('px-2')}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDiscuss}>
              <MessageCircle className="mr-2 h-4 w-4" />
              View Discussion
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Report Issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}

/**
 * ActionBarCompact - Minimal action bar for dense layouts
 */
export function ActionBarCompact({
  commentCount = 0,
  reactionCount = 0,
  onDiscuss,
  onReact,
  className,
}: {
  commentCount?: number;
  reactionCount?: number;
  onDiscuss?: () => void;
  onReact?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 text-gray-500 dark:text-gray-400', className)}>
      <button
        onClick={onReact}
        className="flex items-center gap-1 transition-colors hover:text-pink-500"
      >
        <Heart className="h-3.5 w-3.5" />
        {reactionCount > 0 && <span className="text-xs">{reactionCount}</span>}
      </button>
      <button
        onClick={onDiscuss}
        className="flex items-center gap-1 transition-colors hover:text-blue-500"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {commentCount > 0 && <span className="text-xs">{commentCount}</span>}
      </button>
    </div>
  );
}
