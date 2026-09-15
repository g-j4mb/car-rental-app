import { format, parseISO, differenceInDays, addMonths } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  // Round to cents, then format with thousands separators and 2 decimals
  const value = (Math.round(amount * 100) / 100).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `MYR ${value}`;
};

export const formatDate = (date: string | Date, formatStr: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateRange = (start: string | Date, end: string | Date): string => {
  const startStr = formatDate(start, 'dd MMM yyyy');
  const endStr = formatDate(end, 'dd MMM yyyy');
  return `${startStr} – ${endStr}`;
};

export const getDayCount = (start: string | Date, end: string | Date): number => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return differenceInDays(endDate, startDate);
};

export const getMonthKey = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
};

export const getMonthDisplay = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  return format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMMM yyyy');
};

// Move a 'YYYY-MM' key by a number of months (e.g. for prev/next navigation).
export const shiftMonthKey = (monthKey: string, delta: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  return format(addMonths(new Date(year, month - 1, 1), delta), 'yyyy-MM');
};
