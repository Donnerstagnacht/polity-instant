import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { ShareButton } from '@/features/shared/ui/action-buttons/ShareButton';
import { ThumbsUp, ThumbsDown, MessageSquare, User, Users, Image, Video, BarChart3 } from 'lucide-react';
import type { SearchContentItem } from '../types/search.types';

interface StatementSearchCardProps {
  item: SearchContentItem;
}

export function StatementSearchCard({ item }: StatementSearchCardProps) {
  const hasMedia = !!(item.imageUrl || item.videoUrl);
  const hasSurvey = !!(item.surveyQuestion && item.surveyOptions?.length);
  const score = (item.upvotes ?? 0) - (item.downvotes ?? 0);

  return (
    <Link
      to="/statement/$id"
      params={{ id: item.id }}
      className="block rounded-lg border bg-card transition-colors hover:bg-accent/50"
    >
      <div className="flex gap-3 p-3">
        {/* Compact media thumbnail */}
        {hasMedia && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Video className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Survey question or text preview */}
          {hasSurvey ? (
            <div className="mb-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                <BarChart3 className="h-3 w-3" />
                <span>Poll</span>
              </div>
              <p className="text-sm font-medium leading-snug line-clamp-1">{item.surveyQuestion}</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {item.surveyOptions!.slice(0, 4).map((opt, i) => (
                  <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {opt.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm leading-snug line-clamp-2">
              {item.title ? item.title.substring(0, 100) : ''}
            </p>
          )}

          {/* Bottom row: creator, group, stats */}
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            {/* Creator */}
            <div className="flex items-center gap-1 min-w-0">
              <Avatar className="h-4 w-4 shrink-0">
                <AvatarImage src={item.authorAvatar ?? undefined} />
                <AvatarFallback className="text-[8px]">
                  <User className="h-2.5 w-2.5" />
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{item.authorName || 'Unknown'}</span>
            </div>

            {/* Group */}
            {item.groupName && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1 min-w-0">
                  {item.groupImageUrl ? (
                    <Avatar className="h-4 w-4 shrink-0">
                      <AvatarImage src={item.groupImageUrl} />
                      <AvatarFallback className="text-[8px]">
                        <Users className="h-2.5 w-2.5" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Users className="h-3 w-3 shrink-0" />
                  )}
                  <span className="truncate">{item.groupName}</span>
                </div>
              </>
            )}

            <span className="ml-auto" />

            {/* Score */}
            <div className="flex items-center gap-0.5 shrink-0">
              <ThumbsUp className="h-3 w-3" />
              <span>{score >= 0 ? `+${score}` : score}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-0.5 shrink-0">
              <MessageSquare className="h-3 w-3" />
              <span>{item.commentCount ?? item.stats?.comments ?? 0}</span>
            </div>

            {/* Share */}
            <div onClick={(e) => e.preventDefault()}>
              <ShareButton
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/statement/${item.id}`}
                title={item.title?.substring(0, 60) ?? ''}
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
