'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { MeetingSlotCard } from './MeetingSlotCard';

interface DayViewProps {
  selectedDate: Date;
  slots: any[];
  isOwner: boolean;
  currentUser: any;
  onDateSelect: (date: Date | undefined) => void;
  onManageDialogOpen: () => void;
  onBookSlot: (slot: any) => void;
  onDeleteSlot: (slotId: string) => void;
  getSlotsForDate: (date: Date) => any[];
}

export function DayView({
  selectedDate,
  slots,
  isOwner,
  currentUser,
  onDateSelect,
  onManageDialogOpen,
  onBookSlot,
  onDeleteSlot,
  getSlotsForDate,
}: DayViewProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Mini Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            className="rounded-md border"
            modifiers={{
              hasSlots: (date: Date) => getSlotsForDate(date).length > 0,
            }}
            modifiersClassNames={{
              hasSlots: 'font-bold text-primary',
            }}
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{formatDate(selectedDate)}</span>
            {isOwner && (
              <Button size="sm" onClick={onManageDialogOpen}>
                <Plus className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {slots.length > 0
              ? `${slots.length} slot${slots.length > 1 ? 's' : ''} available`
              : 'No slots available on this date'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {slots.map((slot: any) => (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No time slots available for this date</p>
              {isOwner && (
                <Button className="mt-4" variant="outline" onClick={onManageDialogOpen}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create a Slot
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
