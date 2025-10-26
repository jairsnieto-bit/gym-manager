import { supabase } from './supabaseClient';

export const planService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  create: async (planData) => {
    const { data, error } = await supabase
      .from('plans')
      .insert([planData])
      .select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, planData) => {
    const { error } = await supabase
      .from('plans')
      .update(planData)
      .eq('id', id);
    if (error) throw error;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};