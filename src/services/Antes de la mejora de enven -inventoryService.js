import { supabase } from './supabaseClient';

export const inventoryService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  create: async (itemData) => {
    const { data, error } = await supabase
      .from('inventory')
      .insert([itemData])
      .select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, itemData) => {
    const { error } = await supabase
      .from('inventory')
      .update(itemData)
      .eq('id', id);
    if (error) throw error;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Método para actualizar stock (usado en ventas)
  updateStock: async (id, newStock) => {
    const { error } = await supabase
      .from('inventory')
      .update({ stock: newStock })
      .eq('id', id);
    if (error) throw error;
  }
};