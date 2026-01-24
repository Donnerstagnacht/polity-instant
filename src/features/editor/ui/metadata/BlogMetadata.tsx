'use client';

/**
 * Blog Metadata Component
 *
 * Displays blog-specific metadata including date, upvotes, visibility,
 * and bloggers list.
 */

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface Blogger {
  id: string;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
  };
  status?: string;
}

interface BlogMetadataProps {
  /** Blog date */
  date?: string;
  /** Number of upvotes */
  upvotes?: number;
  /** Whether the blog is public */
  isPublic?: boolean;
  /** List of bloggers */
  bloggers?: Blogger[];
  /** Whether to show the bloggers list */
  showBloggers?: boolean;
}

export function BlogMetadata({
  date,
  upvotes,
  isPublic,
  bloggers = [],
  showBloggers = true,
}: BlogMetadataProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Blog metadata badges */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {isPublic !== undefined && (
          <Badge variant="outline" className="flex items-center gap-1">
            {isPublic ? (
              <>
                <Globe className="h-3 w-3" />
                {t('features.editor.metadata.public')}
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                {t('features.editor.metadata.private')}
              </>
            )}
          </Badge>
        )}
        {date && (
          <span className="text-muted-foreground">
            {t('features.editor.metadata.date')}: {date}
          </span>
        )}
        {upvotes !== undefined && (
          <span className="text-muted-foreground">
            {upvotes} {t('features.editor.metadata.upvotes')}
          </span>
        )}
      </div>

      {/* Bloggers list */}
      {showBloggers && bloggers.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('features.editor.metadata.bloggers')}:
          </span>
          {bloggers.map(blogger => (
            <div
              key={blogger.id}
              className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"
            >
              <Avatar className="h-5 w-5">
                {blogger.user?.avatar ? (
                  <AvatarImage src={blogger.user.avatar} alt={blogger.user.name || ''} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {blogger.user?.name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{blogger.user?.name || 'Unknown'}</span>
              {blogger.status && blogger.status === 'owner' && (
                <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                  {t('features.editor.metadata.owner')}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
