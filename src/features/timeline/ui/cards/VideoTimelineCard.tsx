'use client';

import { useState } from 'react';
import { Video, Play, Eye, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShareButton } from '@/components/shared/ShareButton';
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
    sourceType?: 'amendment' | 'user' | 'group' | 'event' | 'blog';
    sourceName?: string;
    sourceId?: string;
    videoUrl?: string;
    amendmentId?: string;
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
export function VideoTimelineCard({ video, onPlay, className }: VideoTimelineCardProps) {
  const { t } = useTranslation();
  const [playerOpen, setPlayerOpen] = useState(false);

  const sourceHref =
    video.sourceType && video.sourceId ? `/${video.sourceType}/${video.sourceId}` : undefined;
  const amendmentHref = video.amendmentId
    ? `/amendment/${video.amendmentId}`
    : video.sourceType === 'amendment' && video.sourceId
      ? `/amendment/${video.sourceId}`
      : sourceHref;

  return (
    <TimelineCardBase contentType="video" className={className} href={amendmentHref}>
      {/* Video Thumbnail */}
      <div
        className="group relative aspect-video cursor-pointer bg-muted"
        onClick={e => {
          e.preventDefault();
          setPlayerOpen(true);
          onPlay?.();
        }}
      >
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-help items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatViews(video.views)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {video.views} {t('features.timeline.cards.views')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        <TimelineCardActionButton
          icon={Play}
          label={t('features.timeline.cards.play')}
          onClick={e => {
            e?.preventDefault();
            setPlayerOpen(true);
            onPlay?.();
          }}
          variant="default"
        />
        <div onClick={e => e.preventDefault()}>
          <ShareButton
            url={amendmentHref || `/video/${video.id}`}
            title={video.title}
            description={video.sourceName || ''}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>

      <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{video.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            {video.videoUrl ? (
              <video src={video.videoUrl} controls autoPlay className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                {t('features.timeline.cards.videoUnavailable')}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TimelineCardBase>
  );
}
