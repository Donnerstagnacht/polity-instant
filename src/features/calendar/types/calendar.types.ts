export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarUser {
  id: string;
  name?: string;
  avatar?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  startDate: string | number | Date;
  endDate: string | number | Date;
  isPublic: boolean;
  imageURL?: string | null;
  organizer?: CalendarUser;
  participants?: readonly { user?: CalendarUser; instance_date?: number | null }[];
  isMeeting?: boolean;
  meetingType?: string | null;
  isBookable?: boolean;
  maxBookings?: number;
  bookingCount?: number;
  isBookedByMe?: boolean;
  groupName?: string;
  groupId?: string;
  isRecurringInstance?: boolean;
  recurringParentId?: string;
  hashtags?: { id: string; tag: string }[];
  attendeeCount?: number;
  organizerName?: string;
}
