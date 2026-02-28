import { Link } from '@tanstack/react-router';
import { cn } from '@/features/shared/utils/utils';
import { extractHashtagTags } from '@/zero/common/hashtagHelpers';
import { Badge } from '@/features/shared/ui/ui/badge';
import { StatementTextRenderer } from './StatementTextRenderer';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  BarChart3,
  Image as ImageIcon,
} from 'lucide-react';

interface StatementCardProps {
  statement: {
    id: string;
    text: string;
    image_url?: string | null;
    video_url?: string | null;
    upvotes?: number;
    downvotes?: number;
    comment_count?: number;
    created_at?: number;
    user?: { id?: string; first_name?: string; last_name?: string; handle?: string; avatar_url?: string } | null;
    group?: { id?: string; name?: string } | null;
    statement_hashtags?: any[];
    statement_survey?: any[];
  };
  className?: string;
}

export function StatementCard({ statement, className }: StatementCardProps) {
  const score = (statement.upvotes ?? 0) - (statement.downvotes ?? 0);
  const tags = extractHashtagTags(statement.statement_hashtags);
  const hasSurvey = (statement.statement_survey?.length ?? 0) > 0;
  const hasMedia = !!statement.image_url || !!statement.video_url;
  const author = statement.user;
  const authorName = author
    ? `${author.first_name ?? ''} ${author.last_name ?? ''}`.trim() || author.handle || 'Unknown'
    : 'Unknown';

  return (
    <Link
      to="/statement/$id"
      params={{ id: statement.id }}
      className={cn(
        'hover:bg-muted/50 block rounded-lg border p-4 transition-colors',
        className,
      )}
    >
      {/* Top row: author + group */}
      <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
        {author?.handle && <span>@{author.handle}</span>}
        {!author?.handle && <span>{authorName}</span>}
        {statement.group && (
          <>
            <span>·</span>
            <span>{statement.group.name}</span>
          </>
        )}
      </div>

      {/* Statement text */}
      <div className="mb-2 line-clamp-3 text-sm">
        <StatementTextRenderer text={statement.text} />
      </div>

      {/* Hashtags */}
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="flex items-center gap-0.5">
          <ArrowBigUp className="h-3.5 w-3.5" />
          <ArrowBigDown className="h-3.5 w-3.5" />
          <span className="font-medium">{score}</span>
        </span>
        <span className="flex items-center gap-0.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {statement.comment_count ?? 0}
        </span>
        {hasSurvey && (
          <span className="flex items-center gap-0.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Survey
          </span>
        )}
        {hasMedia && <ImageIcon className="h-3.5 w-3.5" />}
      </div>
    </Link>
  );
}
