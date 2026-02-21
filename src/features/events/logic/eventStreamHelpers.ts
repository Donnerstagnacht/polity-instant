/**
 * Pure functions for event stream time calculations.
 */

export function calculateSpeakerTime(
  index: number,
  speakerList: Array<{ time?: number }>,
  startTime: Date,
): Date {
  let accumulatedMinutes = 0;
  for (let i = 0; i < index; i++) {
    accumulatedMinutes += speakerList[i]?.time || 0;
  }
  return new Date(startTime.getTime() + accumulatedMinutes * 60000);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
