'use client';

import { Image as ImageIcon, Heart, MessageSquare, Share2, MapPin, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import {
  TimelineCardBase,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
} from './TimelineCardBase';

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
    sourceType?: 'user' | 'group' | 'event';
    sourceName?: string;
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
export function ImageTimelineCard({
  image,
  onLike,
  onComment,
  onShare,
  onImageClick,
  className,
}: ImageTimelineCardProps) {
  const { t } = useTranslation();

  return (
    <TimelineCardBase contentType="image" className={className}>
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
      </TimelineCardContent>

      <TimelineCardActions>
        <TimelineCardActionButton
          icon={Heart}
          label={`${image.likes !== undefined ? formatCount(image.likes) : ''}`}
          onClick={onLike}
          variant={image.isLiked ? 'secondary' : 'outline'}
          className={cn(image.isLiked && '[&>svg]:fill-red-500 [&>svg]:text-red-500')}
        />
        <TimelineCardActionButton
          icon={MessageSquare}
          label={`${image.comments !== undefined ? formatCount(image.comments) : ''}`}
          onClick={onComment}
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
