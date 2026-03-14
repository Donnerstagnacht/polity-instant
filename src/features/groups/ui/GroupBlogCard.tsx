import { Link } from '@tanstack/react-router';
import { cn } from '@/features/shared/utils/utils';
import { extractHashtagTags } from '@/zero/common/hashtagHelpers';
import { Badge } from '@/features/shared/ui/ui/badge';
import { BookOpen, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';

interface GroupBlogCardProps {
  blog: {
    id: string;
    title?: string | null;
    description?: string | null;
    date?: string | null;
    upvotes?: number;
    downvotes?: number;
    commentCount?: number;
    blog_hashtags?: { hashtag?: { tag?: string | null } | null }[];
    bloggers?: { user?: { first_name?: string; last_name?: string; handle?: string } | null; status?: string }[];
  };
  groupId: string;
  className?: string;
}

export function GroupBlogCard({ blog, groupId, className }: GroupBlogCardProps) {
  const score = (blog.upvotes ?? 0) - (blog.downvotes ?? 0);
  const tags = extractHashtagTags(blog.blog_hashtags);
  const author = blog.bloggers?.find((b) => b.status === 'owner')?.user || blog.bloggers?.[0]?.user;
  const authorName = author
    ? `${author.first_name ?? ''} ${author.last_name ?? ''}`.trim() || author.handle || ''
    : '';

  return (
    <Link
      to="/group/$id/blog/$entryId"
      params={{ id: groupId, entryId: blog.id }}
      className={cn(
        'hover:bg-muted/50 block rounded-lg border p-4 transition-colors',
        className,
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <BookOpen className="text-muted-foreground h-4 w-4" />
        <h3 className="line-clamp-2 text-base font-semibold">{blog.title || 'Untitled'}</h3>
      </div>

      {blog.description && (
        <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">{blog.description}</p>
      )}

      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        {authorName && <span>{authorName}</span>}
        {blog.date && (
          <span className="flex items-center gap-0.5">
            <Calendar className="h-3.5 w-3.5" />
            {blog.date}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <ThumbsUp className="h-3.5 w-3.5" />
          {score}
        </span>
        <span className="flex items-center gap-0.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {blog.commentCount ?? 0}
        </span>
      </div>
    </Link>
  );
}
