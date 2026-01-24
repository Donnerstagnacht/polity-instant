'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, Trophy, ScrollText, Bell } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, differenceInHours } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShareButton } from '@/components/shared/ShareButton';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { useEventParticipation } from '@/features/events/hooks/useEventParticipation';
import { useSubscribeEvent } from '@/features/events/hooks/useSubscribeEvent';
import { CONTENT_TYPE_CONFIG } from '../../constants/content-type-config';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardBadge,
} from './TimelineCardBase';

export interface EventTimelineCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    startDate: string | Date;
    endDate?: string | Date;
    location?: string;
    /** City name for display in header */
    city?: string;
    /** Postal/zip code */
    postcode?: string;
    attendeeCount?: number;
    /** User's participation status */
    participationStatus?: 'member' | 'admin' | 'confirmed' | 'invited' | 'requested' | null;
    organizerName?: string;
    /** Group ID for linking to group page */
    groupId?: string;
    /** Stats for elections count */
    electionsCount?: number;
    /** Stats for amendments count */
    amendmentsCount?: number;
    /** Hashtags for the event */
    hashtags?: { id: string; tag: string }[];
    /** Whether user is subscribed to this event */
    isSubscribed?: boolean;
  };
  /** Called when user requests participation */
  onRequestParticipation?: () => void;
  /** Called when user leaves event */
  onLeave?: () => void;
  /** Called when user accepts invitation */
  onAcceptInvitation?: () => void;
  /** Called when user withdraws request */
  onWithdrawRequest?: () => void;
  /** Called when user toggles subscription */
  onToggleSubscription?: () => void;
  /** Loading state for participation actions */
  isParticipationLoading?: boolean;
  /** Loading state for subscription action */
  isSubscriptionLoading?: boolean;
  className?: string;
}

/**
 * Format the event date for display
 */
function formatEventDate(date: Date): {
  day: string;
  month: string;
  time: string;
  status: 'live' | 'upcoming' | 'past';
} {
  const now = new Date();
  let status: 'live' | 'upcoming' | 'past' = 'upcoming';

  if (isPast(date)) {
    status = 'past';
  } else if (differenceInHours(date, now) <= 0) {
    status = 'live';
  }

  return {
    day: format(date, 'd'),
    month: format(date, 'MMM').toUpperCase(),
    time: format(date, 'h:mm a'),
    status,
  };
}

/**
 * Get date label (Today, Tomorrow, or formatted date)
 */
function getDateLabel(date: Date): string | null {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return null;
}

/**
 * Build location display string
 */
function buildLocationDisplay(location?: string, city?: string, postcode?: string): string | null {
  // If location already includes city/postcode info, return as-is
  if (location) {
    const locationLower = location.toLowerCase();
    const hasCity = city && locationLower.includes(city.toLowerCase());
    const hasPostcode = postcode && location.includes(postcode);

    if (hasCity || hasPostcode) {
      return location;
    }

    // Append city and postcode if not already included
    const parts = [location];
    if (city && postcode) {
      parts.push(`${postcode} ${city}`);
    } else if (city) {
      parts.push(city);
    } else if (postcode) {
      parts.push(postcode);
    }
    return parts.join(', ');
  }

  // No location but have city/postcode
  if (city && postcode) {
    return `${postcode} ${city}`;
  }
  if (city) {
    return city;
  }
  if (postcode) {
    return postcode;
  }

  return null;
}

/**
 * EventTimelineCard - The Gathering card
 *
 * Displays an event with:
 * - Orange-yellow gradient header
 * - Clickable card that navigates to event page
 * - Clickable group name subtitle
 * - Prominent date badge
 * - Event title and description
 * - Location with city and postcode
 * - Hashtags
 * - Stats bar (participants, elections, amendments)
 * - RSVP popover with attendance status
 * - Share button
 * - "Happening Now" indicator for live events
 */
export function EventTimelineCard({
  event,
  onRequestParticipation,
  onLeave,
  onAcceptInvitation,
  onWithdrawRequest,
  onToggleSubscription,
  isParticipationLoading,
  isSubscriptionLoading,
  className,
}: EventTimelineCardProps) {
  const { t } = useTranslation();
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const participation = useEventParticipation(event.id);
  const subscription = useSubscribeEvent(event.id);

  const startDate = new Date(event.startDate);
  const { day, month, time, status } = formatEventDate(startDate);
  const dateLabel = getDateLabel(startDate);

  const locationDisplay = buildLocationDisplay(event.location, event.city, event.postcode);
  const eventStyle = CONTENT_TYPE_CONFIG.event;

  const resolvedParticipationStatus = event.participationStatus ?? participation.status;
  const isParticipant =
    resolvedParticipationStatus === 'member' ||
    resolvedParticipationStatus === 'admin' ||
    resolvedParticipationStatus === 'confirmed' ||
    participation.isParticipant;
  const isInvited = resolvedParticipationStatus === 'invited' || participation.isInvited;
  const hasRequested = resolvedParticipationStatus === 'requested' || participation.hasRequested;

  // Get RSVP button label based on status
  const getRsvpLabel = () => {
    if (isParticipant) return t('features.timeline.cards.event.attending');
    if (isInvited) return t('features.timeline.cards.event.invited');
    if (hasRequested) return t('features.timeline.cards.event.pending');
    return t('features.timeline.cards.rsvp');
  };

  // Get RSVP button variant based on status
  const getRsvpVariant = (): 'default' | 'secondary' | 'outline' => {
    if (isParticipant) return 'secondary';
    if (isInvited) return 'default';
    if (hasRequested) return 'outline';
    return 'default';
  };

  // Build stats array
  const stats = [
    {
      icon: Users,
      value: event.attendeeCount ?? participation.participantCount ?? 0,
      label: t('features.timeline.cards.event.participants'),
    },
    ...(event.electionsCount !== undefined && event.electionsCount > 0
      ? [
          {
            icon: Trophy,
            value: event.electionsCount,
            label: t('features.timeline.cards.event.elections'),
          },
        ]
      : []),
    ...(event.amendmentsCount !== undefined && event.amendmentsCount > 0
      ? [
          {
            icon: ScrollText,
            value: event.amendmentsCount,
            label: t('features.timeline.cards.event.amendments'),
          },
        ]
      : []),
  ];

  return (
    <TimelineCardBase contentType="event" className={className} href={`/event/${event.id}`}>
      <TimelineCardHeader
        contentType="event"
        title={event.title}
        subtitle={event.organizerName}
        subtitleHref={event.groupId ? `/group/${event.groupId}` : undefined}
        badge={
          status === 'live' ? (
            <Badge variant="destructive" className="animate-pulse">
              <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-white" />
              {t('features.timeline.cards.happeningNow')}
            </Badge>
          ) : (
            <TimelineCardBadge label={t('features.timeline.contentTypes.event')} icon={Calendar} />
          )
        }
      >
        {/* Prominent Date Badge */}
        <div className="mt-3 flex justify-center">
          <div
            className={cn(
              'flex flex-col items-center rounded-xl bg-white/80 px-4 py-2 shadow-sm dark:bg-gray-900/80',
              status === 'past' && 'opacity-60'
            )}
          >
            <span className="text-xs font-medium uppercase text-muted-foreground">{month}</span>
            <span className="text-2xl font-bold leading-none">{day}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">{time}</span>
            {dateLabel && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {dateLabel}
              </Badge>
            )}
          </div>
        </div>
        {locationDisplay && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{locationDisplay}</span>
          </div>
        )}
      </TimelineCardHeader>

      <TimelineCardContent>
        {event.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        )}

        {/* Hashtags */}
        {event.hashtags && event.hashtags.length > 0 && (
          <div className="mb-3" onClick={e => e.preventDefault()}>
            <HashtagDisplay
              hashtags={event.hashtags.slice(0, 3)}
              centered={false}
              badgeClassName={cn(
                'border bg-white/70 dark:bg-gray-900/60',
                eventStyle.borderColor,
                eventStyle.accentColor
              )}
            />
          </div>
        )}

        {/* Location handled in header */}

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
        {/* RSVP Button with Popover */}
        <Popover open={rsvpOpen} onOpenChange={setRsvpOpen}>
          <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
            <Button
              variant={getRsvpVariant()}
              size="sm"
              disabled={status === 'past' || isParticipationLoading || participation.isLoading}
              className="flex items-center gap-1.5"
            >
              <span className="text-xs">{getRsvpLabel()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              {isParticipant && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.preventDefault();
                    (onLeave || participation.leaveEvent)?.();
                    setRsvpOpen(false);
                  }}
                  disabled={isParticipationLoading || participation.isLoading}
                  className="justify-start"
                >
                  {t('features.timeline.cards.event.leaveEvent')}
                </Button>
              )}
              {isInvited && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.preventDefault();
                      (onAcceptInvitation || participation.acceptInvitation)?.();
                      setRsvpOpen(false);
                    }}
                    disabled={isParticipationLoading || participation.isLoading}
                    className="justify-start"
                  >
                    {t('features.timeline.cards.event.acceptInvitation')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.preventDefault();
                      (onLeave || participation.leaveEvent)?.();
                      setRsvpOpen(false);
                    }}
                    disabled={isParticipationLoading || participation.isLoading}
                    className="justify-start text-destructive"
                  >
                    {t('features.timeline.cards.event.declineInvitation')}
                  </Button>
                </>
              )}
              {hasRequested && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.preventDefault();
                    (onWithdrawRequest || participation.leaveEvent)?.();
                    setRsvpOpen(false);
                  }}
                  disabled={isParticipationLoading || participation.isLoading}
                  className="justify-start text-destructive"
                >
                  {t('features.timeline.cards.event.withdrawRequest')}
                </Button>
              )}
              {!isParticipant && !isInvited && !hasRequested && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.preventDefault();
                    (onRequestParticipation || participation.requestParticipation)?.();
                    setRsvpOpen(false);
                  }}
                  disabled={isParticipationLoading || participation.isLoading}
                  className="justify-start"
                >
                  {t('features.timeline.cards.event.requestParticipation')}
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Subscribe Button */}
        <Button
          variant={(event.isSubscribed ?? subscription.isSubscribed) ? 'outline' : 'ghost'}
          size="sm"
          onClick={e => {
            e.preventDefault();
            (onToggleSubscription || subscription.toggleSubscribe)?.();
          }}
          disabled={isSubscriptionLoading || subscription.isLoading}
          className="flex items-center gap-1.5"
        >
          <Bell
            className={`h-3.5 w-3.5 ${(event.isSubscribed ?? subscription.isSubscribed) ? 'fill-current' : ''}`}
          />
        </Button>

        {/* Share Button */}
        <div onClick={e => e.preventDefault()}>
          <ShareButton
            url={`/event/${event.id}`}
            title={event.title}
            description={event.description || ''}
            variant="outline"
            size="sm"
          />
        </div>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
