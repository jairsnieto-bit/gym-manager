/*import { supabase } from './supabaseClient';
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
};*/
// src/services/salesInvoiceService.js
// src/services/salesInvoiceService.js
import { supabase } from './supabaseClient';

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
    // 1. Crear la factura de venta
    const { data: invoice, error: invoiceError } = await supabase
      .from('sales_invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // 2. Actualizar stock y registrar movimientos
    for (const item of invoiceData.items) {
      if (!item.id || !item.quantity) continue;

      // Obtener stock actual
      const {  currentData, error: fetchError } = await supabase
        .from('inventory')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (fetchError) {
        console.warn('Producto no encontrado:', item.id);
        continue;
      }

      const newStock = (currentData?.stock || 0) - item.quantity;
      if (newStock < 0) {
        throw new Error(`Stock insuficiente para: ${item.name}`);
      }

      // Actualizar stock
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ stock: newStock })
        .eq('id', item.id);

      if (updateError) {
        console.warn('Error al actualizar stock:', item.id);
      }

      // 3. Registrar movimiento de salida
      await supabase.from('inventory_movements').insert({
        inventory_id: item.id,
        movement_type: 'salida',
        quantity: item.quantity,
        reason: 'Venta en POS',
        reference_id: invoice.id, // Enlaza con la factura
        created_by: 'admin'
      });
    }

    return invoice;
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