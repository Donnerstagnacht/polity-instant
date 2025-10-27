# Meeting Scheduler Fixes & Enhancements

## Issues Fixed

### 1. Schema Issues (Database Links)

**Problem**: The `links` entity didn't have proper relationships with `meetingSlots` and `$users`, and the `meetingSlots` owner link wasn't properly configured.

**Solution**: Added the following links to `instant.schema.ts`:

- `linksUser`: Links `links` entity to `$users`
- `linksMeetingSlot`: Links `links` entity to `meetingSlots`
- Fixed `meetingSlotsOwner`, `meetingBookingsSlot`, and `meetingBookingsBooker` relationships

### 2. Missing Permissions

**Problem**: No permission rules were defined for `meetingSlots`, `meetingBookings`, and `links` entities, preventing proper access control.

**Solution**: Added comprehensive permissions in `instant.perms.ts`:

```typescript
meetingSlots: {
  bind: ['isOwner', "auth.id in data.ref('owner.id')"],
  allow: {
    view: 'data.isPublic == true || isOwner || auth.id != null',
    create: 'isOwner',
    delete: 'isOwner',
    update: 'isOwner',
  },
}

meetingBookings: {
  bind: [
    'isBooker', "auth.id in data.ref('booker.id')",
    'isSlotOwner', "auth.id in data.ref('slot.owner.id')",
  ],
  allow: {
    view: 'isBooker || isSlotOwner',
    create: 'isBooker',
    delete: 'isBooker || isSlotOwner',
    update: 'isBooker || isSlotOwner',
  },
}

links: {
  bind: [
    'isGroupOwner', "auth.id in data.ref('group.owner.id')",
    'isUserOwner', "auth.id in data.ref('user.id')",
    'isSlotOwner', "auth.id in data.ref('meetingSlot.owner.id')",
  ],
  allow: {
    view: 'auth.id != null',
    create: 'isGroupOwner || isUserOwner || isSlotOwner',
    delete: 'isGroupOwner || isUserOwner || isSlotOwner',
    update: 'isGroupOwner || isUserOwner || isSlotOwner',
  },
}
```

## New Features Added

### Recurring Meeting Slots

Users can now create recurring meeting slots with the following options:

#### Recurrence Patterns

- **Daily**: Creates slots every day
- **Weekly**: Creates slots on selected weekdays (Mon-Sun)
- **Monthly**: Creates slots on the same day each month

#### Configuration Options

1. **Meeting Type**: One-on-one or Public meeting
2. **Recurrence Pattern**: Daily, Weekly, or Monthly
3. **Weekdays Selection** (for weekly): Choose which days of the week (Mon-Sun)
4. **Number of Slots**: Specify how many recurring slots to create (max 50)
5. **End Date** (optional): Set an end date for the recurring pattern
6. **Slot Duration**: Set the length of each meeting slot in minutes
7. **Start Time**: Set the time for all slots
8. **Title & Description**: Customize the slot information

#### How It Works

1. Click "Add Slot" button
2. Toggle "Create Recurring Slots" switch
3. Select recurrence pattern (Daily/Weekly/Monthly)
4. For weekly pattern, select specific weekdays
5. Set the number of slots to create
6. Optionally set an end date
7. Configure slot details (time, duration, title, description)
8. Click "Create Slots" to generate all recurring slots at once

#### Example Use Cases

- **Weekly Office Hours**: Create 4 slots every Monday and Wednesday for the next month
- **Daily Standup Slots**: Create 20 daily meeting slots for a project
- **Monthly Board Meetings**: Create 12 monthly slots for the year

### UI Improvements

- Enhanced dialog with scrollable content for better UX
- Visual feedback showing number of slots to be created
- Weekday selector buttons for easy day selection
- Clear separation between single and recurring slot creation
- Repeat icon to indicate recurring functionality

## Technical Implementation

### New State Variables

```typescript
const [isRecurring, setIsRecurring] = useState(false);
const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(undefined);
const [numberOfSlots, setNumberOfSlots] = useState('4');
const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
```

### New Functions

- `generateRecurringSlots()`: Generates an array of slot start/end times based on the pattern
- Enhanced `handleCreateSlot()`: Handles both single and recurring slot creation

### Dependencies Added

- `addDays`, `addWeeks`, `addMonths` from `date-fns`
- `Repeat` icon from `lucide-react`
- `Switch` component from UI library

## Testing Checklist

- [x] Schema changes pushed to InstantDB
- [x] Permissions configured and pushed
- [ ] Test creating single meeting slot
- [ ] Test creating daily recurring slots
- [ ] Test creating weekly recurring slots with selected weekdays
- [ ] Test creating monthly recurring slots
- [ ] Test with end date specified
- [ ] Test with maximum number of slots (50)
- [ ] Verify booking functionality still works
- [ ] Verify owner can see and manage all slots
- [ ] Verify non-owner can book available slots
- [ ] Test public vs one-on-one meeting types

## Next Steps

1. Test the recurring meeting functionality thoroughly
2. Consider adding:
   - Ability to edit recurring series
   - Bulk delete recurring slots
   - Recurring exceptions (skip specific dates)
   - Time zone support
   - Calendar export (iCal format)
   - Email notifications for bookings

## Files Modified

1. `instant.schema.ts` - Added links for meetingSlots and links entities
2. `instant.perms.ts` - Added permissions for meetingSlots, meetingBookings, and links
3. `src/features/user/ui/UserMeetingScheduler.tsx` - Added recurring meeting functionality
