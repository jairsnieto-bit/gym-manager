import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const InventoryConfigTable = ({ 
  items, 
  onEdit, 
  onDelete, 
  configType, // 'category', 'location', 'unit'
  searchTerm 
}) => {
  const getConfigLabels = () => {
    switch (configType) {
      case 'category':
        return { name: 'Categoría', description: 'Descripción' };
      case 'location':
        return { name: 'Ubicación', description: 'Descripción' };
      case 'unit':
        return { name: 'Unidad', abbreviation: 'Abreviatura', description: 'Descripción' };
      default:
        return { name: 'Nombre', description: 'Descripción' };
    }
  };

  const labels = getConfigLabels();

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.abbreviation && item.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{labels.name}</th>
              {configType === 'unit' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{labels.abbreviation}</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{labels.description}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                {configType === 'unit' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.abbreviation}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryConfigTable;