import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation } from '@/hooks/use-translation';
import { CalendarEvent } from '../types';
import { isSameDay } from '../utils/dateUtils';

interface MiniCalendarProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  events: CalendarEvent[];
}

export const MiniCalendar = ({ selectedDate, onSelect, events }: MiniCalendarProps) => {
  const { t } = useTranslation();

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.startDate, date));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('features.calendar.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelect(date)}
          modifiers={{
            hasEvents: (date: Date) => getEventsForDate(date).length > 0,
          }}
          modifiersClassNames={{
            hasEvents: 'font-bold text-primary',
          }}
        />
      </CardContent>
    </Card>
  );
};
