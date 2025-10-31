'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/utils';
import { isSameDay } from '@/utils/date-helpers';
// ...existing code...

interface WeekViewProps {
  selectedDate: Date;
  slots: any[];
  getWeekDays: () => Date[];
  getSlotsForDate: (date: Date) => any[];
  formatTime: (date: string | number | Date) => string;
}

export function WeekView({
  selectedDate,
  slots,
  getWeekDays,
  getSlotsForDate,
  formatTime,
}: WeekViewProps) {
  // ...existing code...

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week View</CardTitle>
        <CardDescription>
          {slots.length} slot{slots.length !== 1 ? 's' : ''} this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {getWeekDays().map((day, index) => {
            const daySlots = getSlotsForDate(day);
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
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
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
                    {daySlots.map((slot: any) => (
                      <div
                        key={slot.id}
                        className="cursor-pointer rounded border p-1.5 text-xs transition-colors hover:bg-accent"
                      >
                        <p className="truncate font-medium">{slot.title}</p>
                        <p className="text-muted-foreground">{formatTime(slot.startTime)}</p>
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
