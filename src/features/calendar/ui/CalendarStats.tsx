import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { CalendarEvent } from '../types/calendar.types';
import { isDateInRange, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from '../logic/dateUtils';

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
                isDateInRange(e.start_date, startOfWeek(new Date()), endOfWeek(new Date()))
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
                  e.start_date,
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
