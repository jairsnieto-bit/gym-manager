import { supabase } from './supabaseClient';

export const invoiceService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  create: async (invoiceData) => {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, invoiceData) => {
    const { error } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', id);
    if (error) throw error;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};