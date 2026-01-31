import { format, isValid } from 'date-fns';

/**
 * Safe date formatting helper
 * Handles null/undefined values, invalid dates, and formatting errors gracefully
 *
 * @param dateValue - The date value to format (can be string, Date, number, or null/undefined)
 * @param formatStr - The date-fns format string (e.g., 'MMM d, yyyy' or 'h:mm a')
 * @param fallback - The string to return if formatting fails (default: '--')
 * @returns The formatted date string or the fallback value
 */
export function formatDate(dateValue: any, formatStr: string, fallback: string = '--'): string {
  if (!dateValue) return fallback;
  const date = new Date(dateValue);
  if (!isValid(date)) return fallback;
  try {
    return format(date, formatStr);
  } catch {
    return fallback;
  }
}
