import React from 'react';
import { Users, AlertTriangle, Package } from 'lucide-react';

const DashboardStats = ({ clients = [], expiringClients = [], expiredClients = [], inventory = [] }) => {
  const totalStock = inventory.reduce((sum, item) => sum + (item?.stock || 0), 0);
  const activeClients = clients.filter(c => new Date(c?.end_date) >= new Date()).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
            <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Planes por Vencer</p>
            <p className="text-2xl font-bold text-gray-900">{expiringClients.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Planes Vencidos</p>
            <p className="text-2xl font-bold text-gray-900">{expiredClients.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <Package className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Productos en Stock</p>
            <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;