import { supabase } from './supabaseClient';

export const inventoryService = {
  // Obtener todos los productos con filtros
  getAll: async (filters = {}) => {
    let query = supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.location) {
      query = query.eq('location', filters.location);
    }
    if (filters.lowStock) {
      query = query.lte('stock', supabase.from('inventory').select('min_stock'));
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Obtener un producto específico
  getById: async (id) => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Crear nuevo producto
  create: async (itemData) => {
    const { data, error } = await supabase
      .from('inventory')
      .insert([itemData])
      .select();
    if (error) throw error;
    
    // Registrar movimiento de entrada
    if (itemData.stock > 0) {
      await inventoryService.createMovement({
        inventory_id: data[0].id,
        movement_type: 'entrada',
        quantity: itemData.stock,
        reason: 'Producto inicial',
        created_by: 'admin'
      });
    }
    
    return data[0];
  },

  // Actualizar producto
  update: async (id, itemData) => {
    const { error } = await supabase
      .from('inventory')
      .update(itemData)
      .eq('id', id);
    if (error) throw error;
  },

  // Eliminar producto
  delete: async (id) => {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Actualizar stock y registrar movimiento
  updateStock: async (id, newStock, movementData) => {
    // Obtener stock actual
    const currentProduct = await inventoryService.getById(id);
    const stockDifference = newStock - currentProduct.stock;
    
    // Actualizar stock
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ stock: newStock })
      .eq('id', id);
    if (updateError) throw updateError;

    // Registrar movimiento
    if (movementData && stockDifference !== 0) {
      await inventoryService.createMovement({
        inventory_id: id,
        movement_type: stockDifference > 0 ? 'entrada' : 'salida',
        quantity: Math.abs(stockDifference),
        ...movementData
      });
    }
  },

  // Crear movimiento de inventario
  createMovement: async (movementData) => {
    const { error } = await supabase
      .from('inventory_movements')
      .insert([movementData]);
    if (error) throw error;
  },

  // Obtener movimientos de un producto
  getMovementsByInventoryId: async (inventoryId) => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Obtener resumen de inventario
  getInventorySummary: async () => {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('stock, cost_price, price, min_stock');
    
    if (inventoryError) throw inventoryError;

    const totalItems = inventoryData.length;
    const totalStock = inventoryData.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.stock * item.cost_price), 0);
    const lowStockItems = inventoryData.filter(item => item.stock <= item.min_stock).length;
    const outOfStockItems = inventoryData.filter(item => item.stock === 0).length;

    return {
      totalItems,
      totalStock,
      totalValue,
      lowStockItems,
      outOfStockItems
    };
  },

  // Obtener categorías únicas
  getCategories: async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('category')
      .order('category');
    if (error) throw error;
    return [...new Set(data.map(item => item.category))];
  },

  // Obtener ubicaciones únicas
  getLocations: async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('location')
      .order('location');
    if (error) throw error;
    return [...new Set(data.map(item => item.location))];
  },

  // Generar código de barras (simulado)
  generateBarcode: () => {
    return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
  }
};