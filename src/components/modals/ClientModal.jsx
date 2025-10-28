import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClientModal = ({ 
  isOpen, 
  onClose, 
  clientForm, 
  setClientForm, 
  onSave,
  isEditing,
  plans,
  trainers,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clientForm.name && clientForm.email && clientForm.plan_id) {
      onSave(clientForm);
    } else {
      toast.error('Por favor, completa los campos obligatorios');
    }
  };

  const handlePlanChange = (planId) => {
    const selectedPlan = plans.find(plan => plan.id === planId);
    setClientForm(prev => ({...prev, plan_id: planId}));
    
    if (selectedPlan) {
      const startDate = new Date(clientForm.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + selectedPlan.duration_days);
      setClientForm(prev => ({...prev, end_date: endDate.toISOString().split('T')[0]}));
    }
  };

  const handleStartDateChange = (date) => {
    setClientForm(prev => ({...prev, start_date: date}));
    if (clientForm.plan_id) {
      const selectedPlan = plans.find(plan => plan.id === clientForm.plan_id);
      if (selectedPlan) {
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + selectedPlan.duration_days);
        setClientForm(prevState => ({...prevState, end_date: endDate.toISOString().split('T')[0]}));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Cliente' : 'Agregar Cliente'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={clientForm.name}
              onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={clientForm.email}
              onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={clientForm.plan_id}
              onChange={(e) => handlePlanChange(e.target.value)}
              required
            >
              <option value="">Selecciona un plan</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price} ({plan.duration_days} días)
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrenador</label>
            <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={clientForm.trainer_id || ''}
            onChange={(e) => setClientForm({...clientForm, trainer_id: e.target.value || null})}
            >
            <option value="">Sin entrenador asignado</option>
            {trainers.filter(t => t.status === 'active').map(trainer => (
            <option key={trainer.id} value={trainer.id}>
            {trainer.name} - {trainer.specialization || 'General'}
            </option>
           ))}
          </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={clientForm.start_date}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={clientForm.end_date}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={clientForm.status}
              onChange={(e) => setClientForm({...clientForm, status: e.target.value})}
            >
              <option value="active">Activo</option>
              <option value="expiring">Por vencer</option>
              <option value="expired">Vencido</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Último Pago</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={clientForm.last_payment}
              onChange={(e) => setClientForm({...clientForm, last_payment: e.target.value})}
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

export default ClientModal;