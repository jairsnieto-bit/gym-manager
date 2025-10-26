import { supabase } from './supabaseClient';
import { inventoryService } from './inventoryService';

export const salesInvoiceService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('sales_invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  create: async (invoiceData) => {
    // Primero, actualizar el stock de los productos vendidos
    const items = invoiceData.items;
    for (const item of items) {
      if (item.inventory_id && item.quantity) {
        const currentStock = item.current_stock || 0;
        const newStock = currentStock - item.quantity;
        if (newStock >= 0) {
          await inventoryService.updateStock(item.inventory_id, newStock);
        }
      }
    }

    // Luego, crear la factura de venta
    const { data, error } = await supabase
      .from('sales_invoices')
      .insert([invoiceData])
      .select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, invoiceData) => {
    const { error } = await supabase
      .from('sales_invoices')
      .update(invoiceData)
      .eq('id', id);
    if (error) throw error;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('sales_invoices')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};