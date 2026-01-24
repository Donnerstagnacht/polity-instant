'use client';

import { BookOpen, Clock, Bookmark, Share2, ExternalLink, User } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getContentTypeGradient } from '../../constants/content-type-config';
import {
  TimelineCardBase,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
  TimelineCardBadge,
} from './TimelineCardBase';

export interface BlogTimelineCardProps {
  blog: {
    id: string;
    title: string;
    excerpt?: string;
    coverImageUrl?: string;
    readingTimeMinutes?: number;
    authorName?: string;
    authorAvatar?: string;
    publishedAt?: string | Date;
    isBookmarked?: boolean;
    readProgress?: number; // 0-100, how much user has read
  };
  onBookmark?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * Format reading time for display
 */
function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 min read';
  return `${minutes} min read`;
}

/**
 * BlogTimelineCard - The Long Read card
 *
 * Displays a blog post with:
 * - Featured/cover image (if available)
 * - Teal-green gradient header (if no cover image)
 * - Title (large)
 * - Excerpt
 * - Author info
 * - Reading time
 * - Reading progress (if user has started)
 * - Actions: Read More, Bookmark, Share
 */
export function BlogTimelineCard({ blog, onBookmark, onShare, className }: BlogTimelineCardProps) {
  const { t } = useTranslation();
  const gradient = getContentTypeGradient('blog');

  return (
    <TimelineCardBase contentType="blog" className={className}>
      {/* Cover Image or Gradient Header */}
      {blog.coverImageUrl ? (
        <div className="relative aspect-video">
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white">
              {blog.title}
            </h3>
          </div>
        </div>
      ) : (
        <div className={cn('p-4', gradient)}>
          <div className="mb-2 flex items-start gap-2">
            <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
            <TimelineCardBadge label={t('features.timeline.contentTypes.blog')} icon={BookOpen} />
          </div>
          <h3 className="line-clamp-2 text-lg font-bold leading-tight">{blog.title}</h3>
        </div>
      )}

      <TimelineCardContent className={blog.coverImageUrl ? undefined : 'pt-0'}>
        {/* Title (if there's a cover image, it's in the overlay) */}
        {blog.coverImageUrl && (
          <h3 className="mb-2 line-clamp-2 text-base font-bold leading-tight">{blog.title}</h3>
        )}

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{blog.excerpt}</p>
        )}

        {/* Author Info */}
        <div className="mb-2 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={blog.authorAvatar} alt={blog.authorName} />
            <AvatarFallback>
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {t('features.timeline.cards.by')} {blog.authorName}
          </span>
        </div>

        {/* Reading Time */}
        {blog.readingTimeMinutes && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatReadingTime(blog.readingTimeMinutes)}</span>
          </div>
        )}

        {/* Reading Progress */}
        {blog.readProgress !== undefined && blog.readProgress > 0 && (
          <div className="mb-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t('features.timeline.cards.readProgress')}
              </span>
              <span className="font-medium">{blog.readProgress}%</span>
            </div>
            <Progress value={blog.readProgress} className="h-1" />
          </div>
        )}
      </TimelineCardContent>

      <TimelineCardActions>
        <Link href={`/blog/${blog.id}`}>
          <TimelineCardActionButton
            icon={ExternalLink}
            label={t('features.timeline.cards.readMore')}
            variant="default"
          />
        </Link>
        <TimelineCardActionButton
          icon={Bookmark}
          label={
            blog.isBookmarked
              ? t('features.timeline.cards.bookmarked')
              : t('features.timeline.cards.bookmark')
          }
          onClick={onBookmark}
          variant={blog.isBookmarked ? 'secondary' : 'outline'}
          className={cn(blog.isBookmarked && '[&>svg]:fill-current')}
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
