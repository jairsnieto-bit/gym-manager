
import React from 'react';
import { X, Plus } from 'lucide-react';

const InventoryConfigModal = ({ 
  isOpen, 
  onClose, 
  configForm, 
  setConfigForm, 
  onSave,
  isEditing,
  configType // 'category', 'location', 'unit'
}) => {
  if (!isOpen) return null;

  const getConfigLabels = () => {
    switch (configType) {
      case 'category':
        return { title: 'Categoría', name: 'Nombre', description: 'Descripción' };
      case 'location':
        return { title: 'Ubicación', name: 'Nombre', description: 'Descripción' };
      case 'unit':
        return { title: 'Unidad', name: 'Nombre', abbreviation: 'Abreviatura', description: 'Descripción' };
      default:
        return { title: 'Configuración', name: 'Nombre', description: 'Descripción' };
    }
  };

  const labels = getConfigLabels();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (configForm.name) {
      onSave(configForm);
    } else {
      alert(`Por favor, completa el campo ${labels.name}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? `Editar ${labels.title}` : `Nueva ${labels.title}`}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.name} *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={configForm.name}
              onChange={(e) => setConfigForm({...configForm, name: e.target.value})}
              required
            />
          </div>

          {configType === 'unit' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Abreviatura *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={configForm.abbreviation}
                onChange={(e) => setConfigForm({...configForm, abbreviation: e.target.value})}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.description}</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={configForm.description || ''}
              onChange={(e) => setConfigForm({...configForm, description: e.target.value})}
              rows="3"
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

export default InventoryConfigModal;