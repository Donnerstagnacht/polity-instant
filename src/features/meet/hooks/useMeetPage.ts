import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useMeetingsByCreator, getInstanceBookingCount, isBookedByUser } from '@/zero/events'
import { useMeetingActions } from '@/zero/events/useMeetingActions'
import { useEventActions } from '@/zero/events/useEventActions'
import { generateRecurringInstances } from '@/features/calendar/logic/recurringEventHelpers'
import { buildRRule, type RecurrenceFormState } from '@/features/events/logic/rruleHelpers'
import { addHours } from 'date-fns'
import {
  isSameDay,
  isDateInRange,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  formatDate,
  formatWeekRange,
  formatMonth,
} from '@/features/meet/logic/date-helpers.ts'

export type CalendarView = 'day' | 'week' | 'month'

export interface MeetingInstance {
  id: string
  parentEventId: string
  title: string
  description: string | null
  meetingType: string | null
  startDate: number
  endDate: number
  isBookable: boolean
  maxBookings: number
  bookingCount: number
  isBookedByMe: boolean
  isRecurringInstance: boolean
  instanceDate: number | null
  streamUrl: string | null
  participants: Array<{
    id: string
    user_id: string
    instance_date?: number | null
    user?: { id: string; first_name?: string | null; last_name?: string | null; avatar?: string | null } | null
  }>
  creator?: { id: string; first_name?: string | null; last_name?: string | null; avatar?: string | null } | null
}

interface CreateMeetingArgs {
  title: string
  description: string
  meetingType: 'one-on-one' | 'public-meeting'
  startDate: Date
  durationMinutes: number
  maxBookings: number
  isRecurring: boolean
  recurrence?: RecurrenceFormState
  streamUrl?: string
}

export function useMeetPage(userId: string) {
  const { user: currentUser } = useAuth()
  const isOwner = currentUser?.id === userId
  const { meetings, isLoading } = useMeetingsByCreator(userId)
  const meetingActions = useMeetingActions()
  const eventActions = useEventActions()

  // Calendar view state
  const [view, setView] = useState<CalendarView>('day')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<MeetingInstance | null>(null)

  // Expand all meetings (recurring + one-time) into instances within a generous window
  const allInstances = useMemo(() => {
    const rangeStart = new Date(selectedDate)
    rangeStart.setMonth(rangeStart.getMonth() - 1)
    const rangeEnd = new Date(selectedDate)
    rangeEnd.setMonth(rangeEnd.getMonth() + 3)

    const instances: MeetingInstance[] = []

    for (const meeting of meetings) {
      const expanded = generateRecurringInstances(
        meeting,
        rangeStart,
        rangeEnd,
        [...(meeting.exceptions ?? [])],
      )

      for (const inst of expanded) {
        const instDateMs = inst.isRecurringInstance
          ? inst.start_date
          : null
        const participants = [...(meeting.participants ?? [])] as unknown as MeetingInstance['participants']
        const bookingCount = getInstanceBookingCount(
          participants,
          meeting.creator_id,
          instDateMs,
        )
        const bookedByMe = currentUser
          ? isBookedByUser(participants, currentUser.id, instDateMs)
          : false

        instances.push({
          id: inst.id,
          parentEventId: meeting.id,
          title: inst.title ?? 'Meeting',
          description: inst.description,
          meetingType: meeting.meeting_type,
          startDate: typeof inst.start_date === 'number' ? inst.start_date : new Date(inst.start_date).getTime(),
          endDate: typeof inst.end_date === 'number' ? inst.end_date : new Date(inst.end_date).getTime(),
          isBookable: meeting.is_bookable,
          maxBookings: meeting.max_bookings ?? 1,
          bookingCount,
          isBookedByMe: bookedByMe,
          isRecurringInstance: !!inst.isRecurringInstance,
          instanceDate: instDateMs,
          streamUrl: meeting.stream_url ?? null,
          participants,
          creator: meeting.creator as MeetingInstance['creator'],
        })
      }
    }

    return instances.sort((a, b) => a.startDate - b.startDate)
  }, [meetings, selectedDate, currentUser])

  // Filter instances based on current view
  const filteredInstances = useMemo(() => {
    if (view === 'day') {
      return allInstances.filter(inst => isSameDay(inst.startDate, selectedDate))
    }
    if (view === 'week') {
      const start = startOfWeek(selectedDate)
      const end = endOfWeek(selectedDate)
      return allInstances.filter(inst => isDateInRange(inst.startDate, start, end))
    }
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    return allInstances.filter(inst => isDateInRange(inst.startDate, start, end))
  }, [allInstances, view, selectedDate])

  // Instances on specifically selected date (for day view + mini calendar)
  const instancesOnSelectedDate = useMemo(
    () => allInstances.filter(inst => isSameDay(inst.startDate, selectedDate)),
    [allInstances, selectedDate],
  )

  // Next public meeting
  const nextPublicMeeting = useMemo(() => {
    const now = Date.now()
    return allInstances.find(
      inst => inst.meetingType === 'public-meeting' && inst.startDate > now,
    ) ?? null
  }, [allInstances])

  // Get instances for a specific date
  const getInstancesForDate = useCallback(
    (date: Date) => allInstances.filter(inst => isSameDay(inst.startDate, date)),
    [allInstances],
  )

  // Navigation
  const goToPrevious = useCallback(() => {
    setSelectedDate(prev => {
      const d = new Date(prev)
      if (view === 'day') d.setDate(d.getDate() - 1)
      else if (view === 'week') d.setDate(d.getDate() - 7)
      else d.setMonth(d.getMonth() - 1)
      return d
    })
  }, [view])

  const goToNext = useCallback(() => {
    setSelectedDate(prev => {
      const d = new Date(prev)
      if (view === 'day') d.setDate(d.getDate() + 1)
      else if (view === 'week') d.setDate(d.getDate() + 7)
      else d.setMonth(d.getMonth() + 1)
      return d
    })
  }, [view])

  const goToToday = useCallback(() => setSelectedDate(new Date()), [])

  const currentViewTitle = useMemo(() => {
    if (view === 'day') return formatDate(selectedDate)
    if (view === 'week') return formatWeekRange(selectedDate)
    return formatMonth(selectedDate)
  }, [view, selectedDate])

  // Handlers
  const handleBookMeeting = useCallback(
    async (instance: MeetingInstance) => {
      await meetingActions.bookMeeting(instance.parentEventId, instance.instanceDate)
      setIsBookingDialogOpen(false)
      setSelectedInstance(null)
    },
    [meetingActions],
  )

  const handleCancelBooking = useCallback(
    async (instance: MeetingInstance) => {
      await meetingActions.cancelMeetingBooking(instance.parentEventId, instance.instanceDate)
    },
    [meetingActions],
  )

  const handleCreateMeeting = useCallback(
    async (args: CreateMeetingArgs) => {
      const endDate = addHours(args.startDate, args.durationMinutes / 60)
      const id = crypto.randomUUID()

      let recurrenceRule: string | null = null
      let isRecurring = args.isRecurring
      let recurrencePattern: string | null = null
      let recurrenceEndDate: number | null = null

      if (args.isRecurring && args.recurrence) {
        recurrenceRule = buildRRule(args.recurrence)
        recurrencePattern = args.recurrence.pattern
        recurrenceEndDate = args.recurrence.endDate
          ? new Date(args.recurrence.endDate).getTime()
          : null
        if (!recurrenceRule) isRecurring = false
      }

      await eventActions.createEvent({
        id,
        title: args.title,
        group_id: null,
        description: args.description,
        status: 'published',
        event_type: 'meeting',
        is_public: args.meetingType === 'public-meeting',
        visibility: args.meetingType === 'public-meeting' ? 'public' : 'private',
        meeting_type: args.meetingType,
        is_bookable: true,
        max_bookings: args.maxBookings,
        start_date: args.startDate.getTime(),
        end_date: endDate.getTime(),
        is_recurring: isRecurring,
        recurrence_rule: recurrenceRule,
        recurrence_pattern: recurrencePattern,
        recurrence_end_date: recurrenceEndDate,
        stream_url: args.streamUrl ?? null,
        creator_id: currentUser!.id,
      })

      setIsCreateDialogOpen(false)
    },
    [eventActions, currentUser],
  )

  const handleDeleteMeeting = useCallback(
    async (eventId: string) => {
      await eventActions.cancelEvent({ id: eventId, cancel_reason: 'Deleted by owner' })
    },
    [eventActions],
  )

  const openBookingDialog = useCallback((instance: MeetingInstance) => {
    setSelectedInstance(instance)
    setIsBookingDialogOpen(true)
  }, [])

  return {
    // Auth state
    currentUser,
    isOwner,
    isLoading,
    owner: meetings[0]?.creator ?? null,

    // Calendar view
    view,
    setView,
    selectedDate,
    setSelectedDate,
    currentViewTitle,
    goToPrevious,
    goToNext,
    goToToday,

    // Data
    meetings,
    allInstances,
    filteredInstances,
    instancesOnSelectedDate,
    nextPublicMeeting,
    getInstancesForDate,

    // Dialogs
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isBookingDialogOpen,
    setIsBookingDialogOpen,
    selectedInstance,
    setSelectedInstance,

    // Handlers
    handleBookMeeting,
    handleCancelBooking,
    handleCreateMeeting,
    handleDeleteMeeting,
    openBookingDialog,
  }
}
