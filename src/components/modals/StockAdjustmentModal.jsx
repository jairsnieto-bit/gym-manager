import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const StockAdjustmentModal = ({ 
  isOpen, 
  onClose, 
  item, 
  onSave 
}) => {
  const [adjustment, setAdjustment] = useState({
    quantity: 1,
    type: 'entrada', // entrada, salida, ajuste
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adjustment.quantity > 0 && adjustment.reason.trim()) {
      onSave(item.id, adjustment);
    } else {
      alert('Por favor, completa todos los campos');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ajustar Stock</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
              <span className="font-medium text-gray-700">{item.name.charAt(0)}</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-600">Stock actual: {item.stock} {item.unit}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustment({...adjustment, type: 'entrada'})}
                className={`p-2 rounded-md text-sm font-medium ${
                  adjustment.type === 'entrada' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus className="h-4 w-4 mx-auto mb-1" />
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setAdjustment({...adjustment, type: 'salida'})}
                className={`p-2 rounded-md text-sm font-medium ${
                  adjustment.type === 'salida' 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Minus className="h-4 w-4 mx-auto mb-1" />
                Salida
              </button>
              <button
                type="button"
                onClick={() => setAdjustment({...adjustment, type: 'ajuste'})}
                className={`p-2 rounded-md text-sm font-medium ${
                  adjustment.type === 'ajuste' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg font-bold mx-auto mb-1">=</span>
                Ajuste
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad ({adjustment.type === 'ajuste' ? 'Nuevo stock' : 'Unidades'})
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={adjustment.quantity}
              onChange={(e) => setAdjustment({...adjustment, quantity: parseInt(e.target.value) || 1})}
              min={adjustment.type === 'ajuste' ? 0 : 1}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={adjustment.reason}
              onChange={(e) => setAdjustment({...adjustment, reason: e.target.value})}
              required
            >
              <option value="">Selecciona un motivo</option>
              <option value="Compra">Compra/Recepción</option>
              <option value="Venta">Venta</option>
              <option value="Devolución">Devolución de cliente</option>
              <option value="Daño">Producto dañado</option>
              <option value="Inventario">Ajuste de inventario</option>
              <option value="Robo">Pérdida/Robo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {adjustment.reason === 'Otro' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Detalles del motivo</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe el motivo..."
                onChange={(e) => setAdjustment({...adjustment, reason: e.target.value})}
              />
            </div>
          )}

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
              {adjustment.type === 'ajuste' ? 'Actualizar Stock' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;