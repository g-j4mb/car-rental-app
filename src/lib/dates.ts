import {
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfMonth,
  isToday,
} from 'date-fns';

export type DurationUnit = 'daily' | 'weekly' | 'monthly' | 'yearly';

// DATE columns in Supabase are plain 'yyyy-MM-dd' strings (no timezone).
// These helpers keep the app working in that same string space.
export const todayISO = (): string => format(new Date(), 'yyyy-MM-dd');

// Current clock time as 'HH:mm' — default for rental start/end times.
export const nowHM = (): string => format(new Date(), 'HH:mm');

export const addDaysISO = (iso: string, days: number): string =>
  format(addDays(parseISO(iso), days), 'yyyy-MM-dd');

// Compute an end date from a start date + quantity of the chosen unit.
// e.g. (2026-06-17, 2, 'weekly') -> 2026-07-01. Used to auto-fill the end date.
export const addDurationISO = (startISO: string, qty: number, unit: DurationUnit): string => {
  const start = parseISO(startISO);
  const n = Math.max(1, Math.floor(qty || 1));
  const end =
    unit === 'weekly'
      ? addWeeks(start, n)
      : unit === 'monthly'
        ? addMonths(start, n)
        : unit === 'yearly'
          ? addYears(start, n)
          : addDays(start, n);
  return format(end, 'yyyy-MM-dd');
};

// True when the given timestamp (e.g. rentals.created_at) falls on today's date.
export const isCreatedToday = (timestamp: string): boolean => isToday(parseISO(timestamp));

// First day of the month for a given date — expenses store a `month` column
// (first-of-month) used by the monthly reporting functions.
export const monthStartISO = (iso: string): string =>
  format(startOfMonth(parseISO(iso)), 'yyyy-MM-dd');

export const dateRangesOverlap = (
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean => {
  const s1 = typeof start1 === 'string' ? parseISO(start1) : start1;
  const e1 = typeof end1 === 'string' ? parseISO(end1) : end1;
  const s2 = typeof start2 === 'string' ? parseISO(start2) : start2;
  const e2 = typeof end2 === 'string' ? parseISO(end2) : end2;

  return isBefore(s1, e2) && isAfter(e1, s2);
};

export const isCarAvailable = (
  carBusyPeriods: Array<{ start_date: string; end_date: string }>,
  requestedStart: string | Date,
  requestedEnd: string | Date
): boolean => {
  return !carBusyPeriods.some(period =>
    dateRangesOverlap(period.start_date, period.end_date, requestedStart, requestedEnd)
  );
};
