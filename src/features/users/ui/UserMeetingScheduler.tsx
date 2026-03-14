'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Calendar } from '@/features/shared/ui/ui/calendar';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { ScrollArea } from '@/features/shared/ui/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Switch } from '@/features/shared/ui/ui/switch';
import { startOfDay, isPast } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Plus,
  Repeat,
} from 'lucide-react';
import { CalendarViewSelector } from './CalendarViewSelector';
import { format } from 'date-fns';
import { useMeetPage, type MeetingInstance } from '@/features/meet/hooks/useMeetPage';
import { MeetingInstanceCard } from '@/features/meet/ui/MeetingInstanceCard';
import { isSameDay, formatTime } from '@/features/meet/logic/date-helpers.ts';
import type { RecurrencePattern } from '@/features/events/logic/rruleHelpers';

interface UserMeetingSchedulerProps {
  userId: string;
}

export function UserMeetingScheduler({ userId }: UserMeetingSchedulerProps) {
  const {
    currentUser,
    isOwner,
    isLoading,
    owner,
    view,
    setView,
    selectedDate,
    setSelectedDate,
    currentViewTitle,
    goToPrevious,
    goToNext,
    goToToday,
    allInstances,
    filteredInstances,
    instancesOnSelectedDate,
    nextPublicMeeting,
    getInstancesForDate,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isBookingDialogOpen,
    setIsBookingDialogOpen,
    selectedInstance,
    handleBookMeeting,
    handleCancelBooking,
    handleCreateMeeting,
    handleDeleteMeeting,
    openBookingDialog,
  } = useMeetPage(userId);

  // Create meeting form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const [newTime, setNewTime] = useState('09:00');
  const [newDuration, setNewDuration] = useState('60');
  const [newType, setNewType] = useState<'one-on-one' | 'public-meeting'>('one-on-one');
  const [newMaxBookings, setNewMaxBookings] = useState('1');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(undefined);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([0, 1, 2, 3, 4]); // Mon-Fri (rrule 0-indexed)

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewDate(new Date());
    setNewTime('09:00');
    setNewDuration('60');
    setNewType('one-on-one');
    setNewMaxBookings('1');
    setIsRecurring(false);
    setRecurringPattern('weekly');
    setRecurringEndDate(undefined);
    setSelectedWeekdays([0, 1, 2, 3, 4]);
  };

  const handleSubmitCreate = async () => {
    if (!newDate || !currentUser) return;

    const [hours, minutes] = newTime.split(':');
    const startDate = new Date(newDate);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    await handleCreateMeeting({
      title: newTitle || (newType === 'public-meeting' ? 'Public Office Hours' : '1-on-1 Meeting'),
      description: newDescription || 'Available for booking',
      meetingType: newType,
      startDate,
      durationMinutes: parseInt(newDuration),
      maxBookings: newType === 'one-on-one' ? 1 : parseInt(newMaxBookings) || 10,
      isRecurring,
      recurrence: isRecurring
        ? {
            pattern: recurringPattern as RecurrencePattern,
            interval: 1,
            weekdays: recurringPattern === 'weekly' ? selectedWeekdays : [],
            endDate: recurringEndDate ? recurringEndDate.toISOString().split('T')[0] : null,
          }
        : undefined,
    });

    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">Loading meetings...</div>
      </div>
    );
  }

  // Booked instances (for bookings tab)
  const bookedInstances = allInstances.filter(inst =>
    isOwner ? inst.bookingCount > 0 : inst.isBookedByMe,
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          {isOwner
            ? 'Manage Your Meetings'
            : `Book a Meeting with ${owner?.first_name || 'User'}`}
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
        selectedDate={selectedDate}
        onPreviousClick={goToPrevious}
        onTodayClick={goToToday}
        onNextClick={goToNext}
        currentViewTitle={currentViewTitle}
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
                {nextPublicMeeting.description && (
                  <p className="text-sm text-muted-foreground">{nextPublicMeeting.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(nextPublicMeeting.startDate), 'PPP')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(nextPublicMeeting.startDate), 'p')} -{' '}
                    {format(new Date(nextPublicMeeting.endDate), 'p')}
                  </div>
                </div>

                {nextPublicMeeting.bookingCount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {nextPublicMeeting.participants
                        .filter(p => p.user_id !== nextPublicMeeting.creator?.id)
                        .slice(0, 5)
                        .map(p => (
                          <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={p.user?.avatar ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {p.user?.first_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {nextPublicMeeting.bookingCount} attending
                    </span>
                  </div>
                )}
              </div>
              {!isOwner && !nextPublicMeeting.isBookedByMe && (
                <Button onClick={() => openBookingDialog(nextPublicMeeting)}>
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={d => d && setSelectedDate(d)}
                className="rounded-md border"
                modifiers={{
                  hasSlots: (date: Date) => getInstancesForDate(date).length > 0,
                }}
                modifiersClassNames={{
                  hasSlots: 'font-bold text-primary',
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentViewTitle}</span>
                {isOwner && (
                  <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meeting
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                {instancesOnSelectedDate.length > 0
                  ? `${instancesOnSelectedDate.length} meeting${instancesOnSelectedDate.length > 1 ? 's' : ''} on this date`
                  : 'No meetings on this date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {instancesOnSelectedDate.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {instancesOnSelectedDate.map(inst => (
                      <MeetingInstanceCard
                        key={inst.id}
                        instance={inst}
                        isOwner={isOwner}
                        onBook={openBookingDialog}
                        onCancel={handleCancelBooking}
                        onDelete={handleDeleteMeeting}
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No meetings on this date</p>
                  {isOwner && (
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create a Meeting
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(selectedDate);
                const dayOfWeek = d.getDay();
                d.setDate(d.getDate() - dayOfWeek + i);
                const dayInstances = getInstancesForDate(d);
                const isToday = isSameDay(d, new Date());
                return (
                  <div key={i} className="min-h-[120px]">
                    <div
                      className={`mb-2 text-center text-sm font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {format(d, 'EEE d')}
                    </div>
                    <div className="space-y-1">
                      {dayInstances.map(inst => (
                        <div
                          key={inst.id}
                          className={`cursor-pointer rounded px-2 py-1 text-xs ${
                            inst.isBookedByMe
                              ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                              : inst.isBookable
                                ? 'border border-dashed border-blue-400 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                : 'bg-muted'
                          }`}
                          onClick={() => openBookingDialog(inst)}
                        >
                          <div className="font-medium">{formatTime(inst.startDate)}</div>
                          <div className="truncate">{inst.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={d => d && setSelectedDate(d)}
                className="rounded-md border"
                modifiers={{
                  hasSlots: (date: Date) => getInstancesForDate(date).length > 0,
                }}
                modifiersClassNames={{
                  hasSlots: 'font-bold text-primary',
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{currentViewTitle}</CardTitle>
              <CardDescription>
                {filteredInstances.length} meeting{filteredInstances.length !== 1 ? 's' : ''} this
                month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {filteredInstances.map(inst => (
                    <MeetingInstanceCard
                      key={inst.id}
                      instance={inst}
                      isOwner={isOwner}
                      onBook={openBookingDialog}
                      onCancel={handleCancelBooking}
                      onDelete={handleDeleteMeeting}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs: Manage Meetings / Bookings */}
      <Tabs defaultValue={isOwner ? 'manage' : 'bookings'} className="mt-6 space-y-6">
        <TabsList>
          {isOwner && <TabsTrigger value="manage">Manage Meetings</TabsTrigger>}
          <TabsTrigger value="bookings">{isOwner ? 'Your Bookings' : 'My Bookings'}</TabsTrigger>
        </TabsList>

        {isOwner && (
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Meetings</CardTitle>
                <CardDescription>Manage your available meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Meeting
                  </Button>
                </div>
                <div className="space-y-3">
                  {allInstances
                    .filter(inst => inst.endDate > Date.now())
                    .map(inst => (
                      <MeetingInstanceCard
                        key={inst.id}
                        instance={inst}
                        isOwner={isOwner}
                        onBook={openBookingDialog}
                        onCancel={handleCancelBooking}
                        onDelete={handleDeleteMeeting}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

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
                {bookedInstances.length > 0 ? (
                  bookedInstances.map(inst => (
                    <MeetingInstanceCard
                      key={inst.id}
                      instance={inst}
                      isOwner={isOwner}
                      onBook={openBookingDialog}
                      onCancel={handleCancelBooking}
                      onDelete={handleDeleteMeeting}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No bookings yet
                  </p>
                )}
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
            <DialogDescription>
              Confirm your booking for {selectedInstance?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{selectedInstance.title}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(selectedInstance.startDate), 'PPP')}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {format(new Date(selectedInstance.startDate), 'p')} -{' '}
                    {format(new Date(selectedInstance.endDate), 'p')}
                  </div>
                  {selectedInstance.bookingCount > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {selectedInstance.bookingCount} / {selectedInstance.maxBookings} spots taken
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedInstance && handleBookMeeting(selectedInstance)}
              disabled={
                !selectedInstance ||
                selectedInstance.isBookedByMe ||
                selectedInstance.bookingCount >= selectedInstance.maxBookings
              }
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Meeting Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={open => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Meeting</DialogTitle>
            <DialogDescription>
              Create {isRecurring ? 'a recurring' : 'a'} meeting slot for others to book
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Meeting Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newType === 'one-on-one' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewType('one-on-one')}
                >
                  1-on-1
                </Button>
                <Button
                  type="button"
                  variant={newType === 'public-meeting' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewType('public-meeting')}
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
                  Recurring Meeting
                </Label>
              </div>
            </div>

            {isRecurring && (
              <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                <div className="space-y-2">
                  <Label>Recurrence Pattern</Label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map(p => (
                      <Button
                        key={p}
                        type="button"
                        size="sm"
                        variant={recurringPattern === p ? 'default' : 'outline'}
                        onClick={() => setRecurringPattern(p)}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {recurringPattern === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Weekdays</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Mon', value: 0 },
                        { label: 'Tue', value: 1 },
                        { label: 'Wed', value: 2 },
                        { label: 'Thu', value: 3 },
                        { label: 'Fri', value: 4 },
                        { label: 'Sat', value: 5 },
                        { label: 'Sun', value: 6 },
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
                                : [...prev, day.value],
                            );
                          }}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

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
              <Label htmlFor="meeting-title">Title</Label>
              <Input
                id="meeting-title"
                placeholder={newType === 'public-meeting' ? 'Public Office Hours' : '1-on-1 Meeting'}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                placeholder="What will this meeting be about?"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={2}
              />
            </div>

            {newType === 'public-meeting' && (
              <div className="space-y-2">
                <Label htmlFor="max-bookings">Max Participants</Label>
                <Input
                  id="max-bookings"
                  type="number"
                  min="1"
                  max="100"
                  value={newMaxBookings}
                  onChange={e => setNewMaxBookings(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>{isRecurring ? 'Start Date' : 'Date'}</Label>
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                className="rounded-md border"
                disabled={date => isPast(startOfDay(date))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-time">Start Time</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-duration">Duration (min)</Label>
                <Input
                  id="meeting-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate}>
              Create Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
