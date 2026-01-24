'use client';

import { Users, MessageSquare, ScrollText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { TopicPillList } from './TopicPill';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
  TimelineCardStats,
  TimelineCardBadge,
} from './TimelineCardBase';

export interface GroupTimelineCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    memberCount?: number;
    amendmentCount?: number;
    activeDiscussions?: number;
    topics?: string[];
    isFollowing?: boolean;
  };
  onFollow?: () => void;
  onDiscuss?: () => void;
  className?: string;
}

/**
 * GroupTimelineCard - The Community Hub card
 *
 * Displays a group with:
 * - Green-blue gradient header
 * - Group icon and name
 * - Description (max 3 lines)
 * - Topic pills
 * - Stats (members, amendments, active discussions)
 * - Actions: Follow, Discuss, Visit
 */
export function GroupTimelineCard({
  group,
  onFollow,
  onDiscuss,
  className,
}: GroupTimelineCardProps) {
  const { t } = useTranslation();

  return (
    <TimelineCardBase contentType="group" className={className}>
      <TimelineCardHeader
        contentType="group"
        title={group.name}
        badge={<TimelineCardBadge label={t('features.timeline.contentTypes.group')} icon={Users} />}
      />

      <TimelineCardContent>
        {group.description && (
          <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{group.description}</p>
        )}

        {group.topics && group.topics.length > 0 && (
          <TopicPillList topics={group.topics} maxDisplay={3} className="mb-3" />
        )}

        <TimelineCardStats
          stats={[
            {
              icon: Users,
              value: group.memberCount ?? 0,
              label: t('features.timeline.cards.members'),
            },
            ...(group.amendmentCount !== undefined
              ? [
                  {
                    icon: ScrollText,
                    value: group.amendmentCount,
                    label: t('features.timeline.contentTypes.amendment'),
                  },
                ]
              : []),
            ...(group.activeDiscussions !== undefined
              ? [
                  {
                    icon: MessageSquare,
                    value: group.activeDiscussions,
                    label: t('features.timeline.cards.active'),
                  },
                ]
              : []),
          ]}
        />
      </TimelineCardContent>

      <TimelineCardActions>
        <TimelineCardActionButton
          label={
            group.isFollowing
              ? t('features.timeline.cards.following')
              : t('features.timeline.cards.follow')
          }
          onClick={onFollow}
          variant={group.isFollowing ? 'secondary' : 'outline'}
        />
        <TimelineCardActionButton
          icon={MessageSquare}
          label={t('features.timeline.cards.discuss')}
          onClick={onDiscuss}
        />
        <Link href={`/group/${group.id}`}>
          <TimelineCardActionButton
            icon={ExternalLink}
            label={t('features.timeline.cards.visit')}
          />
        </Link>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
