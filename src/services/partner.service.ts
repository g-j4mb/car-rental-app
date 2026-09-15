import { supabase } from './supabase';
import { Partner } from '../types';
import { PartnerInput } from '../lib/validation';

export const partnerService = {
  // Active partners only (excludes logically-deleted ones)
  async getPartners(): Promise<Partner[]> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data as Partner[]) ?? [];
  },

  async getPartner(id: string): Promise<Partner | null> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Partner;
  },

  async addPartner(input: PartnerInput): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .insert({
        name: input.name,
        phone: input.phone,
        commission_rate: input.commission_rate,
        notes: input.notes ?? null,
        login_email: input.login_email || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Partner;
  },

  async updatePartner(id: string, input: PartnerInput): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .update({
        name: input.name,
        phone: input.phone,
        commission_rate: input.commission_rate,
        notes: input.notes ?? null,
        login_email: input.login_email || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Partner;
  },

  // Logical delete: keep the record (and its payment history) but hide it.
  async removePartner(id: string): Promise<void> {
    const { error } = await supabase
      .from('partners')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
