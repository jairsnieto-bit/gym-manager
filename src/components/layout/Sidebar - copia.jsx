import React from 'react';
import { Calendar, Users, Dumbbell, Package, CreditCard, Settings, FileText, User, ShoppingCart, Plus } from 'lucide-react';  

const Sidebar = ({ activeTab, setActiveTab, userRole = 'admin' }) => {
  const adminTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Calendar },
  { id: 'plans', label: 'Planes', icon: FileText },
  { id: 'trainers', label: 'Entrenadores', icon: User },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'machines', label: 'Máquinas', icon: Dumbbell },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'inventory-config', label: 'Config. Inventario', icon: Settings },
  { id: 'shop', label: 'Tienda', icon: ShoppingCart },
  { id: 'invoices', label: 'Facturación', icon: CreditCard },
  { id: 'settings', label: 'Configuración', icon: Settings }
]

  const userTabs = [
    { id: 'user-dashboard', label: 'Mi Cuenta', icon: Calendar },
    { id: 'user-plans', label: 'Mis Planes', icon: Users }
  ];

  const tabs = userRole === 'admin' ? adminTabs : userTabs;

  return (
    <div className="lg:w-64 flex-shrink-0">
      <nav className="bg-white rounded-lg shadow-sm p-4">
        <div className="space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;