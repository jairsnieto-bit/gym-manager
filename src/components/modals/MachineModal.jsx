import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MachineModal = ({ 
  isOpen, 
  onClose, 
  machineForm, 
  setMachineForm, 
  onSave,
  isEditing 
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (machineForm.name && machineForm.category) {
      onSave(machineForm);
    } else {
      toast.error('Por favor, completa los campos obligatorios');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Máquina' : 'Agregar Máquina'}
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
              value={machineForm.name}
              onChange={(e) => setMachineForm({...machineForm, name: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={machineForm.category}
              onChange={(e) => setMachineForm({...machineForm, category: e.target.value})}
            >
              <option value="Cardio">Cardio</option>
              <option value="Strength">Fuerza</option>
              <option value="Flexibility">Flexibilidad</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={machineForm.status}
              onChange={(e) => setMachineForm({...machineForm, status: e.target.value})}
            >
              <option value="working">Operativa</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Último Mantenimiento</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={machineForm.last_maintenance}
              onChange={(e) => setMachineForm({...machineForm, last_maintenance: e.target.value})}
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

export default MachineModal;