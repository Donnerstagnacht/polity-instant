import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon } from 'lucide-react';
import { CalendarEvent } from '../types';
import { formatDate } from '../utils/dateUtils';
import { EventCard } from './EventCard';
import { MiniCalendar } from './MiniCalendar';
import { CalendarStats } from './CalendarStats';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  allEvents: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

export const DayView = ({ selectedDate, events, allEvents, onDateSelect }: DayViewProps) => {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Events for {formatDate(selectedDate)}</CardTitle>
            <CardDescription>
              {events.length} event{events.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No events scheduled for this day</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <MiniCalendar
          selectedDate={selectedDate}
          onSelect={onDateSelect}
          events={allEvents}
        />
        <CalendarStats events={allEvents} />
      </div>
    </div>
  );
};
