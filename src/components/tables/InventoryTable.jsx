import React, { useState } from 'react';
import { Edit, Trash2, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';

const InventoryTable = ({ 
  inventory, 
  onEdit, 
  onDelete, 
  searchTerm,
  onAdjustStock,
  onViewMovements
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    status: 'all' // all, low, out
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesLocation = !filters.location || item.location === filters.location;
    
    let matchesStatus = true;
    if (filters.status === 'low') {
      matchesStatus = item.stock <= item.min_stock && item.stock > 0;
    } else if (filters.status === 'out') {
      matchesStatus = item.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  const getStockStatus = (item) => {
    if (item.stock === 0) {
      return { text: 'Agotado', color: 'bg-red-100 text-red-800' };
    } else if (item.stock <= item.min_stock) {
      return { text: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' };
    } else if (item.stock <= item.reorder_point) {
      return { text: 'Reorden', color: 'bg-orange-100 text-orange-800' };
    } else {
      return { text: 'Normal', color: 'bg-green-100 text-green-800' };
    }
  };

  const getStockTrend = (item) => {
    // Simulación de tendencia (en producción usarías datos reales)
    const randomTrend = Math.random();
    if (randomTrend < 0.3) return 'down';
    if (randomTrend < 0.6) return 'up';
    return 'stable';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Filtros */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
        
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
              <select
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">Todas</option>
                {[...new Set(inventory.map(item => item.category))].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación</label>
              <select
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option value="">Todas</option>
                {[...new Set(inventory.map(item => item.location))].map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">Todos</option>
                <option value="low">Stock Bajo</option>
                <option value="out">Agotados</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', location: '', status: 'all' })}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map(item => {
              const status = getStockStatus(item);
              const trend = getStockTrend(item);
              
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-md object-cover mr-3" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.supplier || '-'}</div>
                        {item.barcode && (
                          <div className="text-xs text-gray-400">#{item.barcode.substring(item.barcode.length - 4)}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{item.stock} {item.unit}</span>
                      {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Costo: ${item.cost_price?.toFixed(2) || '0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>${item.price?.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      Margen: {item.cost_price ? (((item.price - item.cost_price) / item.cost_price) * 100).toFixed(1) : '0'}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                    {item.stock <= item.min_stock && item.stock > 0 && (
                      <div className="text-xs text-yellow-600 mt-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Reorden: {item.reorder_point}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onAdjustStock(item)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Ajustar Stock"
                      >
                        <Package className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onViewMovements(item)}
                        className="text-purple-600 hover:text-purple-900 p-1"
                        title="Historial"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;