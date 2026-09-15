export const CURRENCY = 'MYR';

export const RENTAL_STATUSES = {
  RESERVED: 'reserved',
  ACTIVE: 'active',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
} as const;

export const CAR_STATUSES = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  PARTNER: 'partner',
} as const;

export const RENTAL_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export const CAR_EXPENSE_CATEGORIES = {
  OIL_CHANGE: 'oil_change',
  REPAIR: 'repair',
  PARKING: 'parking',
  MAINTENANCE: 'maintenance',
  OTHER: 'other',
} as const;

export const GENERAL_EXPENSE_CATEGORIES = {
  SALARY: 'salary',
  RENT: 'rent',
  UTILITIES: 'utilities',
  OTHER: 'other',
} as const;

export const COLORS = {
  PRIMARY: '#1F2937',
  PRIMARY_LIGHT: '#374151',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
  WHITE: '#FFFFFF',
} as const;
