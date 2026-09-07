import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateString?: string | Date | null, formatStr: string = 'MMM dd, yyyy'): string {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, formatStr) : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateString?: string | Date | null): string {
  return formatDate(dateString, 'MMM dd, yyyy hh:mm a');
}

export function getISOWeekString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}
