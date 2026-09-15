import { supabase } from './supabase';
import { Customer } from '../types';
import { CustomerInput } from '../lib/validation';

export const customerService = {
  // Active customers only (excludes logically-deleted ones)
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return (data as Customer[]) ?? [];
  },

  // Server-side paginated + searchable fetch for the customers list, which
  // grows daily. Returns one page and the next page index (null when the last
  // page is reached). Search matches name or phone (case-insensitive).
  async getCustomersPage(params: {
    search: string;
    page: number;
    pageSize: number;
  }): Promise<{ rows: Customer[]; nextPage: number | null }> {
    const { search, page, pageSize } = params;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
      .range(from, to);

    // Strip characters that would break the PostgREST or() filter syntax.
    const term = search.trim().replace(/[,()%*]/g, '');
    if (term) {
      query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data as Customer[]) ?? [];
    const nextPage = rows.length === pageSize ? page + 1 : null;
    return { rows, nextPage };
  },

  async getCustomer(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async addCustomer(input: CustomerInput): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        full_name: input.full_name,
        // phone is NOT NULL in the DB; the others are UNIQUE, so blanks must be
        // stored as NULL (not '') to avoid unique-constraint collisions.
        phone: input.phone ?? '',
        id_number: input.id_number || null,
        license_number: input.license_number || null,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({
        full_name: input.full_name,
        phone: input.phone ?? '',
        id_number: input.id_number || null,
        license_number: input.license_number || null,
        notes: input.notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  // Logical delete: keep the record (and its rental history) but hide it.
  async removeCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
