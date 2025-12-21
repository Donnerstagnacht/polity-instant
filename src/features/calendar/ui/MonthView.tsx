import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { CalendarEvent } from '../types';
import { isSameDay, formatTime } from '../utils/dateUtils';

interface MonthViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: CalendarEvent[];
  allEvents: CalendarEvent[];
}

export const MonthView = ({ selectedDate, onDateSelect, events, allEvents }: MonthViewProps) => {
  const router = useRouter();

  const getEventsForDate = (date: Date) => {
    return allEvents.filter((event) => isSameDay(event.startDate, date));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Month View</CardTitle>
            <CardDescription>
              {events.length} event{events.length !== 1 ? 's' : ''} this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateSelect(date)}
              month={selectedDate}
              onMonthChange={onDateSelect}
              modifiers={{
                hasEvents: (date: Date) => getEventsForDate(date).length > 0,
              }}
              modifiersClassNames={{
                hasEvents:
                  'font-bold text-primary relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary',
              }}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Events List for Selected Date */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} event
              {selectedDateEvents.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No events on this day
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent"
                      onClick={() => {
                        if (event.isMeeting) {
                          router.push(`/meet/${event.id}`);
                        } else {
                          router.push(`/event/${event.id}`);
                        }
                      }}
                    >
                      <h4 className="font-semibold">
                        {event.isMeeting && '📅 '}
                        {event.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(event.startDate)}
                      </p>
                      {event.location && !event.isMeeting && (
                        <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>
                      )}
                      {event.isMeeting && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.isPublic ? 'Public Meeting' : 'Private Meeting'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
