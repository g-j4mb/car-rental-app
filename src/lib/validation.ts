import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const customerSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  // --- Validation temporarily relaxed: only the name is required for now. ---
  // Re-enable these when ready:
  // phone: z.string().min(7, 'Invalid phone number'),
  // id_number: z.string().min(5, 'Invalid ID number'),
  // license_number: z.string().min(5, 'Invalid license number'),
  phone: z.string().optional(),
  id_number: z.string().optional(),
  license_number: z.string().optional(),
  notes: z.string().optional(),
});

export const partnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Invalid phone number'),
  commission_rate: z.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less'),
  notes: z.string().optional(),
  // Reference to the partner's manually-created Supabase Auth login.
  login_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

const carBaseSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  plate_number: z.string().min(1, 'Plate number is required'),
  color: z.string().min(1, 'Color is required'),
  owner_type: z.enum(['company', 'partner']),
  partner_id: z.string().uuid().nullable().optional(),
});

const requirePartner = (data: { owner_type: string; partner_id?: string | null }) =>
  data.owner_type !== 'partner' || !!data.partner_id;

export const carSchema = carBaseSchema.refine(requirePartner, {
  message: 'Please select a partner',
  path: ['partner_id'],
});

// Edit also allows changing the operational status (but not 'inactive',
// which is reserved for the logical-remove action).
export const carEditSchema = carBaseSchema
  .extend({
    status: z.enum(['available', 'rented', 'maintenance']),
  })
  .refine(requirePartner, { message: 'Please select a partner', path: ['partner_id'] });

// Dates are kept as 'yyyy-MM-dd' strings to match Supabase DATE columns and
// to stay cross-platform (no native date-picker dependency). ISO date strings
// compare correctly with plain string operators.
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD');
const isoTime = z.string().regex(/^\d{2}:\d{2}$/, 'Use format HH:MM');

export const rentalCreateSchema = z
  .object({
    customer_id: z.string().uuid('Please select a customer'),
    car_id: z.string().uuid('Please select a car'),
    start_date: isoDate,
    end_date: isoDate,
    start_time: isoTime,
    end_time: isoTime,
    rental_type: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    // Helper field: how many units (days/weeks/months/years) — drives the
    // auto-calculated end date. Not stored; end_date is the source of truth.
    duration_qty: z.coerce.number().min(1, 'Must be at least 1'),
    // Coerced so the form can hold raw text input (keeps decimals typeable).
    daily_rate: z.coerce.number().min(1, 'Rate must be greater than 0'),
    deposit_amount: z.coerce.number().min(0, 'Deposit must be positive'),
    notes: z.string().optional(),
  })
  // Compare full start/end instants so same-day rentals (different times) are
  // valid and back-to-back handoffs aren't blocked.
  .refine((data) => `${data.end_date}T${data.end_time}` > `${data.start_date}T${data.start_time}`, {
    message: 'End must be after start',
    path: ['end_date'],
  });

// Adjusting a rental only changes the end date (extend = later, shrink = earlier).
// The daily_rate snapshot is never touched; the new total is recomputed from it.
export const rentalAdjustSchema = z.object({
  end_date: isoDate,
});

// Settlement on return/delivery. actual_return_date is the source of truth for
// the recalculated charge; staff may apply a discount and/or a penalty.
export const rentalReturnSchema = z.object({
  actual_return_date: isoDate,
  discount_amount: z.coerce.number().min(0, 'Discount must be positive'),
  penalty_amount: z.coerce.number().min(0, 'Penalty must be positive'),
});

export const carExpenseSchema = z.object({
  car_id: z.string().uuid('Invalid car'),
  month: z.string().date(),
  category: z.enum(['oil_change', 'repair', 'parking', 'maintenance', 'other']),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().date(),
});

export const generalExpenseSchema = z.object({
  month: z.string().date(),
  category: z.enum(['salary', 'rent', 'utilities', 'other']),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().date(),
});

// Categories valid for each expense kind (must match the DB CHECK constraints).
export const CAR_EXPENSE_CATEGORIES = [
  'oil_change',
  'repair',
  'parking',
  'maintenance',
  'other',
] as const;
export const GENERAL_EXPENSE_CATEGORIES = ['salary', 'rent', 'utilities', 'other'] as const;

// Single form covering both kinds. A car expense requires a car; the category
// is validated against the type-specific list in the UI.
export const expenseFormSchema = z
  .object({
    expense_type: z.enum(['car', 'general']),
    car_id: z.string().uuid('Please select a car').nullable().optional(),
    category: z.string().min(1, 'Please choose a category'),
    amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required'),
    date: isoDate,
  })
  .refine((d) => d.expense_type !== 'car' || !!d.car_id, {
    message: 'Please select a car',
    path: ['car_id'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type PartnerInput = z.infer<typeof partnerSchema>;
export type CarInput = z.infer<typeof carSchema>;
export type CarEditInput = z.infer<typeof carEditSchema>;
export type RentalCreateInput = z.infer<typeof rentalCreateSchema>;
// Pre-coercion shape used for the form fields (money fields accept raw text);
// rentalCreateSchema transforms it into RentalCreateInput on submit.
export type RentalCreateFormInput = z.input<typeof rentalCreateSchema>;
export type RentalAdjustInput = z.infer<typeof rentalAdjustSchema>;
export type RentalReturnInput = z.infer<typeof rentalReturnSchema>;
export type RentalReturnFormInput = z.input<typeof rentalReturnSchema>;
export type CarExpenseInput = z.infer<typeof carExpenseSchema>;
export type GeneralExpenseInput = z.infer<typeof generalExpenseSchema>;
export type ExpenseFormInput = z.infer<typeof expenseFormSchema>;
export type ExpenseFormValues = z.input<typeof expenseFormSchema>;
