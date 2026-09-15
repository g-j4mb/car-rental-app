import { supabase } from './supabase';
import { Rental } from '../types';
import { RentalCreateInput, RentalAdjustInput, RentalReturnInput } from '../lib/validation';
import { calculateRentalAmount, calculateSettlement } from '../lib/financial';
import { isCarAvailable, isCreatedToday } from '../lib/dates';

// Rental rows enriched with the related car/customer display names, so list and
// detail screens don't need extra round-trips.
export interface RentalWithRelations extends Rental {
  car_name: string;
  customer_name: string;
}

// Supabase returns the joined rows as nested objects (or arrays). Flatten them
// into the display fields the UI expects.
const mapRental = (row: any): RentalWithRelations => {
  const car = Array.isArray(row.cars) ? row.cars[0] : row.cars;
  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
  return {
    ...row,
    car_name: car ? `${car.make} ${car.model} ${car.plate_number}` : '—',
    customer_name: customer?.full_name ?? '—',
  };
};

const SELECT_WITH_RELATIONS =
  '*, cars ( make, model, plate_number ), customers ( full_name )';

// Combine a date + time into an ISO instant string for overlap comparisons.
const instant = (date: string, time: string) => `${date}T${(time ?? '00:00').slice(0, 5)}`;

// Best-effort sync of cars.status with rentals. Real availability is derived
// from rental overlaps (is_car_available), so a failure here is only cosmetic
// for the fleet view and must not block the rental operation.
const setCarRented = async (carId: string) => {
  await supabase.from('cars').update({ status: 'rented' }).eq('id', carId).neq('status', 'inactive');
};
const setCarAvailable = async (carId: string) => {
  await supabase.from('cars').update({ status: 'available' }).eq('id', carId).eq('status', 'rented');
};

export const rentalService = {
  // Active history: everything except cancelled rentals (those are hidden, like
  // a logical delete). Newest first.
  async getRentals(): Promise<RentalWithRelations[]> {
    const { data, error } = await supabase
      .from('rentals')
      .select(SELECT_WITH_RELATIONS)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapRental);
  },

  async getRental(id: string): Promise<RentalWithRelations | null> {
    const { data, error } = await supabase
      .from('rentals')
      .select(SELECT_WITH_RELATIONS)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapRental(data) : null;
  },

  async addRental(input: RentalCreateInput): Promise<Rental> {
    // Guard against double-booking the same car for overlapping dates.
    const { data: available, error: availErr } = await supabase.rpc('is_car_available', {
      car_uuid: input.car_id,
      start_dt: input.start_date,
      end_dt: input.end_date,
      start_tm: input.start_time,
      end_tm: input.end_time,
    });
    if (availErr) throw availErr;
    if (available === false) {
      throw new Error('CAR_UNAVAILABLE');
    }

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('NOT_AUTHENTICATED');

    // Snapshot the rate and total at creation time (never recalculated later).
    const total_amount = calculateRentalAmount(input.daily_rate, input.start_date, input.end_date);

    const { data, error } = await supabase
      .from('rentals')
      .insert({
        car_id: input.car_id,
        customer_id: input.customer_id,
        created_by: userId,
        start_date: input.start_date,
        end_date: input.end_date,
        start_time: input.start_time,
        end_time: input.end_time,
        rental_type: input.rental_type,
        daily_rate: input.daily_rate,
        total_amount,
        deposit_amount: input.deposit_amount,
        status: 'active',
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    await setCarRented(input.car_id);
    return data as Rental;
  },

  // Extend or shrink an existing rental by moving its end date. The daily_rate
  // snapshot stays fixed; only end_date and the derived total_amount change.
  async adjustRental(id: string, input: RentalAdjustInput): Promise<Rental> {
    const current = await rentalService.getRental(id);
    if (!current) throw new Error('NOT_FOUND');

    if (input.end_date <= current.start_date) {
      throw new Error('END_BEFORE_START');
    }

    // When extending, make sure the new window doesn't collide with another
    // booking on the same car. Exclude this rental from the check. Times are
    // folded into the instants so back-to-back handoffs aren't flagged.
    const { data: others, error: othersErr } = await supabase
      .from('rentals')
      .select('start_date, end_date, start_time, end_time')
      .eq('car_id', current.car_id)
      .in('status', ['reserved', 'active'])
      .neq('id', id);
    if (othersErr) throw othersErr;

    const busyPeriods = (others ?? []).map((o: any) => ({
      start_date: instant(o.start_date, o.start_time),
      end_date: instant(o.end_date, o.end_time),
    }));
    const requestedStart = instant(current.start_date, current.start_time);
    const requestedEnd = instant(input.end_date, current.end_time);
    if (!isCarAvailable(busyPeriods, requestedStart, requestedEnd)) {
      throw new Error('CAR_UNAVAILABLE');
    }

    const total_amount = calculateRentalAmount(
      current.daily_rate,
      current.start_date,
      input.end_date
    );

    const { data, error } = await supabase
      .from('rentals')
      .update({ end_date: input.end_date, total_amount })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Rental;
  },

  // Settle and close a rental. The actual return date is the source of truth:
  // the charge is recalculated (pro-rated), penalty/discount applied, and the
  // deposit + prior payments netted off. total_amount is updated to the settled
  // figure so revenue reports reflect what was actually charged.
  async returnRental(id: string, input: RentalReturnInput): Promise<Rental> {
    const current = await rentalService.getRental(id);
    if (!current) throw new Error('NOT_FOUND');
    if (input.actual_return_date < current.start_date) {
      throw new Error('RETURN_BEFORE_START');
    }

    const { settledTotal } = calculateSettlement({
      dailyRate: current.daily_rate,
      startDate: current.start_date,
      actualReturnDate: input.actual_return_date,
      depositAmount: current.deposit_amount,
      amountPaid: current.amount_paid,
      discount: input.discount_amount,
      penalty: input.penalty_amount,
    });

    const { data, error } = await supabase
      .from('rentals')
      .update({
        status: 'returned',
        actual_return_date: input.actual_return_date,
        discount_amount: input.discount_amount,
        penalty_amount: input.penalty_amount,
        settled_total: settledTotal,
        total_amount: settledTotal,
        amount_paid: settledTotal,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await setCarAvailable(current.car_id); // car is back in the fleet
    return data as Rental;
  },

  // Same-day delete: a rental can only be cancelled on the day it was created
  // (an error-correction affordance). We logically cancel rather than hard
  // delete so cancelled rows are excluded from revenue but auditable in the DB.
  async cancelRental(id: string): Promise<void> {
    const current = await rentalService.getRental(id);
    if (!current) throw new Error('NOT_FOUND');
    if (!isCreatedToday(current.created_at)) {
      throw new Error('NOT_SAME_DAY');
    }

    const { error } = await supabase
      .from('rentals')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
    await setCarAvailable(current.car_id); // free the car again
  },
};
