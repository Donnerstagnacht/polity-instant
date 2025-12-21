import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarEvent } from '../types';
import { isDateInRange, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from '../utils/dateUtils';

interface CalendarStatsProps {
  events: CalendarEvent[];
}

export const CalendarStats = ({ events }: CalendarStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Events</span>
          <span className="font-semibold">{events.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">This Week</span>
          <span className="font-semibold">
            {
              events.filter((e) =>
                isDateInRange(e.startDate, startOfWeek(new Date()), endOfWeek(new Date()))
              ).length
            }
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">This Month</span>
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
