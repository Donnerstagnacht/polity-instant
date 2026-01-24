'use client';

import { useState } from 'react';
import { Users, ScrollText, Calendar, UserPlus, UserMinus, Clock, Check, Bell } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShareButton } from '@/components/shared/ShareButton';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { useGroupMembership } from '@/features/groups/hooks/useGroupMembership';
import { useSubscribeGroup } from '@/features/groups/hooks/useSubscribeGroup';
import { CONTENT_TYPE_CONFIG } from '../../constants/content-type-config';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardBadge,
} from './TimelineCardBase';

export interface GroupTimelineCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    memberCount?: number;
    eventCount?: number;
    amendmentCount?: number;
    activeDiscussions?: number;
    topics?: string[];
    hashtags?: { id: string; tag: string }[];
    /** User's membership status */
    membershipStatus?: 'member' | 'admin' | 'invited' | 'requested' | null;
    /** Whether user is subscribed to this group */
    isSubscribed?: boolean;
  };
  /** Called when user requests membership */
  onRequestMembership?: () => void;
  /** Called when user leaves group */
  onLeave?: () => void;
  /** Called when user accepts invitation */
  onAcceptInvitation?: () => void;
  /** Called when user withdraws request */
  onWithdrawRequest?: () => void;
  /** Called when user toggles subscription */
  onToggleSubscription?: () => void;
  /** Loading state for membership actions */
  isMembershipLoading?: boolean;
  /** Loading state for subscription action */
  isSubscriptionLoading?: boolean;
  className?: string;
}

/**
 * GroupTimelineCard - The Community Hub card
 *
 * Displays a group with:
 * - Green-blue gradient header
 * - Clickable card that navigates to group page
 * - Group icon and name
 * - Description (max 3 lines)
 * - Topic pills
 * - Stats bar with tooltips (members, events, amendments)
 * - Membership button with popover
 * - Share button
 * - Subscribe button
 */
export function GroupTimelineCard({
  group,
  onRequestMembership,
  onLeave,
  onAcceptInvitation,
  onWithdrawRequest,
  onToggleSubscription,
  isMembershipLoading,
  isSubscriptionLoading,
  className,
}: GroupTimelineCardProps) {
  const { t } = useTranslation();
  const [membershipOpen, setMembershipOpen] = useState(false);
  const membership = useGroupMembership(group.id);
  const subscription = useSubscribeGroup(group.id);
  const groupStyle = CONTENT_TYPE_CONFIG.group;
  const groupHashtags = group.hashtags ?? group.topics?.map(topic => ({ id: topic, tag: topic }));

  const resolvedMembershipStatus = group.membershipStatus ?? membership.status;
  const isMember =
    resolvedMembershipStatus === 'member' ||
    resolvedMembershipStatus === 'admin' ||
    membership.isMember;
  const isInvited = resolvedMembershipStatus === 'invited' || membership.isInvited;
  const hasRequested = resolvedMembershipStatus === 'requested' || membership.hasRequested;

  // Get membership button label based on status
  const getMembershipLabel = () => {
    if (isMember) return t('features.timeline.cards.group.member');
    if (isInvited) return t('features.timeline.cards.group.invited');
    if (hasRequested) return t('features.timeline.cards.group.pending');
    return t('features.timeline.cards.group.join');
  };

  // Get membership button variant based on status
  const getMembershipVariant = (): 'default' | 'secondary' | 'outline' => {
    if (isMember) return 'secondary';
    if (isInvited) return 'default';
    if (hasRequested) return 'outline';
    return 'default';
  };

  // Get membership button icon
  const getMembershipIcon = () => {
    if (isMember) return UserMinus;
    if (isInvited) return Check;
    if (hasRequested) return Clock;
    return UserPlus;
  };

  const MembershipIcon = getMembershipIcon();

  // Build stats array
  const stats = [
    {
      icon: Users,
      value: group.memberCount ?? membership.memberCount ?? 0,
      label: t('features.timeline.cards.group.members'),
    },
    ...(group.eventCount !== undefined && group.eventCount > 0
      ? [
          {
            icon: Calendar,
            value: group.eventCount,
            label: t('features.timeline.cards.group.events'),
          },
        ]
      : []),
    ...(group.amendmentCount !== undefined && group.amendmentCount > 0
      ? [
          {
            icon: ScrollText,
            value: group.amendmentCount,
            label: t('features.timeline.cards.group.amendments'),
          },
        ]
      : []),
  ];

  return (
    <TimelineCardBase contentType="group" className={className} href={`/group/${group.id}`}>
      <TimelineCardHeader
        contentType="group"
        title={group.name}
        badge={<TimelineCardBadge label={t('features.timeline.contentTypes.group')} icon={Users} />}
      />

      <TimelineCardContent>
        {group.description && (
          <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{group.description}</p>
        )}

        {groupHashtags && groupHashtags.length > 0 && (
          <div className="mb-3" onClick={e => e.preventDefault()}>
            <HashtagDisplay
              hashtags={groupHashtags.slice(0, 3)}
              centered={false}
              badgeClassName={`border bg-white/70 dark:bg-gray-900/60 ${groupStyle.borderColor} ${groupStyle.accentColor}`}
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
        {/* Membership Button with Popover */}
        <Popover open={membershipOpen} onOpenChange={setMembershipOpen}>
          <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
            <Button
              variant={getMembershipVariant()}
              size="sm"
              disabled={isMembershipLoading || membership.isLoading}
              className="flex items-center gap-1.5"
            >
              <MembershipIcon className="h-3.5 w-3.5" />
              <span className="text-xs">{getMembershipLabel()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              {isMember && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    (onLeave || membership.leaveGroup)?.();
                    setMembershipOpen(false);
                  }}
                  disabled={isMembershipLoading || membership.isLoading}
                  className="justify-start"
                >
                  {t('features.timeline.cards.group.leaveGroup')}
                </Button>
              )}
              {isInvited && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      (onAcceptInvitation || membership.acceptInvitation)?.();
                      setMembershipOpen(false);
                    }}
                    disabled={isMembershipLoading || membership.isLoading}
                    className="justify-start"
                  >
                    {t('features.timeline.cards.group.acceptInvitation')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      (onLeave || membership.leaveGroup)?.();
                      setMembershipOpen(false);
                    }}
                    disabled={isMembershipLoading || membership.isLoading}
                    className="justify-start text-destructive"
                  >
                    {t('features.timeline.cards.group.declineInvitation')}
                  </Button>
                </>
              )}
              {hasRequested && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    (onWithdrawRequest || membership.leaveGroup)?.();
                    setMembershipOpen(false);
                  }}
                  disabled={isMembershipLoading || membership.isLoading}
                  className="justify-start text-destructive"
                >
                  {t('features.timeline.cards.group.withdrawRequest')}
                </Button>
              )}
              {!isMember && !isInvited && !hasRequested && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    (onRequestMembership || membership.requestJoin)?.();
                    setMembershipOpen(false);
                  }}
                  disabled={isMembershipLoading || membership.isLoading}
                  className="justify-start"
                >
                  {t('features.timeline.cards.group.requestMembership')}
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Subscribe Button */}
        <Button
          variant={(group.isSubscribed ?? subscription.isSubscribed) ? 'outline' : 'ghost'}
          size="sm"
          onClick={e => {
            e.stopPropagation();
            (onToggleSubscription || subscription.toggleSubscribe)?.();
          }}
          disabled={isSubscriptionLoading || subscription.isLoading}
          className="flex items-center gap-1.5"
        >
          <Bell
            className={`h-3.5 w-3.5 ${(group.isSubscribed ?? subscription.isSubscribed) ? 'fill-current' : ''}`}
          />
        </Button>

        {/* Share Button */}
        <div onClick={e => e.stopPropagation()}>
          <ShareButton
            url={`/group/${group.id}`}
            title={group.name}
            description={group.description || ''}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
