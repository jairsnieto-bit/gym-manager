import React from 'react';
import { X } from 'lucide-react';

const InventoryModal = ({ 
  isOpen, 
  onClose, 
  inventoryForm, 
  setInventoryForm, 
  onSave,
  isEditing 
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inventoryForm.name && inventoryForm.category) {
      onSave(inventoryForm);
    } else {
      alert('Por favor, completa los campos obligatorios');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inventoryForm.name}
              onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inventoryForm.category}
              onChange={(e) => setInventoryForm({...inventoryForm, category: e.target.value})}
            >
              <option value="Supplements">Suplementos</option>
              <option value="Accessories">Accesorios</option>
              <option value="Clothing">Ropa</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inventoryForm.stock}
              onChange={(e) => setInventoryForm({...inventoryForm, stock: parseInt(e.target.value)})}
              min="0"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inventoryForm.price}
              onChange={(e) => setInventoryForm({...inventoryForm, price: parseFloat(e.target.value)})}
              min="0"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inventoryForm.min_stock}
              onChange={(e) => setInventoryForm({...inventoryForm, min_stock: parseInt(e.target.value)})}
              min="0"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;