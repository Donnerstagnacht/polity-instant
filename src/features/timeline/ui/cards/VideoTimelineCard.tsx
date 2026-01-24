'use client';

import { Video, Play, Heart, Share2, Eye, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import {
  TimelineCardBase,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
} from './TimelineCardBase';

export interface VideoTimelineCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    duration?: number; // in seconds
    views?: number;
    likes?: number;
    authorName?: string;
    authorAvatar?: string;
    sourceType?: 'amendment' | 'user' | 'group' | 'event';
    sourceName?: string;
    sourceId?: string;
    isLiked?: boolean;
  };
  onPlay?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * Format duration from seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format view count for display
 */
function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

/**
 * Get source type label
 */
const SOURCE_LABELS: Record<string, string> = {
  amendment: 'Amendment Explainer',
  user: 'User Video',
  group: 'Group Video',
  event: 'Event Recording',
};

/**
 * VideoTimelineCard - The Visual Story card
 *
 * Displays a video with:
 * - Large thumbnail with play button overlay
 * - Duration badge
 * - Title
 * - Author info
 * - Source entity link
 * - View and like counts
 * - Actions: Play, Like, Share
 */
export function VideoTimelineCard({
  video,
  onPlay,
  onLike,
  onShare,
  className,
}: VideoTimelineCardProps) {
  const { t } = useTranslation();

  return (
    <TimelineCardBase contentType="video" className={className}>
      {/* Video Thumbnail */}
      <div className="group relative aspect-video cursor-pointer bg-muted" onClick={onPlay}>
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/40 dark:to-red-900/50">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="transform rounded-full bg-white/90 p-4 shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 fill-gray-900 text-gray-900" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 right-2 bg-black/80 font-mono text-xs text-white"
          >
            {formatDuration(video.duration)}
          </Badge>
        )}

        {/* Source Badge */}
        {video.sourceType && (
          <Badge
            variant="outline"
            className="absolute left-2 top-2 bg-white/80 text-xs dark:bg-gray-900/80"
          >
            {SOURCE_LABELS[video.sourceType] || video.sourceType}
          </Badge>
        )}
      </div>

      <TimelineCardContent>
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold">{video.title}</h3>

        {/* Author Info */}
        {(video.authorName || video.sourceName) && (
          <div className="mb-2 flex items-center gap-2">
            {video.authorAvatar ? (
              <img
                src={video.authorAvatar}
                alt={video.authorName}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                <User className="h-3 w-3" />
              </div>
            )}
            <span className="truncate text-xs text-muted-foreground">
              {video.authorName}
              {video.sourceName && <span> · {video.sourceName}</span>}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {video.views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatViews(video.views)}
            </span>
          )}
          {video.likes !== undefined && (
            <span className="flex items-center gap-1">
              <Heart className={cn('h-3.5 w-3.5', video.isLiked && 'fill-red-500 text-red-500')} />
              {formatViews(video.likes)}
            </span>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        <TimelineCardActionButton
          icon={Play}
          label={t('features.timeline.cards.play')}
          onClick={onPlay}
          variant="default"
        />
        <TimelineCardActionButton
          icon={Heart}
          label={
            video.isLiked ? t('features.timeline.cards.liked') : t('features.timeline.cards.like')
          }
          onClick={onLike}
          variant={video.isLiked ? 'secondary' : 'outline'}
        />
        <TimelineCardActionButton
          icon={Share2}
          label={t('features.timeline.cards.share')}
          onClick={onShare}
        />
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
