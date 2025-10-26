import React from 'react';
import { X, TrendingUp, TrendingDown, Package } from 'lucide-react';

const InventoryMovementsModal = ({ 
  isOpen, 
  onClose, 
  item, 
  movements 
}) => {
  if (!isOpen) return null;

  const getMovementIcon = (type) => {
    switch (type) {
      case 'entrada':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'salida':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'entrada':
        return 'text-green-800 bg-green-100';
      case 'salida':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-blue-800 bg-blue-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Historial de Movimientos</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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

        {movements.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No hay movimientos registrados para este producto</p>
          </div>
        ) : (
          <div className="space-y-3">
            {movements.map((movement, index) => (
              <div key={movement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {getMovementIcon(movement.movement_type)}
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {movement.movement_type}
                      </div>
                      <div className="text-sm text-gray-600">
                        {movement.reason || 'Sin motivo especificado'}
                      </div>
                      {movement.reference_id && (
                        <div className="text-xs text-gray-500">
                          Referencia: {movement.reference_id}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                      {movement.movement_type === 'salida' ? '-' : '+'}{movement.quantity} {item.unit}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(movement.created_at).toLocaleString()}
                    </div>
                    {movement.created_by && (
                      <div className="text-xs text-gray-400">
                        Por: {movement.created_by}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryMovementsModal;