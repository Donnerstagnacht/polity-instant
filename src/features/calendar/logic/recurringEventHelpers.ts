/**
 * Pure helper functions for recurring event date calculations.
 * Uses rrule.js for RFC 5545 RRULE parsing when available,
 * falls back to simple pattern expansion for legacy events.
 */

import { RRule } from 'rrule'

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

interface EventException {
  original_date: number | Date
  action: string
  new_title?: string | null
  new_description?: string | null
  new_start_date?: number | Date | null
  new_end_date?: number | Date | null
  new_location_name?: string | null
  new_location_address?: string | null
}

/** Normalize a date value into epoch ms for comparison (strips time to date-only). */
function toDateKey(val: number | Date | string): string {
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface RecurringEvent {
  id: string;
  title?: string | null;
  description?: string | null;
  start_date: number | null;
  end_date: number | null;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_rule?: string | null;
  recurrence_interval?: number | null;
  recurrence_end_date?: number | null;
  location_name?: string | null;
  location_address?: string | null;
  is_public?: boolean;
  image_url?: string | null;
  [key: string]: unknown;
}

type RecurringEventInstance = RecurringEvent & {
  isRecurringInstance?: boolean;
  recurringParentId?: string;
  instanceDate?: string;
}

export const generateRecurringInstances = (
  event: RecurringEvent,
  rangeStart: Date,
  rangeEnd: Date,
  exceptions?: ReadonlyArray<EventException>,
): RecurringEventInstance[] => {
  const isNotRecurring =
    (!event.recurrence_rule && (!event.recurrence_pattern || event.recurrence_pattern === 'none')) ||
    !event.is_recurring

  if (isNotRecurring) {
    return [event];
  }

  if (!event.start_date || !event.end_date) {
    return [event];
  }

  // Build exception lookup maps
  const cancelledDates = new Set<string>()
  const modifiedDates = new Map<string, EventException>()
  if (exceptions) {
    for (const ex of exceptions) {
      const key = toDateKey(ex.original_date)
      if (ex.action === 'cancelled') {
        cancelledDates.add(key)
      } else if (ex.action === 'modified') {
        modifiedDates.set(key, ex)
      }
    }
  }

  const eventStart = new Date(event.start_date)
  const eventEnd = new Date(event.end_date)
  const duration = eventEnd.getTime() - eventStart.getTime()

  // Try RRULE-based expansion first
  if (event.recurrence_rule) {
    return expandWithRRule(event, eventStart, duration, rangeStart, rangeEnd, cancelledDates, modifiedDates)
  }

  // Fallback: legacy pattern-based expansion
  return expandWithPattern(event, eventStart, duration, rangeStart, rangeEnd, cancelledDates, modifiedDates)
}

function expandWithRRule(
  event: RecurringEvent,
  eventStart: Date,
  duration: number,
  rangeStart: Date,
  rangeEnd: Date,
  cancelledDates: Set<string>,
  modifiedDates: Map<string, EventException>,
): RecurringEventInstance[] {
  const rawRule = event.recurrence_rule ?? ''
  const rruleStr = rawRule.startsWith('RRULE:')
    ? rawRule
    : `RRULE:${rawRule}`

  const rule = RRule.fromString(rruleStr)
  // Override dtstart to match the event's actual start
  const ruleWithStart = new RRule({
    ...rule.origOptions,
    dtstart: eventStart,
  })

  const occurrences = ruleWithStart.between(rangeStart, rangeEnd, true)
  const instances: RecurringEventInstance[] = []
  const MAX_INSTANCES = 365

  for (let i = 0; i < occurrences.length && instances.length < MAX_INSTANCES; i++) {
    const occStart = occurrences[i]
    const dateKey = toDateKey(occStart)

    // Skip cancelled occurrences
    if (cancelledDates.has(dateKey)) continue

    const occEnd = new Date(occStart.getTime() + duration)
    const isFirst = occStart.getTime() === eventStart.getTime()
    const modification = modifiedDates.get(dateKey)

    instances.push({
      ...event,
      id: isFirst ? event.id : `${event.id}_rrule_${i}`,
      start_date: modification?.new_start_date ? new Date(modification.new_start_date).getTime() : occStart.getTime(),
      end_date: modification?.new_end_date ? new Date(modification.new_end_date).getTime() : occEnd.getTime(),
      title: modification?.new_title ?? event.title,
      description: modification?.new_description ?? event.description,
      location_name: modification?.new_location_name ?? event.location_name,
      location_address: modification?.new_location_address ?? event.location_address,
      isRecurringInstance: !isFirst,
      recurringParentId: !isFirst ? event.id : undefined,
      instanceDate: dateKey,
    })
  }

  return instances
}

function expandWithPattern(
  event: RecurringEvent,
  eventStart: Date,
  duration: number,
  rangeStart: Date,
  rangeEnd: Date,
  cancelledDates: Set<string>,
  modifiedDates: Map<string, EventException>,
): RecurringEventInstance[] {
  const instances: RecurringEventInstance[] = []
  const recurringEndDate = event.recurrence_end_date
    ? new Date(event.recurrence_end_date)
    : addYears(rangeEnd, 1)
  const interval = event.recurrence_interval || 1
  const maxInstances = 365

  let currentStart = new Date(eventStart)
  let instanceIndex = 0

  while (currentStart <= recurringEndDate && currentStart <= rangeEnd && instanceIndex < maxInstances) {
    const currentEnd = new Date(currentStart.getTime() + duration)
    const dateKey = toDateKey(currentStart)

    if (currentEnd >= rangeStart && !cancelledDates.has(dateKey)) {
      const modification = modifiedDates.get(dateKey)
      instances.push({
        ...event,
        id: instanceIndex === 0 ? event.id : `${event.id}_instance_${instanceIndex}`,
        start_date: modification?.new_start_date ? new Date(modification.new_start_date).getTime() : currentStart.getTime(),
        end_date: modification?.new_end_date ? new Date(modification.new_end_date).getTime() : currentEnd.getTime(),
        title: modification?.new_title ?? event.title,
        description: modification?.new_description ?? event.description,
        location_name: modification?.new_location_name ?? event.location_name,
        location_address: modification?.new_location_address ?? event.location_address,
        isRecurringInstance: instanceIndex > 0,
        recurringParentId: instanceIndex > 0 ? event.id : undefined,
        instanceDate: dateKey,
      })
    }

    // Advance to next occurrence
    switch (event.recurrence_pattern) {
      case 'daily':
        currentStart = addDays(currentStart, interval);
        break;
      case 'weekly':
        currentStart = addDays(currentStart, 7 * interval);
        break;
      case 'monthly':
        currentStart = addMonths(currentStart, interval);
        break;
      case 'yearly':
        currentStart = addYears(currentStart, interval);
        break;
      case 'four-yearly':
        currentStart = addYears(currentStart, 4 * interval);
        break;
      default:
        currentStart = addDays(currentStart, 1);
    }
    instanceIndex++;
  }

  return instances;
}
