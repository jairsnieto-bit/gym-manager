import { supabase } from './supabaseClient';

export const trainerService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  create: async (trainerData) => {
    const { data, error } = await supabase
      .from('trainers')
      .insert([trainerData])
      .select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, trainerData) => {
    const { error } = await supabase
      .from('trainers')
      .update(trainerData)
      .eq('id', id);
    if (error) throw error;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('trainers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};