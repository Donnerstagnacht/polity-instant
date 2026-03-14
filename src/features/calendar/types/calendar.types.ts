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
  start_date: string | number | Date;
  end_date: string | number | Date;
  is_public: boolean;
  image_url?: string | null;
  organizer?: CalendarUser;
  participants?: readonly { user?: CalendarUser; instance_date?: number | null }[];
  isMeeting?: boolean;
  meeting_type?: string | null;
  is_bookable?: boolean;
  max_bookings?: number;
  bookingCount?: number;
  isBookedByMe?: boolean;
  groupName?: string;
  group_id?: string;
  isRecurringInstance?: boolean;
  recurringParentId?: string;
  hashtags?: { id: string; tag: string }[];
  attendeeCount?: number;
  organizerName?: string;
}
