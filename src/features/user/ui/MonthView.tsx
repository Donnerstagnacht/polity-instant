'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MeetingSlotCard } from './MeetingSlotCard';

interface MonthViewProps {
  selectedDate: Date;
  slots: any[];
  isOwner: boolean;
  currentUser: any;
  onDateSelect: (date: Date | undefined) => void;
  onMonthChange: (date: Date) => void;
  getSlotsForDate: (date: Date) => any[];
  onBookSlot: (slot: any) => void;
  onDeleteSlot: (slotId: string) => void;
}

export function MonthView({
  selectedDate,
  slots,
  isOwner,
  currentUser,
  onDateSelect,
  onMonthChange,
  getSlotsForDate,
  onBookSlot,
  onDeleteSlot,
}: MonthViewProps) {
  const selectedDaySlots = getSlotsForDate(selectedDate);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Month View</CardTitle>
            <CardDescription>
              {slots.length} slot{slots.length !== 1 ? 's' : ''} this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              month={selectedDate}
              onMonthChange={onMonthChange}
              modifiers={{
                hasSlots: (date: Date) => getSlotsForDate(date).length > 0,
              }}
              modifiersClassNames={{
                hasSlots:
                  'font-bold text-primary relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary',
              }}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Slots for Selected Date */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </CardTitle>
            <CardDescription>
              {selectedDaySlots.length} slot
              {selectedDaySlots.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDaySlots.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No slots on this day
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {selectedDaySlots.map((slot: any) => (
                    <MeetingSlotCard
                      key={slot.id}
                      slot={slot}
                      isOwner={isOwner}
                      currentUser={currentUser}
                      onBookClick={onBookSlot}
                      onDeleteClick={onDeleteSlot}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
