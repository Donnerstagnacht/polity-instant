import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { CalendarEvent } from '../types';
import { formatDate } from '../utils/dateUtils';
import { EventCard } from './EventCard';
import { MiniCalendar } from './MiniCalendar';
import { CalendarStats } from './CalendarStats';
import { TimelineItem, AgendaCard } from '@/components/shared/timeline';
import { getBaseEventId } from '../utils/eventIdUtils';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  allEvents: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

export const DayView = ({ selectedDate, events, allEvents, onDateSelect }: DayViewProps) => {
  const { t } = useTranslation();

  // Sort events by start time and calculate time slots
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const formatTime = (date: Date | number) => {
    const d = typeof date === 'number' ? new Date(date) : date;
    return d.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startDate: number, endDate: number) => {
    return Math.round((endDate - startDate) / 60000); // Convert ms to minutes
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('features.calendar.dayView.eventsFor', { date: formatDate(selectedDate) })}
            </CardTitle>
            <CardDescription>
              {events.length === 1
                ? t('features.calendar.dayView.eventCount', { count: events.length })
                : t('features.calendar.dayView.eventCountPlural', { count: events.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>{t('features.calendar.dayView.noEvents')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {sortedEvents.map((event, index) => {
                    const startTime = new Date(event.startDate);
                    const endTime = new Date(event.endDate);
                    const duration = calculateDuration(event.startDate, event.endDate);
                    const baseEventId = getBaseEventId(event.id);

                    return (
                      <TimelineItem
                        key={event.id}
                        order={index + 1}
                        startTime={formatTime(startTime)}
                        endTime={formatTime(endTime)}
                        duration={duration}
                      >
                        <AgendaCard
                          id={event.id}
                          title={event.title}
                          description={event.description}
                          type="discussion" // Events shown as discussion type
                          status="planned"
                          creatorName={event.creator?.name || event.creator?.email}
                          detailsLink={`/event/${baseEventId}`}
                          detailsLabel={t('features.calendar.viewEvent')}
                        />
                      </TimelineItem>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <MiniCalendar selectedDate={selectedDate} onSelect={onDateSelect} events={allEvents} />
        <CalendarStats events={allEvents} />
      </div>
    </div>
  );
};
