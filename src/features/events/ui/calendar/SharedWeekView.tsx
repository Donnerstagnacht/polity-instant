import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { ScrollArea } from '@/features/shared/ui/ui/scroll-area';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/features/shared/utils/utils';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { CalendarEvent } from '@/features/events/hooks/useCalendarView';
import { getBaseEventId } from '@/features/calendar/logic/eventIdUtils';
import { MapPin } from 'lucide-react';

interface SharedWeekViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
}

function getWeekDays(selectedDate: Date): Date[] {
  const start = new Date(selectedDate);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(d1: Date | string | number, d2: Date): boolean {
  const date1 = new Date(d1);
  return (
    date1.getFullYear() === d2.getFullYear() &&
    date1.getMonth() === d2.getMonth() &&
    date1.getDate() === d2.getDate()
  );
}

function formatTime(date: string | number | Date): string {
  return new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function SharedWeekView({ selectedDate, events }: SharedWeekViewProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const weekDays = getWeekDays(selectedDate);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayEvents = events.filter(e => isSameDay(e.start_date, day));
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
                    {day.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
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
                          className={cn(
                            'cursor-pointer rounded-md border p-1.5 text-xs shadow-sm transition-colors hover:bg-accent',
                            event.isMeeting && event.isBookedByMe
                              ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950'
                              : event.isMeeting && event.is_bookable
                                ? 'border-dashed border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50'
                                : 'bg-card',
                          )}
                        onClick={() => {
                          const baseEventId = getBaseEventId(event.id);
                          if (event.isMeeting) {
                            navigate({ to: `/meet/${baseEventId}` });
                          } else {
                            navigate({ to: `/event/${baseEventId}` });
                          }
                        }}
                      >
                        <p className="truncate font-medium">
                          {event.isMeeting && '📅 '}
                          {event.title}
                        </p>
                        <p className="text-muted-foreground">{formatTime(event.start_date)}</p>
                        {event.location && (
                          <p className="flex items-center gap-0.5 truncate text-muted-foreground">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            {event.location}
                          </p>
                        )}
                        {event.hashtags && event.hashtags.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-0.5">
                            {event.hashtags.slice(0, 2).map(h => (
                              <span key={h.id} className="text-[10px] text-primary">#{h.tag}</span>
                            ))}
                          </div>
                        )}
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
}
