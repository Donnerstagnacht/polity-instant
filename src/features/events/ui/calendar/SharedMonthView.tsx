import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { ScrollArea } from '@/features/shared/ui/ui/scroll-area';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/features/shared/utils/utils';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { CalendarEvent } from '@/features/events/hooks/useCalendarView';
import { getBaseEventId } from '@/features/calendar/logic/eventIdUtils';
import { MapPin } from 'lucide-react';

interface SharedMonthViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: CalendarEvent[];
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

function getMonthGrid(selectedDate: Date): (Date | null)[][] {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // Fill leading nulls
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing nulls
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

const WEEKDAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LABELS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export function SharedMonthView({ selectedDate, onDateSelect, events }: SharedMonthViewProps) {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const weeks = getMonthGrid(selectedDate);
  const today = new Date();
  const weekdayLabels = language === 'de' ? WEEKDAY_LABELS_DE : WEEKDAY_LABELS_EN;

  const getEventsForDate = (date: Date) =>
    events
      .filter(e => isSameDay(e.start_date, date))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-px border-b pb-2">
          {weekdayLabels.map(label => (
            <div key={label} className="text-center text-xs font-medium text-muted-foreground">
              {label}
            </div>
          ))}
        </div>

        {/* Week rows */}
        <div className="grid grid-cols-7 gap-px">
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              if (!day) {
                return <div key={`${weekIndex}-${dayIndex}`} className="min-h-[120px] bg-muted/30" />;
              }

              const dayEvents = getEventsForDate(day);
              const isCurrentDay = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    'min-h-[120px] border-b border-r p-1 transition-colors',
                    isSelected && 'bg-accent/50',
                    'cursor-pointer hover:bg-accent/30',
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  <div className="mb-1 flex justify-end">
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        isCurrentDay && 'bg-primary text-primary-foreground',
                        isSelected && !isCurrentDay && 'bg-accent-foreground/10 font-bold',
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <ScrollArea className="h-[90px]">
                    <div className="space-y-0.5">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={cn(
                            'cursor-pointer rounded px-1 py-0.5 text-[11px] leading-tight transition-colors',
                            event.isMeeting && event.isBookedByMe
                              ? 'bg-green-500/15 hover:bg-green-500/25'
                              : event.isMeeting && event.is_bookable
                                ? 'border border-dashed border-blue-300 bg-blue-500/10 hover:bg-blue-500/20 dark:border-blue-700'
                                : 'bg-primary/10 hover:bg-primary/20',
                          )}
                          onClick={e => {
                            e.stopPropagation();
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
                              <MapPin className="h-2 w-2 shrink-0" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
