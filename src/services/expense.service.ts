import { supabase } from './supabase';
import { CarExpense, GeneralExpense } from '../types';
import { monthStartISO } from '../lib/dates';

// Car expense rows enriched with the car's display name for the list.
export interface CarExpenseWithCar extends CarExpense {
  car_name: string;
}

interface CarExpenseInput {
  car_id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface GeneralExpenseInput {
  category: string;
  amount: number;
  description: string;
  date: string;
}

const mapCarExpense = (row: any): CarExpenseWithCar => {
  const car = Array.isArray(row.cars) ? row.cars[0] : row.cars;
  return {
    ...row,
    car_name: car ? `${car.make} ${car.model} ${car.plate_number}` : '—',
  };
};

export const expenseService = {
  // --- Car expenses (tied to a specific vehicle) ---
  async getCarExpenses(): Promise<CarExpenseWithCar[]> {
    const { data, error } = await supabase
      .from('car_expenses')
      .select('*, cars ( make, model, plate_number )')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapCarExpense);
  },

  async addCarExpense(input: CarExpenseInput): Promise<CarExpense> {
    const { data, error } = await supabase
      .from('car_expenses')
      .insert({
        car_id: input.car_id,
        category: input.category,
        amount: input.amount,
        description: input.description,
        date: input.date,
        month: monthStartISO(input.date),
      })
      .select()
      .single();

    if (error) throw error;
    return data as CarExpense;
  },

  async removeCarExpense(id: string): Promise<void> {
    const { error } = await supabase.from('car_expenses').delete().eq('id', id);
    if (error) throw error;
  },

  // --- General expenses (business-wide, not tied to a car) ---
  async getGeneralExpenses(): Promise<GeneralExpense[]> {
    const { data, error } = await supabase
      .from('general_expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data as GeneralExpense[]) ?? [];
  },

  async addGeneralExpense(input: GeneralExpenseInput): Promise<GeneralExpense> {
    const { data, error } = await supabase
      .from('general_expenses')
      .insert({
        category: input.category,
        amount: input.amount,
        description: input.description,
        date: input.date,
        month: monthStartISO(input.date),
      })
      .select()
      .single();

    if (error) throw error;
    return data as GeneralExpense;
  },

  async removeGeneralExpense(id: string): Promise<void> {
    const { error } = await supabase.from('general_expenses').delete().eq('id', id);
    if (error) throw error;
  },
};
