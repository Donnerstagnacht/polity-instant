'use client';

import { Image as ImageIcon, MapPin, User, Heart, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShareButton } from '@/components/shared/ShareButton';
import { TimelineCardBase, TimelineCardContent, TimelineCardActions } from './TimelineCardBase';

export interface ImageTimelineCardProps {
  image: {
    id: string;
    imageUrl: string;
    caption?: string;
    location?: string;
    likes?: number;
    comments?: number;
    authorName?: string;
    authorAvatar?: string;
    sourceType?: 'user' | 'group' | 'event' | 'amendment' | 'blog';
    sourceName?: string;
    sourceId?: string;
    isLiked?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onImageClick?: () => void;
  className?: string;
}

/**
 * Format count for display
 */
function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Get source type label
 */
const SOURCE_LABELS: Record<string, string> = {
  user: 'User Photo',
  group: 'Group Photo',
  event: 'Event Photo',
  amendment: 'Amendment Image',
  blog: 'Blog Image',
};

/**
 * ImageTimelineCard - The Snapshot card
 *
 * Displays an image with:
 * - Full image filling the card
 * - Gradient overlay with caption
 * - Location tag (if available)
 * - Author info
 * - Like and comment counts
 * - Actions: Like, Comment, Share
 */
export function ImageTimelineCard({ image, onImageClick, className }: ImageTimelineCardProps) {
  const { t } = useTranslation();
  const sourceHref =
    image.sourceType && image.sourceId ? `/${image.sourceType}/${image.sourceId}` : undefined;

  return (
    <TimelineCardBase contentType="image" className={className} href={sourceHref}>
      {/* Image Container */}
      <div className="group relative cursor-pointer" onClick={onImageClick}>
        <img
          src={image.imageUrl}
          alt={image.caption || 'Image'}
          className="w-full object-cover"
          loading="lazy"
          style={{ minHeight: '200px', maxHeight: '400px' }}
        />

        {/* Gradient Overlay with Caption */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
          {image.caption && (
            <div className="mb-2 flex items-start gap-2">
              <ImageIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/80" />
              <p className="line-clamp-2 text-sm text-white">{image.caption}</p>
            </div>
          )}

          {image.location && (
            <div className="flex items-center gap-1 text-xs text-white/80">
              <MapPin className="h-3 w-3" />
              <span>{image.location}</span>
            </div>
          )}
        </div>

        {/* Source Badge */}
        {image.sourceType && (
          <Badge
            variant="outline"
            className="absolute left-2 top-2 bg-white/80 text-xs dark:bg-gray-900/80"
          >
            {SOURCE_LABELS[image.sourceType] || image.sourceType}
          </Badge>
        )}
      </div>

      <TimelineCardContent>
        {/* Author Info */}
        {(image.authorName || image.sourceName) && (
          <div className="mb-2 flex items-center gap-2">
            {image.authorAvatar ? (
              <img
                src={image.authorAvatar}
                alt={image.authorName}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                <User className="h-3 w-3" />
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {t('features.timeline.cards.postedBy')} {image.authorName || image.sourceName}
            </span>
          </div>
        )}

        {/* Stats Bar with Tooltips */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {image.likes !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-help items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {formatCount(image.likes)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {image.likes} {t('features.timeline.cards.likes')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          {image.comments !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-help items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {formatCount(image.comments)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {image.comments} {t('features.timeline.cards.comments')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        <div onClick={e => e.preventDefault()}>
          <ShareButton
            url={sourceHref || `/image/${image.id}`}
            title={image.caption || t('features.timeline.contentTypes.image')}
            description={image.location || ''}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
