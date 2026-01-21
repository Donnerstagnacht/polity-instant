import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/utils';
import { useTranslation } from '@/hooks/use-translation';
import { CalendarEvent } from '../types';
import { getWeekDays, isSameDay, formatTime } from '../utils/dateUtils';
import { getBaseEventId } from '../utils/eventIdUtils';

interface WeekViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  allEvents: CalendarEvent[]; // We need all events to filter for each day of the week
}

export const WeekView = ({ selectedDate, events, allEvents }: WeekViewProps) => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const weekDays = getWeekDays(selectedDate);

  const getEventsForDate = (date: Date) => {
    return allEvents.filter(event => isSameDay(event.startDate, date));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('features.calendar.weekView.title')}</CardTitle>
        <CardDescription>
          {events.length === 1
            ? t('features.calendar.weekView.eventCount', { count: events.length })
            : t('features.calendar.weekView.eventCountPlural', { count: events.length })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[200px] rounded-lg border p-2',
                  isSelected && 'border-primary bg-accent',
                  isToday && !isSelected && 'border-primary'
                )}
              >
                <div className="mb-2 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    {day.toLocaleDateString(currentLanguage === 'de' ? 'de-DE' : 'en-US', {
                      weekday: 'short',
                    })}
                  </p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      isToday && 'text-primary',
                      isSelected && 'text-primary'
                    )}
                  >
                    {day.getDate()}
                  </p>
                </div>
                <ScrollArea className="h-[140px]">
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="cursor-pointer rounded border p-1.5 text-xs transition-colors hover:bg-accent"
                        onClick={() => {
                          const baseEventId = getBaseEventId(event.id);
                          if (event.isMeeting) {
                            router.push(`/meet/${baseEventId}`);
                          } else {
                            router.push(`/event/${baseEventId}`);
                          }
                        }}
                      >
                        <p className="truncate font-medium">
                          {event.isMeeting && '📅 '}
                          {event.title}
                        </p>
                        <p className="text-muted-foreground">{formatTime(event.startDate)}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
