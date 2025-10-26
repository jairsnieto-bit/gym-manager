import { supabase } from './supabaseClient';

export const clientService = {
 getAll: async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*, plans(name, price), trainers(name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
},

  create: async (clientData) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select('*, plans(name, price)');
    if (error) throw error;
    return data[0];
  },

  update: async (id, clientData) => {
    const { error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id);
    if (error) throw error;
    
    const {  updatedData } = await supabase
      .from('clients')
      .select('*, plans(name, price)')
      .eq('id', id);
    return updatedData[0];
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};