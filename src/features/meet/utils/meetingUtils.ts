export function calculateDuration(startTime: string | number, endTime: string | number): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);
  
  if (durationMinutes < 60) {
    return `${durationMinutes} minutes`;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} minutes`;
}

export function getMeetingStatus(
  isAvailable: boolean,
  isPast: boolean
): { label: string; variant: 'default' | 'outline' | 'destructive'; className?: string } {
  if (isPast) {
    return { label: 'Past Meeting', variant: 'outline' };
  }
  
  if (isAvailable) {
    return { label: 'Available', variant: 'default', className: 'bg-green-500' };
  }
  
  return { label: 'Fully Booked', variant: 'destructive' };
}
