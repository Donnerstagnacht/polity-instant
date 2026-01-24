'use client';

import { Calendar, MapPin, Users, Share2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format, isToday, isTomorrow, isPast, isFuture, differenceInHours } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import {
  TimelineCardBase,
  TimelineCardHeader,
  TimelineCardContent,
  TimelineCardActions,
  TimelineCardActionButton,
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
    attendeeCount?: number;
    isAttending?: boolean;
    organizerName?: string;
  };
  onRSVP?: () => void;
  onShare?: () => void;
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
 * EventTimelineCard - The Gathering card
 *
 * Displays an event with:
 * - Orange-yellow gradient header
 * - Prominent date badge
 * - Event title and description
 * - Location and attendee count
 * - "Happening Now" indicator for live events
 * - Actions: RSVP, Share, Details
 */
export function EventTimelineCard({ event, onRSVP, onShare, className }: EventTimelineCardProps) {
  const { t } = useTranslation();
  const startDate = new Date(event.startDate);
  const { day, month, time, status } = formatEventDate(startDate);
  const dateLabel = getDateLabel(startDate);

  return (
    <TimelineCardBase contentType="event" className={className}>
      <TimelineCardHeader
        contentType="event"
        title={event.title}
        subtitle={event.organizerName}
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
      </TimelineCardHeader>

      <TimelineCardContent>
        {event.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        )}

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {event.attendeeCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {event.attendeeCount} {t('features.timeline.cards.attending')}
              </span>
            </div>
          )}
        </div>
      </TimelineCardContent>

      <TimelineCardActions>
        <TimelineCardActionButton
          label={
            event.isAttending
              ? t('features.timeline.cards.going')
              : t('features.timeline.cards.rsvp')
          }
          onClick={onRSVP}
          variant={event.isAttending ? 'secondary' : 'default'}
          disabled={status === 'past'}
        />
        <TimelineCardActionButton
          icon={Share2}
          label={t('features.timeline.cards.share')}
          onClick={onShare}
        />
        <Link href={`/event/${event.id}`}>
          <TimelineCardActionButton
            icon={ExternalLink}
            label={t('features.timeline.cards.details')}
          />
        </Link>
      </TimelineCardActions>
    </TimelineCardBase>
  );
}
