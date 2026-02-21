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
  participants?: { user: CalendarUser }[];
  isMeeting?: boolean;
}
