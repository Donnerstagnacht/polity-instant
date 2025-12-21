'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import db from '../../../../db/db';
import { id, tx } from '@instantdb/react';
import { addHours, startOfDay, addDays, addMonths, isPast, isFuture, format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Plus,
  Trash2,
  Repeat,
  ExternalLink,
} from 'lucide-react';
import { CalendarViewSelector, CalendarView } from './CalendarViewSelector';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { useRouter } from 'next/navigation';
import {
  isSameDay,
  isDateInRange,
  formatDate,
  formatWeekRange,
  formatMonth,
  formatTime,
  getWeekDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from '@/utils/date-helpers';

interface UserMeetingSchedulerProps {
  userId: string;
}

export function UserMeetingScheduler({ userId }: UserMeetingSchedulerProps) {
  const router = useRouter();
  const [view, setView] = useState<CalendarView>('day');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [newSlotTitle, setNewSlotTitle] = useState('');
  const [newSlotDescription, setNewSlotDescription] = useState('');
  const [newSlotDate, setNewSlotDate] = useState<Date | undefined>(new Date());
  const [newSlotTime, setNewSlotTime] = useState('09:00');
  const [newSlotDuration, setNewSlotDuration] = useState('60');
  const [newSlotType, setNewSlotType] = useState<'one-on-one' | 'public-meeting'>('one-on-one');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>(
    'weekly'
  );
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(undefined);
  const [numberOfSlots, setNumberOfSlots] = useState('4');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [slotsPerDay, setSlotsPerDay] = useState('1');
  const [slotDuration, setSlotDuration] = useState('60');

  // Get current user
  const { user: currentUser } = db.useAuth();

  // Check if the current user is viewing their own page
  const isOwner = currentUser?.id === userId;

  // Fetch meeting slots for this user
  const { data, isLoading } = db.useQuery({
    meetingSlots: {
      $: {
        where: {
          'owner.id': userId,
        },
      },
      owner: {},
      bookings: {
        booker: {},
      },
    },
  });

  const meetingSlots = data?.meetingSlots || [];
  const owner = meetingSlots[0]?.owner;

  // Navigation functions
  const goToPrevious = () => {
    if (!selectedDate) return;
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
    if (!selectedDate) return;
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

  const getCurrentViewTitle = () => {
    if (!selectedDate) return '';
    if (view === 'day') return formatDate(selectedDate);
    if (view === 'week') return formatWeekRange(selectedDate);
    return formatMonth(selectedDate);
  };

  // Filter slots based on selected date and view
  const filteredSlots = useMemo(() => {
    if (!selectedDate) return [];

    if (view === 'day') {
      return meetingSlots.filter((slot: any) => isSameDay(slot.startTime, selectedDate));
    } else if (view === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return meetingSlots.filter((slot: any) => isDateInRange(slot.startTime, start, end));
    } else {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      return meetingSlots.filter((slot: any) => isDateInRange(slot.startTime, start, end));
    }
  }, [meetingSlots, view, selectedDate]);

  // Filter slots based on selected date (for day view and mini calendar)
  const slotsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return meetingSlots.filter((slot: any) => {
      const slotDate = new Date(slot.startTime);
      return isSameDay(slotDate, selectedDate);
    });
  }, [meetingSlots, selectedDate]);

  // Get next public meeting
  const nextPublicMeeting = useMemo(() => {
    const publicSlots = meetingSlots.filter(
      (slot: any) =>
        slot.isPublic && slot.meetingType === 'public-meeting' && isFuture(new Date(slot.startTime))
    );
    if (publicSlots.length === 0) return null;
    return publicSlots.sort(
      (a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )[0];
  }, [meetingSlots]);

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    return meetingSlots.filter((slot: any) => isSameDay(slot.startTime, date));
  };

  // Get week days helper
  const getWeekDaysArray = () => getWeekDays(selectedDate || new Date());

  // Handle booking a slot
  const handleBookSlot = async () => {
    if (!selectedSlot || !currentUser) return;

    try {
      // Only create the booking - the slot availability will be determined by the bookings
      await db.transact([
        tx.meetingBookings[id()]
          .update({
            status: 'confirmed',
            notes: bookingNotes,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .link({
            slot: selectedSlot.id,
            booker: currentUser.id,
          }),
        // Update slot availability
        tx.meetingSlots[selectedSlot.id].update({
          isAvailable: selectedSlot.meetingType === 'one-on-one' ? false : true,
          updatedAt: new Date(),
        }),
      ]);

      // Close dialog and reset state first
      setIsBookingDialogOpen(false);
      setBookingNotes('');
      setSelectedSlot(null);

      // Then show success toast
      toast.success(`Your meeting on ${format(new Date(selectedSlot.startTime), 'PPP')} at ${format(new Date(selectedSlot.startTime), 'p')} has been confirmed.`);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book the meeting. Please try again.');
    }
  };

  // Handle creating a new slot
  const handleCreateSlot = async () => {
    if (!newSlotDate || !currentUser) return;

    const [hours, minutes] = newSlotTime.split(':');

    try {
      if (isRecurring) {
        // Generate recurring slots
        const slots = generateRecurringSlots();
        const transactions = slots.map(slotData => {
          return tx.meetingSlots[id()]
            .update({
              startTime: slotData.startTime,
              endTime: slotData.endTime,
              isPublic: newSlotType === 'public-meeting',
              isAvailable: true,
              title:
                newSlotTitle ||
                (newSlotType === 'public-meeting' ? 'Public Office Hours' : '1-on-1 Meeting'),
              description: newSlotDescription || 'Available for booking',
              meetingType: newSlotType,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .link({
              owner: currentUser.id,
            });
        });

        await db.transact(transactions);

        toast.success(`${slots.length} ${newSlotType === 'public-meeting' ? 'public meeting' : 'meeting'} slots created.`);
      } else {
        // Single slot creation
        const startTime = new Date(newSlotDate);
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const endTime = addHours(startTime, parseInt(newSlotDuration) / 60);

        await db.transact([
          tx.meetingSlots[id()]
            .update({
              startTime,
              endTime,
              isPublic: newSlotType === 'public-meeting',
              isAvailable: true,
              title:
                newSlotTitle ||
                (newSlotType === 'public-meeting' ? 'Public Office Hours' : '1-on-1 Meeting'),
              description: newSlotDescription || 'Available for booking',
              meetingType: newSlotType,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .link({
              owner: currentUser.id,
            }),
        ]);

        toast.success(`New ${newSlotType === 'public-meeting' ? 'public meeting' : 'meeting'} slot created for ${format(startTime, 'PPP')} at ${format(startTime, 'p')}.`);
      }

      // Reset form
      setNewSlotTitle('');
      setNewSlotDescription('');
      setNewSlotDate(new Date());
      setNewSlotTime('09:00');
      setNewSlotDuration('60');
      setNewSlotType('one-on-one');
      setIsRecurring(false);
      setRecurringPattern('weekly');
      setRecurringEndDate(undefined);
      setNumberOfSlots('4');
      setSelectedWeekdays([1, 2, 3, 4, 5]);
      setSlotsPerDay('1');
      setSlotDuration('60');
      setIsManageDialogOpen(false);
    } catch {
      toast.error('Failed to create time slot(s). Please try again.');
    }
  };

  // Generate recurring slots based on pattern
  const generateRecurringSlots = () => {
    if (!newSlotDate) return [];

    const [hours, minutes] = newSlotTime.split(':');
    const slots: { startTime: Date; endTime: Date }[] = [];
    const maxSlots = parseInt(numberOfSlots);
    const slotsPerDayCount = parseInt(slotsPerDay);
    const slotDurationMinutes = parseInt(slotDuration);
    let currentDate = new Date(newSlotDate);
    currentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    let totalSlotsCreated = 0;

    while (totalSlotsCreated < maxSlots) {
      // Check if we've exceeded the end date (if specified)
      if (recurringEndDate && currentDate > recurringEndDate) {
        break;
      }

      // For weekly pattern, check if the day is selected
      if (recurringPattern === 'weekly') {
        const dayOfWeek = currentDate.getDay();
        if (selectedWeekdays.includes(dayOfWeek)) {
          // Create multiple slots for this day
          for (let i = 0; i < slotsPerDayCount && totalSlotsCreated < maxSlots; i++) {
            const slotStartTime = new Date(currentDate);
            slotStartTime.setMinutes(slotStartTime.getMinutes() + i * slotDurationMinutes);
            const slotEndTime = new Date(slotStartTime);
            slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDurationMinutes);

            slots.push({ startTime: slotStartTime, endTime: slotEndTime });
            totalSlotsCreated++;
          }
        }
        currentDate = addDays(currentDate, 1);
        currentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else if (recurringPattern === 'daily') {
        // Create multiple slots for this day
        for (let i = 0; i < slotsPerDayCount && totalSlotsCreated < maxSlots; i++) {
          const slotStartTime = new Date(currentDate);
          slotStartTime.setMinutes(slotStartTime.getMinutes() + i * slotDurationMinutes);
          const slotEndTime = new Date(slotStartTime);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDurationMinutes);

          slots.push({ startTime: slotStartTime, endTime: slotEndTime });
          totalSlotsCreated++;
        }
        currentDate = addDays(currentDate, 1);
        currentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else if (recurringPattern === 'monthly') {
        // Create multiple slots for this day
        for (let i = 0; i < slotsPerDayCount && totalSlotsCreated < maxSlots; i++) {
          const slotStartTime = new Date(currentDate);
          slotStartTime.setMinutes(slotStartTime.getMinutes() + i * slotDurationMinutes);
          const slotEndTime = new Date(slotStartTime);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDurationMinutes);

          slots.push({ startTime: slotStartTime, endTime: slotEndTime });
          totalSlotsCreated++;
        }
        currentDate = addMonths(currentDate, 1);
        currentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      // Safety break to avoid infinite loops
      if (totalSlotsCreated === 0 && slots.length === 0) {
        currentDate = addDays(currentDate, 1);
        currentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
    }

    return slots;
  };

  // Handle deleting a slot
  const handleDeleteSlot = async (slotId: string) => {
    try {
      await db.transact([tx.meetingSlots[slotId].delete()]);

      toast.success('The time slot has been removed.');
    } catch {
      toast.error('Failed to delete time slot. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Loading meeting scheduler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          {isOwner ? 'Manage Your Meetings' : `Book a Meeting with ${owner?.name || 'User'}`}
        </h1>
        <p className="text-muted-foreground">
          {isOwner
            ? 'Create and manage your available time slots for meetings'
            : 'Select an available time slot to schedule a meeting'}
        </p>
      </div>

      {/* Calendar View Selector */}
      <CalendarViewSelector
        view={view}
        onViewChange={setView}
        selectedDate={selectedDate || new Date()}
        onPreviousClick={goToPrevious}
        onTodayClick={goToToday}
        onNextClick={goToNext}
        currentViewTitle={getCurrentViewTitle()}
      />

      {/* Next Public Meeting Card */}
      {nextPublicMeeting && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Next Public Meeting
            </CardTitle>
            <CardDescription>Join the upcoming open session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold">{nextPublicMeeting.title}</h3>
                <p className="text-sm text-muted-foreground">{nextPublicMeeting.description}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(nextPublicMeeting.startTime), 'PPP')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(nextPublicMeeting.startTime), 'p')} -{' '}
                    {format(new Date(nextPublicMeeting.endTime), 'p')}
                  </div>
                </div>

                {/* Show attendee avatars */}
                {nextPublicMeeting.bookings && nextPublicMeeting.bookings.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {nextPublicMeeting.bookings.slice(0, 5).map((booking: any) => (
                        <Avatar key={booking.id} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={booking.booker?.avatar} />
                          <AvatarFallback className="text-xs">
                            {booking.booker?.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {nextPublicMeeting.bookings.length} attending
                      {nextPublicMeeting.bookings.length > 5 &&
                        ` (+${nextPublicMeeting.bookings.length - 5} more)`}
                    </span>
                  </div>
                )}
              </div>
              {!isOwner && (
                <Button
                  onClick={() => {
                    setSelectedSlot(nextPublicMeeting);
                    setIsBookingDialogOpen(true);
                  }}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Views */}
      {view === 'day' && selectedDate && (
        <DayView
          selectedDate={selectedDate}
          slots={slotsOnSelectedDate}
          isOwner={isOwner}
          currentUser={currentUser}
          onDateSelect={setSelectedDate}
          onManageDialogOpen={() => setIsManageDialogOpen(true)}
          onBookSlot={slot => {
            setSelectedSlot(slot);
            setIsBookingDialogOpen(true);
          }}
          onDeleteSlot={handleDeleteSlot}
          getSlotsForDate={getSlotsForDate}
        />
      )}

      {view === 'week' && selectedDate && (
        <WeekView
          selectedDate={selectedDate}
          slots={filteredSlots}
          getWeekDays={getWeekDaysArray}
          getSlotsForDate={getSlotsForDate}
          formatTime={formatTime}
        />
      )}

      {view === 'month' && selectedDate && (
        <MonthView
          selectedDate={selectedDate}
          slots={filteredSlots}
          isOwner={isOwner}
          currentUser={currentUser}
          onDateSelect={setSelectedDate}
          onMonthChange={setSelectedDate}
          getSlotsForDate={getSlotsForDate}
          onBookSlot={slot => {
            setSelectedSlot(slot);
            setIsBookingDialogOpen(true);
          }}
          onDeleteSlot={handleDeleteSlot}
        />
      )}

      <Tabs defaultValue="manage" className="mt-6 space-y-6">
        <TabsList>
          {isOwner && <TabsTrigger value="manage">Manage Slots</TabsTrigger>}
          <TabsTrigger value="bookings">{isOwner ? 'Your Bookings' : 'My Bookings'}</TabsTrigger>
        </TabsList>

        {/* Manage Slots (Owner Only) */}
        {isOwner && (
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Time Slots</CardTitle>
                <CardDescription>Manage your available meeting slots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button onClick={() => setIsManageDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Slot
                  </Button>
                </div>
                <div className="space-y-3">
                  {meetingSlots
                    .filter((slot: any) => isFuture(new Date(slot.startTime)))
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                    )
                    .map((slot: any) => (
                      <div
                        key={slot.id}
                        className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent"
                        onClick={() => router.push(`/meet/${slot.id}`)}
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
                              {!slot.isAvailable && slot.meetingType === 'one-on-one' && (
                                <Badge variant="outline">Booked</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {format(new Date(slot.startTime), 'PPP')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(slot.startTime), 'p')} -{' '}
                                {format(new Date(slot.endTime), 'p')}
                              </div>
                            </div>
                            {slot.bookings && slot.bookings.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {slot.bookings.slice(0, 3).map((booking: any) => (
                                  <div key={booking.id} className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={booking.booker?.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {booking.booker?.name?.[0]?.toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                      {booking.booker?.name || 'Unknown'}
                                    </span>
                                  </div>
                                ))}
                                {slot.bookings.length > 3 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{slot.bookings.length - 3} more
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Bookings */}
        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isOwner ? 'Your Bookings' : 'My Bookings'}</CardTitle>
              <CardDescription>
                {isOwner
                  ? 'View meetings that others have booked with you'
                  : 'View your upcoming meetings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meetingSlots
                  .filter((slot: any) => {
                    if (isOwner) {
                      return slot.bookings && slot.bookings.length > 0;
                    }
                    return (
                      slot.bookings &&
                      slot.bookings.some((b: any) => b.booker?.id === currentUser?.id)
                    );
                  })
                  .sort(
                    (a: any, b: any) =>
                      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                  )
                  .map((slot: any) => (
                    <div
                      key={slot.id}
                      className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent"
                      onClick={() => router.push(`/meet/${slot.id}`)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{slot.title}</h4>
                          {slot.isPublic && (
                            <Badge variant="secondary">
                              <Users className="mr-1 h-3 w-3" />
                              Public
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={e => {
                              e.stopPropagation();
                              router.push(`/meet/${slot.id}`);
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(slot.startTime), 'PPP')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(slot.startTime), 'p')} -{' '}
                            {format(new Date(slot.endTime), 'p')}
                          </div>
                        </div>
                        {slot.bookings && (
                          <div className="space-y-2">
                            {slot.bookings.map((booking: any) => (
                              <div key={booking.id} className="rounded-md bg-muted p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={booking.booker?.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {booking.booker?.name?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {isOwner
                                        ? `${booking.booker?.name || 'Unknown'}`
                                        : `${owner?.name || 'Unknown'}`}
                                    </div>
                                    {booking.notes && (
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {booking.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Meeting</DialogTitle>
            <DialogDescription>Confirm your booking for {selectedSlot?.title}</DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{selectedSlot.title}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(selectedSlot.startTime), 'PPP')}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {format(new Date(selectedSlot.startTime), 'p')} -{' '}
                    {format(new Date(selectedSlot.endTime), 'p')}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes or topics you'd like to discuss..."
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookSlot}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Slot Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Time Slot{isRecurring ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Add {isRecurring ? 'recurring' : 'a new'} available time slot
              {isRecurring ? 's' : ''} for meetings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slot-type">Meeting Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newSlotType === 'one-on-one' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewSlotType('one-on-one')}
                >
                  1-on-1
                </Button>
                <Button
                  type="button"
                  variant={newSlotType === 'public-meeting' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewSlotType('public-meeting')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Public
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                <Label htmlFor="recurring" className="flex cursor-pointer items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Create Recurring Slots
                </Label>
              </div>
            </div>

            {isRecurring && (
              <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                <div className="space-y-2">
                  <Label>Recurrence Pattern</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={recurringPattern === 'daily' ? 'default' : 'outline'}
                      onClick={() => setRecurringPattern('daily')}
                    >
                      Daily
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={recurringPattern === 'weekly' ? 'default' : 'outline'}
                      onClick={() => setRecurringPattern('weekly')}
                    >
                      Weekly
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={recurringPattern === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setRecurringPattern('monthly')}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>

                {recurringPattern === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Weekdays</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Mon', value: 1 },
                        { label: 'Tue', value: 2 },
                        { label: 'Wed', value: 3 },
                        { label: 'Thu', value: 4 },
                        { label: 'Fri', value: 5 },
                        { label: 'Sat', value: 6 },
                        { label: 'Sun', value: 0 },
                      ].map(day => (
                        <Button
                          key={day.value}
                          type="button"
                          size="sm"
                          variant={selectedWeekdays.includes(day.value) ? 'default' : 'outline'}
                          onClick={() => {
                            setSelectedWeekdays(prev =>
                              prev.includes(day.value)
                                ? prev.filter(d => d !== day.value)
                                : [...prev, day.value]
                            );
                          }}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slots-per-day">Slots per Day</Label>
                    <Input
                      id="slots-per-day"
                      type="number"
                      min="1"
                      max="20"
                      value={slotsPerDay}
                      onChange={e => setSlotsPerDay(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of consecutive slots per day
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-duration-recurring">Slot Duration (min)</Label>
                    <Input
                      id="slot-duration-recurring"
                      type="number"
                      min="15"
                      step="15"
                      value={slotDuration}
                      onChange={e => setSlotDuration(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Length of each individual slot</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num-slots">Maximum Total Slots</Label>
                  <Input
                    id="num-slots"
                    type="number"
                    min="1"
                    max="200"
                    value={numberOfSlots}
                    onChange={e => setNumberOfSlots(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of slots to create (up to 200)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Calendar
                    mode="single"
                    selected={recurringEndDate}
                    onSelect={setRecurringEndDate}
                    className="rounded-md border"
                    disabled={date => isPast(startOfDay(date))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="slot-title">Title</Label>
              <Input
                id="slot-title"
                placeholder={
                  newSlotType === 'public-meeting' ? 'Public Office Hours' : '1-on-1 Meeting'
                }
                value={newSlotTitle}
                onChange={e => setNewSlotTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot-description">Description</Label>
              <Textarea
                id="slot-description"
                placeholder="What will this meeting be about?"
                value={newSlotDescription}
                onChange={e => setNewSlotDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRecurring ? 'Start Date' : 'Date'}</Label>
              <Calendar
                mode="single"
                selected={newSlotDate}
                onSelect={setNewSlotDate}
                className="rounded-md border"
                disabled={date => isPast(startOfDay(date))}
              />
            </div>

            {isRecurring ? (
              <div className="space-y-2">
                <Label htmlFor="slot-time-recurring">Start Time (First Slot of Each Day)</Label>
                <Input
                  id="slot-time-recurring"
                  type="time"
                  value={newSlotTime}
                  onChange={e => setNewSlotTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Time when the first slot of each day begins
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slot-time">Start Time</Label>
                  <Input
                    id="slot-time"
                    type="time"
                    value={newSlotTime}
                    onChange={e => setNewSlotTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-duration">Duration (min)</Label>
                  <Input
                    id="slot-duration"
                    type="number"
                    min="15"
                    step="15"
                    value={newSlotDuration}
                    onChange={e => setNewSlotDuration(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSlot}>
              Create {isRecurring ? `${numberOfSlots} Slots` : 'Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
