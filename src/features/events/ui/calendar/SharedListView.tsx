import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { ScrollArea } from '@/features/shared/ui/ui/scroll-area';
import { CalendarIcon, Video, Users } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { CalendarEvent } from '@/features/events/hooks/useCalendarView';
import { getBaseEventId } from '@/features/calendar/logic/eventIdUtils';
import { EventTimelineCard } from '@/features/timeline/ui/cards/EventTimelineCard';
import { Badge } from '@/features/shared/ui/ui/badge';
import { cn } from '@/features/shared/utils/utils';

interface SharedListViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
}

function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  const sorted = [...events].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  for (const event of sorted) {
    const d = new Date(event.start_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(event);
  }
  return map;
}

function toTimelineEvent(event: CalendarEvent) {
  return {
    id: getBaseEventId(event.id),
    title: event.title,
    description: event.description,
    startDate: new Date(event.start_date),
    endDate: event.end_date ? new Date(event.end_date) : undefined,
    location: event.location,
    attendeeCount: event.attendeeCount,
    organizerName: event.organizerName,
    groupId: event.group_id,
    hashtags: event.hashtags,
  };
}

function MeetingBadge({ event, t }: { event: CalendarEvent; t: (key: string) => string }) {
  if (!event.isMeeting || !event.is_bookable) return null;
  const maxBookings = event.max_bookings ?? 1;
  const bookingCount = event.bookingCount ?? 0;
  const isFull = bookingCount >= maxBookings;

  if (event.isBookedByMe) {
    return (
      <Badge variant="default" className="gap-1 text-[10px]">
        <Users className="h-3 w-3" />
        {t('features.calendar.meeting.booked')}
      </Badge>
    );
  }
  if (isFull) {
    return (
      <Badge variant="secondary" className="gap-1 text-[10px]">
        {t('features.calendar.meeting.fullyBooked')}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 border-dashed text-[10px]">
      <Video className="h-3 w-3" />
      {t('features.calendar.meeting.available')}
    </Badge>
  );
}

function getMeetingCardClassName(event: CalendarEvent) {
  if (!event.isMeeting) return undefined;

  if (event.isBookedByMe) {
    return 'rounded-lg border-green-300 bg-green-50 shadow-sm dark:border-green-800 dark:bg-green-950';
  }

  if (event.is_bookable) {
    return 'rounded-lg border-dashed border-blue-300 bg-blue-50/50 shadow-sm dark:border-blue-800 dark:bg-blue-950/50';
  }

  return 'rounded-lg border-green-300 bg-green-50 shadow-sm dark:border-green-800 dark:bg-green-950';
}

export function SharedListView({ events, selectedDate }: SharedListViewProps) {
  const { t, language } = useTranslation();
  const grouped = groupByDate(events);

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <CalendarIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>{t('features.calendar.dayView.noEvents')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[700px]">
      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([dateKey, dayEvents]) => {
          const date = new Date(dateKey + 'T00:00:00');
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <div key={dateKey}>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                {date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                {isToday && (
                  <span className="ml-2 text-primary">
                    ({t('features.calendar.today')})
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {dayEvents.map(event => (
                  <div key={event.id} className={cn('relative', getMeetingCardClassName(event))}>
                    <EventTimelineCard
                      event={toTimelineEvent(event)}
                      className={event.isMeeting ? 'bg-transparent' : undefined}
                    />
                    {event.isMeeting && (
                      <div className="absolute right-3 top-3">
                        <MeetingBadge event={event} t={t} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
