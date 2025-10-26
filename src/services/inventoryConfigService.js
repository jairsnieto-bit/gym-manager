
import { supabase } from './supabaseClient';

export const inventoryConfigService = {
  // Categorías
  getCategories: async () => {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  createCategory: async (categoryData) => {
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert([categoryData])
      .select();
    if (error) throw error;
    return data[0];
  },

  updateCategory: async (id, categoryData) => {
    const { error } = await supabase
      .from('inventory_categories')
      .update(categoryData)
      .eq('id', id);
    if (error) throw error;
  },

  deleteCategory: async (id) => {
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Ubicaciones
  getLocations: async () => {
    const { data, error } = await supabase
      .from('inventory_locations')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  createLocation: async (locationData) => {
    const { data, error } = await supabase
      .from('inventory_locations')
      .insert([locationData])
      .select();
    if (error) throw error;
    return data[0];
  },

  updateLocation: async (id, locationData) => {
    const { error } = await supabase
      .from('inventory_locations')
      .update(locationData)
      .eq('id', id);
    if (error) throw error;
  },

  deleteLocation: async (id) => {
    const { error } = await supabase
      .from('inventory_locations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Unidades
  getUnits: async () => {
    const { data, error } = await supabase
      .from('inventory_units')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  createUnit: async (unitData) => {
    const { data, error } = await supabase
      .from('inventory_units')
      .insert([unitData])
      .select();
    if (error) throw error;
    return data[0];
  },

  updateUnit: async (id, unitData) => {
    const { error } = await supabase
      .from('inventory_units')
      .update(unitData)
      .eq('id', id);
    if (error) throw error;
  },

  deleteUnit: async (id) => {
    const { error } = await supabase
      .from('inventory_units')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};