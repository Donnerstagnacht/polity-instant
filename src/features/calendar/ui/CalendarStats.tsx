import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { CalendarEvent } from '../types';
import { isDateInRange, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from '../utils/dateUtils';

interface CalendarStatsProps {
  events: CalendarEvent[];
}

export const CalendarStats = ({ events }: CalendarStatsProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('features.calendar.stats.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('features.calendar.stats.totalEvents')}</span>
          <span className="font-semibold">{events.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('features.calendar.stats.thisWeek')}</span>
          <span className="font-semibold">
            {
              events.filter((e) =>
                isDateInRange(e.startDate, startOfWeek(new Date()), endOfWeek(new Date()))
              ).length
            }
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('features.calendar.stats.thisMonth')}</span>
          <span className="font-semibold">
            {
              events.filter((e) =>
                isDateInRange(
                  e.startDate,
                  startOfMonth(new Date()),
                  endOfMonth(new Date())
                )
              ).length
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
