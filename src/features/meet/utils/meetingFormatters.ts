export function formatMeetingDate(date: string | number): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatMeetingTime(date: string | number): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatMeetingType(type: string): string {
  return type.replace('-', ' ');
}
