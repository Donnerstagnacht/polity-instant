/**
 * Pure helper functions for recurring event date calculations.
 * Extracted from hooks/useCalendarData.ts
 */

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

export const generateRecurringInstances = (
  event: any,
  rangeStart: Date,
  rangeEnd: Date
): any[] => {
  if (!event.recurrence_pattern || event.recurrence_pattern === 'none') {
    return [event];
  }

  const instances: any[] = [];
  const eventStart = new Date(event.start_date);
  const eventEnd = new Date(event.end_date);
  const duration = eventEnd.getTime() - eventStart.getTime();
  const recurringEndDate = event.recurrence_end_date ? new Date(event.recurrence_end_date) : addYears(rangeEnd, 1);
  const interval = event.recurring_interval || 1;

  let currentStart = new Date(eventStart);
  let instanceIndex = 0;
  const maxInstances = 100; // Safety limit

  while (currentStart <= recurringEndDate && currentStart <= rangeEnd && instanceIndex < maxInstances) {
    const currentEnd = new Date(currentStart.getTime() + duration);
    
    // Only include if within the view range
    if (currentEnd >= rangeStart) {
      instances.push({
        ...event,
        id: instanceIndex === 0 ? event.id : `${event.id}_instance_${instanceIndex}`,
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
        isRecurringInstance: instanceIndex > 0,
        recurringParentId: instanceIndex > 0 ? event.id : undefined,
      });
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
};
