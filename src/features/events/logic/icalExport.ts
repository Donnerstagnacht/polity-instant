import ical, { ICalCalendarMethod, ICalEventRepeatingFreq } from 'ical-generator';

interface ICalEventInput {
  id: string;
  title: string;
  description?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  start_date?: number | null;
  end_date?: number | null;
  is_recurring?: boolean;
  recurrence_rule?: string | null;
  recurrence_pattern?: string | null;
  recurrence_end_date?: number | null;
  creator?: { name?: string; email?: string } | null;
}

/**
 * Generate an iCal (.ics) string from a list of events.
 * Can be used on client (download) or server (API feed).
 */
export function generateICalString(
  events: ICalEventInput[],
  calendarName = 'Polity Calendar',
): string {
  const cal = ical({ name: calendarName, method: ICalCalendarMethod.PUBLISH });

  for (const event of events) {
    if (!event.start_date) continue;

    const icalEvent = cal.createEvent({
      id: event.id,
      start: new Date(event.start_date),
      end: event.end_date ? new Date(event.end_date) : undefined,
      summary: event.title,
      description: event.description ?? undefined,
      location: [event.location_name, event.location_address].filter(Boolean).join(', ') || undefined,
    });

    if (event.creator?.name) {
      icalEvent.organizer({ name: event.creator.name, email: event.creator.email || 'noreply@polity.app' });
    }

    // Add RRULE if recurring
    if (event.is_recurring && event.recurrence_rule) {
      const rruleStr = event.recurrence_rule.startsWith('RRULE:')
        ? event.recurrence_rule.substring(6)
        : event.recurrence_rule;

      // Parse RRULE parts for ical-generator
      const parts = Object.fromEntries(
        rruleStr.split(';').map(p => {
          const [k, v] = p.split('=');
          return [k, v];
        })
      );

      const freqMap: Record<string, ICalEventRepeatingFreq> = {
        DAILY: ICalEventRepeatingFreq.DAILY,
        WEEKLY: ICalEventRepeatingFreq.WEEKLY,
        MONTHLY: ICalEventRepeatingFreq.MONTHLY,
        YEARLY: ICalEventRepeatingFreq.YEARLY,
      };

      if (parts.FREQ && freqMap[parts.FREQ]) {
        icalEvent.repeating({
          freq: freqMap[parts.FREQ],
          interval: parts.INTERVAL ? parseInt(parts.INTERVAL, 10) : undefined,
          until: parts.UNTIL ? new Date(
            parts.UNTIL.replace(/(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?/, '$1-$2-$3T$4:$5:$6')
          ) : (event.recurrence_end_date ? new Date(event.recurrence_end_date) : undefined),
        });
      }
    }
  }

  return cal.toString();
}

/**
 * Trigger a browser download of an iCal file.
 */
export function downloadICalFile(
  events: ICalEventInput[],
  filename = 'polity-calendar.ics',
): void {
  const icsContent = generateICalString(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
