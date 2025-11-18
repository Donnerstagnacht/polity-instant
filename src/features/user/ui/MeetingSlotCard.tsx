'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Users, Trash2 } from 'lucide-react';
import { cn } from '@/utils/utils';
import { isPast } from 'date-fns';
import { formatTime } from '@/utils/date-helpers';

interface MeetingSlotCardProps {
  slot: any;
  isOwner: boolean;
  currentUser: any;
  onBookClick: (slot: any) => void;
  onDeleteClick: (slotId: string) => void;
}

export function MeetingSlotCard({
  slot,
  isOwner,
  currentUser,
  onBookClick,
  onDeleteClick,
}: MeetingSlotCardProps) {
  const isPastSlot = isPast(new Date(slot.endTime));
  const isBooked = !slot.isAvailable && slot.meetingType === 'one-on-one';
  const canBook = !isOwner && !isPastSlot && slot.isAvailable && currentUser;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        isPastSlot && 'opacity-50',
        canBook && 'hover:border-primary hover:bg-accent'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{slot.title}</h4>
            {slot.isPublic && (
              <Badge variant="secondary">
                <Users className="mr-1 h-3 w-3" />
                Public
              </Badge>
            )}
            {isBooked && <Badge variant="outline">Booked</Badge>}
            {isPastSlot && <Badge variant="secondary">Past</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{slot.description}</p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </div>

          {/* Show booker information for booked slots */}
          {isBooked && slot.bookings && slot.bookings.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={slot.bookings[0].booker?.avatar} />
                <AvatarFallback className="text-xs">
                  {slot.bookings[0].booker?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Booked by {slot.bookings[0].booker?.name || 'Unknown'}
              </span>
            </div>
          )}

          {/* Show attendee count for public meetings */}
          {slot.isPublic && slot.bookings && slot.bookings.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {slot.bookings.length} attending
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {canBook && (
            <Button size="sm" onClick={() => onBookClick(slot)}>
              Book
            </Button>
          )}
          {isOwner && !isPastSlot && (
            <Button size="sm" variant="ghost" onClick={() => onDeleteClick(slot.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
