'use client';

import { Quote, ThumbsUp, ThumbsDown, MessageSquare, Video, BarChart3 } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';
import { ShareButton } from '@/features/shared/ui/action-buttons/ShareButton.tsx';
import { HashtagDisplay } from '@/features/shared/ui/ui/hashtag-display';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/ui/tooltip';
import { CONTENT_TYPE_CONFIG } from '../../constants/content-type-config';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardBadge,
} from './TimelineCardBase';

interface SurveyOptionPreview {
  label: string;
  voteCount: number;
}

export interface StatementTimelineCardProps {
  statement: {
    id: string;
    content: string;
    authorName: string;
    authorTitle?: string;
    authorAvatar?: string;
    supportCount?: number;
    opposeCount?: number;
    interestedCount?: number;
    commentCount?: number;
    userReaction?: 'support' | 'oppose' | 'interested' | null;
    createdAt?: string | Date;
    imageUrl?: string;
    videoUrl?: string;
    groupName?: string;
    groupAvatar?: string;
    groupId?: string;
    surveyQuestion?: string;
    surveyOptions?: string[] | SurveyOptionPreview[];
    hashtags?: { id: string; tag: string }[];
  };
  onReact?: (reaction: 'support' | 'oppose' | 'interested') => void;
  onComment?: () => void;
  onShare?: () => void;
  className?: string;
}

export function StatementTimelineCard({
  statement,
  className,
}: StatementTimelineCardProps) {
  const hasMedia = !!(statement.imageUrl || statement.videoUrl);
  const rawOptions = statement.surveyOptions ?? [];
  // Normalize: options can be strings or { label, voteCount } objects
  const surveyOptions: SurveyOptionPreview[] = rawOptions.map((opt) =>
    typeof opt === 'string' ? { label: opt, voteCount: 0 } : opt,
  );
  const hasSurvey = !!(statement.surveyQuestion && surveyOptions.length > 0);
  const surveyTotalVotes = hasSurvey ? surveyOptions.reduce((s, o) => s + o.voteCount, 0) : 0;
  const score = (statement.supportCount ?? 0) - (statement.opposeCount ?? 0);

  const statementStyle = CONTENT_TYPE_CONFIG.statement;

  // Title: survey question or first 100 chars of content
  const displayTitle = hasSurvey
    ? statement.surveyQuestion!
    : statement.content?.substring(0, 100) + ((statement.content?.length ?? 0) > 100 ? '…' : '');

  // Stats
  const stats = [
    {
      icon: score >= 0 ? ThumbsUp : ThumbsDown,
      value: score >= 0 ? `+${score}` : `${score}`,
      label: 'Score',
    },
    {
      icon: MessageSquare,
      value: statement.commentCount ?? 0,
      label: 'Comments',
    },
    ...(hasSurvey
      ? [
          {
            icon: BarChart3,
            value: surveyTotalVotes,
            label: 'Votes',
          },
        ]
      : []),
  ];

  return (
    <TimelineCardBase
      contentType="statement"
      className={className}
      href={`/statement/${statement.id}`}
    >
      <TimelineCardHeader
        contentType="statement"
        title={displayTitle}
        href={`/statement/${statement.id}`}
        subtitle={statement.groupName ?? statement.authorName}
        subtitleHref={
          statement.groupId
            ? `/group/${statement.groupId}`
            : undefined
        }
        badge={
          <TimelineCardBadge label="Statement" icon={Quote} />
        }
      >
        {/* Central media display */}
        {hasMedia && (
          <div className="mt-3 flex justify-center">
            <div className="h-32 w-full overflow-hidden rounded-xl bg-black/10">
              {statement.imageUrl ? (
                <img
                  src={statement.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Video className="h-8 w-8 text-indigo-200" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Survey poll preview */}
        {hasSurvey && (
          <div className="mt-3 space-y-1.5 px-1">
            {surveyOptions.slice(0, 4).map((opt, i) => {
              const percent = surveyTotalVotes > 0 ? Math.round((opt.voteCount / surveyTotalVotes) * 100) : 0;
              return (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs text-white/90">
                    <span className="truncate">{opt.label}</span>
                    {surveyTotalVotes > 0 && <span className="ml-1 shrink-0">{percent}%</span>}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-white/50 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {surveyOptions.length > 4 && (
              <p className="text-center text-xs text-white/60">
                +{surveyOptions.length - 4} more
              </p>
            )}
          </div>
        )}
      </TimelineCardHeader>

      <TimelineCardContent>
        {/* Description excerpt (only for text-only statements, title already shows the content) */}
        {!hasMedia && !hasSurvey && statement.content && statement.content.length > 100 && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {statement.content.substring(100, 250)}
          </p>
        )}

        {/* Hashtags */}
        {statement.hashtags && statement.hashtags.length > 0 && (
          <div className="mb-3" onClick={e => e.preventDefault()}>
            <HashtagDisplay
              hashtags={statement.hashtags.slice(0, 3)}
              centered={false}
              badgeClassName={cn(
                'border bg-white/70 dark:bg-gray-900/60',
                statementStyle.borderColor,
                statementStyle.accentColor
              )}
            />
          </div>
        )}

        {/* Stats Bar with Tooltips */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {stats.map((stat, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1">
                  <stat.icon className="h-3.5 w-3.5" />
                  <span className="font-medium">{stat.value}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {stat.value} {stat.label}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        {/* Share Button */}
        <div className="ml-auto" onClick={e => e.preventDefault()}>
          <ShareButton
            url={`/statement/${statement.id}`}
            title={statement.authorName}
            description={statement.content}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
