# User Meeting Scheduler

## Overview

The User Meeting Scheduler is a comprehensive feature that allows users to manage their availability and schedule meetings with others in the Polity platform.

## Features

### For Meeting Owners

- **Create Time Slots**: Add available time slots for one-on-one meetings or public meetings
- **Public Meetings**: Schedule open sessions that anyone can join
- **Manage Bookings**: View all bookings and manage your calendar
- **Delete Slots**: Remove time slots as needed

### For Meeting Bookers

- **Calendar View**: Browse available time slots using an interactive calendar
- **Book Meetings**: Reserve one-on-one sessions with other users
- **Join Public Meetings**: RSVP for open public meetings
- **View Bookings**: See all your upcoming meetings

## Database Schema

### Entities

#### `meetingSlots`

- `startTime` (Date, indexed): When the meeting starts
- `endTime` (Date, indexed): When the meeting ends
- `isPublic` (Boolean, indexed): Whether it's a public meeting
- `isAvailable` (Boolean, indexed): Whether the slot is still available
- `title` (String, optional): Meeting title
- `description` (String, optional): Meeting description
- `meetingType` (String, indexed): Either 'one-on-one' or 'public-meeting'
- `createdAt` (Date, indexed): Creation timestamp
- `updatedAt` (Date, indexed): Last update timestamp

#### `meetingBookings`

- `status` (String, indexed): Booking status ('pending', 'confirmed', 'cancelled')
- `notes` (String, optional): Booking notes from the booker
- `createdAt` (Date, indexed): Creation timestamp
- `updatedAt` (Date, indexed): Last update timestamp

### Relationships

- `meetingSlots` → `owner` (User): Who owns the time slot
- `meetingBookings` → `slot` (MeetingSlot): Which slot is booked
- `meetingBookings` → `booker` (User): Who booked the slot

## Usage

### Accessing the Feature

Navigate to any user's profile and click the "Meet" tab in the secondary navigation.

**URL Pattern**: `/user/:id/meet`

### Creating Time Slots (Owner View)

1. Go to your profile's Meet page
2. Click "Manage Slots" tab
3. Click "Add New Slot" button
4. Choose meeting type (1-on-1 or Public)
5. Fill in title, description, date, time, and duration
6. Click "Create Slot"

### Booking a Meeting (Visitor View)

1. Go to a user's Meet page
2. Select a date from the calendar
3. View available time slots
4. Click "Book" on your desired slot
5. Add optional notes
6. Click "Confirm Booking"

### Public Meetings

Public meetings are highlighted on the page and can have multiple attendees. The next upcoming public meeting is displayed prominently at the top of the page.

## Seed Data

The seed script creates:

- **Main test user**: 10 slots (5 available, 3 booked, 2 public meetings)
- **Tobias**: 10 slots (5 available, 3 booked, 2 public meetings)
- **3 random users**: 2-3 available slots each

## Component Structure

### Main Component

`src/features/user/ui/UserMeetingScheduler.tsx`

- Full-featured meeting scheduling interface
- Three tabs: Calendar View, Manage Slots (owner only), Bookings
- Interactive calendar with highlighted dates
- Real-time booking management

### Page

`app/user/[id]/meet/page.tsx`

- Route handler for the meet feature
- Handles authentication and parameter resolution

## Permissions

- **Owner View**: Full control to create, manage, and delete slots
- **Visitor View**: Can view available slots and book meetings
- **Authentication**: Requires logged-in user to book meetings

## Future Enhancements

- Video call integration
- Email/calendar integration (ICS export)
- Recurring meeting slots
- Booking approval workflow
- Meeting reminders
- Time zone support
- Availability templates (e.g., "Office Hours: Mon-Fri 2-4pm")
