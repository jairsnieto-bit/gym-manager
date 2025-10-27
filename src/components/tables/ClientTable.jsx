import React from 'react';
import { Edit, Trash2, RefreshCw } from 'lucide-react';

const ClientTable = ({ 
  clients = [], 
  plans = [], 
  trainers = [], 
  onEdit, 
  onDelete, 
  onRenew, 
  searchTerm = '' 
}) => {
  // Fallback: asegurar que siempre sean arrays
  const safeClients = Array.isArray(clients) ? clients : [];
  const safePlans = Array.isArray(plans) ? plans : [];
  const safeTrainers = Array.isArray(trainers) ? trainers : [];

  const filteredClients = safeClients.filter(client =>
    client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrenador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map(client => {
              const plan = safePlans.find(p => p?.id === client?.plan_id) || null;
              const trainer = safeTrainers.find(t => t?.id === client?.trainer_id) || null;

              return (
                <tr key={client?.id || Math.random()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client?.name || '—'}</div>
                    <div className="text-sm text-gray-500">{client?.email || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plan?.name || 'Sin plan'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trainer?.name || 'Sin asignar'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${plan?.price ? plan.price.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client?.end_date || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client?.end_date ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        new Date(client.end_date) >= new Date() 
                          ? 'bg-green-100 text-green-800' 
                          : new Date(client.end_date) >= new Date(Date.now() - 3*24*60*60*1000) 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {new Date(client.end_date) >= new Date() 
                          ? 'Activo' 
                          : new Date(client.end_date) >= new Date(Date.now() - 3*24*60*60*1000) 
                            ? 'Por vencer' 
                            : 'Vencido'}
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Sin fecha
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => onEdit && onEdit(client)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      disabled={!onEdit}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDelete && onDelete(client.id)}
                      className="text-red-600 hover:text-red-900 mr-3"
                      disabled={!onDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRenew && onRenew(client)}
                      className="inline-flex items-center px-2 py-1 text-xs text-green-600 hover:bg-green-100 rounded"
                      title="Renovar plan"
                      disabled={!onRenew}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Renovar
                    </button>
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

export default ClientTable;