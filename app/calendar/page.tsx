'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '../../db/db';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  List,
  Grid3x3,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Clock,
  Plus,
} from 'lucide-react';
import { cn } from '@/utils/utils';

type CalendarView = 'day' | 'week' | 'month';

export default function CalendarPage() {
  const router = useRouter();
  const { user } = db.useAuth();
  const [view, setView] = useState<CalendarView>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch events and meeting slots from the database
  const { data, isLoading } = db.useQuery({
    events: {
      organizer: {},
      group: {},
      participants: {
        user: {},
      },
    },
    meetingSlots: {
      owner: {},
      bookings: {
        booker: {},
      },
    },
  });

  // Filter events where user is a participant or organizer
  const userEvents = (data?.events || []).filter((event: any) => {
    const isOrganizer = event.organizer?.id === user?.id;
    const isParticipant = event.participants?.some((p: any) => p.user?.id === user?.id);
    return isOrganizer || isParticipant;
  });

  // Filter meeting slots where user is owner or has booked
  const userMeetings = (data?.meetingSlots || []).filter((slot: any) => {
    const isOwner = slot.owner?.id === user?.id;
    const hasBooked = slot.bookings?.some((b: any) => b.booker?.id === user?.id);
    return isOwner || hasBooked;
  });

  // Convert meetings to event-like format for unified display
  const meetingEvents = userMeetings.map((slot: any) => ({
    id: slot.id,
    title: slot.title || 'Meeting',
    description: slot.description || '',
    location: slot.isPublic ? 'Public Meeting' : 'Private Meeting',
    startDate: slot.startTime,
    endDate: slot.endTime,
    isPublic: slot.isPublic,
    imageURL: null,
    organizer: slot.owner,
    participants: slot.bookings?.map((b: any) => ({ user: b.booker })) || [],
    isMeeting: true, // Flag to distinguish meetings from events
  }));

  // Combine events and meetings
  const events = [...userEvents, ...meetingEvents];

  // Helper functions for date manipulation
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const endOfWeek = (date: Date) => {
    const d = startOfWeek(date);
    return new Date(d.setDate(d.getDate() + 6));
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const endOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const isSameDay = (date1: Date | string | number, date2: Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateInRange = (date: Date | string | number, start: Date, end: Date) => {
    const d = new Date(date);
    return d >= start && d <= end;
  };

  // Filter events based on current view
  const filteredEvents = useMemo(() => {
    if (view === 'day') {
      return events.filter((event: any) => isSameDay(event.startDate, selectedDate));
    } else if (view === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return events.filter((event: any) => isDateInRange(event.startDate, start, end));
    } else {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      return events.filter((event: any) => isDateInRange(event.startDate, start, end));
    }
  }, [events, view, selectedDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event: any) => isSameDay(event.startDate, date));
  };

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Format functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatWeekRange = (date: Date) => {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | number) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getCurrentViewTitle = () => {
    if (view === 'day') return formatDate(selectedDate);
    if (view === 'week') return formatWeekRange(selectedDate);
    return formatMonth(selectedDate);
  };

  // Get week days for week view
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Event Card Component
  const EventCard = ({ event }: { event: any }) => {
    const participantCount = event.participants?.length || 0;
    const userIsParticipant = event.participants?.some((p: any) => p.user?.id === user?.id);
    const userIsOrganizer = event.organizer?.id === user?.id;
    const isMeeting = event.isMeeting || false;

    return (
      <Card
        className="cursor-pointer transition-colors hover:bg-accent"
        onClick={() => {
          if (isMeeting) {
            router.push(`/meet/${event.id}`);
          } else {
            router.push(`/event/${event.id}`);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {event.imageURL && !isMeeting && (
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                <img
                  src={event.imageURL}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{event.title}</h3>
                <div className="flex gap-1">
                  {isMeeting && (
                    <Badge variant="outline" className="text-xs">
                      Meeting
                    </Badge>
                  )}
                  {event.isPublic ? (
                    <Badge variant="secondary" className="text-xs">
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Private
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(event.startDate)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                {!isMeeting && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {participantCount} participant{participantCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {event.organizer && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={event.organizer.avatar} />
                    <AvatarFallback className="text-xs">
                      {event.organizer.name?.[0]?.toUpperCase() || 'O'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {event.organizer.name || 'Unknown'}
                  </span>
                </div>
              )}

              {!isMeeting && (userIsParticipant || userIsOrganizer) && (
                <Badge variant="default" className="text-xs">
                  {userIsOrganizer ? "You're organizing" : "You're attending"}
                </Badge>
              )}
              {isMeeting && userIsOrganizer && (
                <Badge variant="default" className="text-xs">
                  Your meeting slot
                </Badge>
              )}
              {isMeeting && !userIsOrganizer && (
                <Badge variant="default" className="text-xs">
                  You booked this
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">View and manage your events</p>
          </div>
          <Button onClick={() => router.push('/create/event')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* View Selector */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="ml-2 text-lg font-semibold">{getCurrentViewTitle()}</h2>
          </div>

          <Tabs value={view} onValueChange={v => setView(v as CalendarView)}>
            <TabsList>
              <TabsTrigger value="day">
                <List className="mr-2 h-4 w-4" />
                Day
              </TabsTrigger>
              <TabsTrigger value="week">
                <Grid3x3 className="mr-2 h-4 w-4" />
                Week
              </TabsTrigger>
              <TabsTrigger value="month">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Day View */}
        {view === 'day' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Events for {formatDate(selectedDate)}</CardTitle>
                  <CardDescription>
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredEvents.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <CalendarIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                      <p>No events scheduled for this day</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-3">
                        {filteredEvents.map((event: any) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mini Calendar Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={date => date && setSelectedDate(date)}
                    modifiers={{
                      hasEvents: (date: Date) => getEventsForDate(date).length > 0,
                    }}
                    modifiersClassNames={{
                      hasEvents: 'font-bold text-primary',
                    }}
                  />
                </CardContent>
              </Card>

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
                        events.filter((e: any) =>
                          isDateInRange(e.startDate, startOfWeek(new Date()), endOfWeek(new Date()))
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold">
                      {
                        events.filter((e: any) =>
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
            </div>
          </div>
        )}

        {/* Week View */}
        {view === 'week' && (
          <Card>
            <CardHeader>
              <CardTitle>Week View</CardTitle>
              <CardDescription>
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {getWeekDays().map((day, index) => {
                  const dayEvents = getEventsForDate(day);
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
                          {dayEvents.map((event: any) => (
                            <div
                              key={event.id}
                              className="cursor-pointer rounded border p-1.5 text-xs transition-colors hover:bg-accent"
                              onClick={() => {
                                if (event.isMeeting) {
                                  router.push(`/meet/${event.id}`);
                                } else {
                                  router.push(`/event/${event.id}`);
                                }
                              }}
                            >
                              <p className="truncate font-medium">
                                {event.isMeeting && '📅 '}
                                {event.title}
                              </p>
                              <p className="text-muted-foreground">{formatTime(event.startDate)}</p>
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
        )}

        {/* Month View */}
        {view === 'month' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Month View</CardTitle>
                  <CardDescription>
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={date => date && setSelectedDate(date)}
                    month={selectedDate}
                    onMonthChange={setSelectedDate}
                    modifiers={{
                      hasEvents: (date: Date) => getEventsForDate(date).length > 0,
                    }}
                    modifiersClassNames={{
                      hasEvents:
                        'font-bold text-primary relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary',
                    }}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Events List for Selected Date */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </CardTitle>
                  <CardDescription>
                    {getEventsForDate(selectedDate).length} event
                    {getEventsForDate(selectedDate).length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No events on this day
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {getEventsForDate(selectedDate).map((event: any) => (
                          <div
                            key={event.id}
                            className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent"
                            onClick={() => {
                              if (event.isMeeting) {
                                router.push(`/meet/${event.id}`);
                              } else {
                                router.push(`/event/${event.id}`);
                              }
                            }}
                          >
                            <h4 className="font-semibold">
                              {event.isMeeting && '📅 '}
                              {event.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(event.startDate)}
                            </p>
                            {event.location && !event.isMeeting && (
                              <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>
                            )}
                            {event.isMeeting && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {event.isPublic ? 'Public Meeting' : 'Private Meeting'}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </PageWrapper>
    </AuthGuard>
  );
}
