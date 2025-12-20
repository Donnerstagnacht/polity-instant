'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import db from '../../../db/db';

interface GroupEventsListProps {
  groupId: string;
  onEventClick?: (eventId: string, eventData: any) => void;
}

export function GroupEventsList({ groupId, onEventClick }: GroupEventsListProps) {
  // Fetch group events
  const { data, isLoading } = db.useQuery({
    events: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
      organizer: {},
      participants: {},
      hashtags: {},
    },
  });

  const events = data?.events || [];

  // Deduplicate events by ID (in case of query issues)
  const uniqueEvents = Array.from(new Map(events.map((event: any) => [event.id, event])).values());

  // Filter for future events only and sort by date
  const futureEvents = uniqueEvents
    .filter((event: any) => {
      const eventDate = new Date(event.startDate);
      return eventDate > new Date();
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateA - dateB;
    });

  const formatEventDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatEventTime = (date: string | number) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-muted-foreground">Loading events...</div>;
  }

  if (futureEvents.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No upcoming events for this group.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {futureEvents.map((event: any, index: number) => {
        // Create two-color gradient for each event based on index (matching group gradient style)
        const gradients = [
          'bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50',
          'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50',
          'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/50',
          'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/50',
          'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50',
          'bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/40 dark:to-yellow-900/50',
          'bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/50',
        ];
        const gradientClass = gradients[index % gradients.length];

        return (
          <div
            key={event.id}
            className={`group rounded-lg border p-4 transition-all ${gradientClass} ${
              onEventClick ? 'cursor-pointer hover:border-primary hover:shadow-md' : ''
            }`}
            onClick={() => onEventClick && onEventClick(event.id, event)}
          >
            {/* Header with title and badges */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <h4 className="flex-1 font-semibold leading-tight group-hover:text-primary">
                {event.title}
              </h4>
              <div className="flex gap-1">
                {event.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
              </div>
            </div>

            {/* Event details */}
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {/* Date and time */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatEventDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatEventTime(event.startDate)}</span>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {/* Participants */}
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{event.participants?.length || 0} participants</span>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{event.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
