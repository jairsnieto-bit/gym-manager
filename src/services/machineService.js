import { supabase } from './supabaseClient';

export const machineService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  create: async (machineData) => {
    const { data, error } = await supabase
      .from('machines')
      .insert([machineData])
      .select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, machineData) => {
    const { error } = await supabase
      .from('machines')
      .update(machineData)
      .eq('id', id);
    if (error) throw error;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('machines')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
