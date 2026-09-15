import { supabase } from './supabase';
import { Car } from '../types';
import { CarInput, CarEditInput } from '../lib/validation';

export const carService = {
  // Fetch all active cars (excludes logically-removed 'inactive' cars)
  async getCars(): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .neq('status', 'inactive')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Car[]) ?? [];
  },

  async getCar(id: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Car;
  },

  async addCar(input: CarInput): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .insert({
        make: input.make,
        model: input.model,
        year: input.year,
        plate_number: input.plate_number,
        color: input.color,
        owner_type: input.owner_type,
        partner_id: input.owner_type === 'partner' ? input.partner_id : null,
        status: 'available',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Car;
  },

  async updateCar(id: string, input: CarEditInput): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .update({
        make: input.make,
        model: input.model,
        year: input.year,
        plate_number: input.plate_number,
        color: input.color,
        owner_type: input.owner_type,
        partner_id: input.owner_type === 'partner' ? input.partner_id : null,
        status: input.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Car;
  },

  // Logical remove: mark as inactive instead of deleting,
  // so rental history and expenses tied to the car are preserved.
  async removeCar(id: string): Promise<void> {
    const { error } = await supabase
      .from('cars')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
  },
};
