export const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const endOfWeek = (date: Date) => {
  const d = startOfWeek(date);
  return new Date(d.setDate(d.getDate() + 6));
};

export const startOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const endOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const isSameDay = (date1: Date | string | number, date2: Date) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const isDateInRange = (date: Date | string | number, start: Date, end: Date) => {
  const d = new Date(date);
  return d >= start && d <= end;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatWeekRange = (date: Date) => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

export const formatMonth = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (date: string | number | Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getWeekDays = (selectedDate: Date) => {
  const start = startOfWeek(selectedDate);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }
  return days;
};
