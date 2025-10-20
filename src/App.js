
import React, { useState, useEffect } from 'react';
import { Users, Dumbbell, ShoppingCart, Calendar, Bell, User, Settings, LogOut, Plus, Edit, Trash2, Search, Filter, Package, CreditCard, AlertTriangle } from 'lucide-react';

// Mock data for demonstration
const mockClients = [
  { id: 1, name: 'Juan Pérez', email: 'juan@email.com', plan: 'Premium', startDate: '2024-01-15', endDate: '2024-04-15', status: 'active', lastPayment: '2024-01-15' },
  { id: 2, name: 'María García', email: 'maria@email.com', plan: 'Basic', startDate: '2024-02-01', endDate: '2024-03-01', status: 'expiring', lastPayment: '2024-02-01' },
  { id: 3, name: 'Carlos Rodríguez', email: 'carlos@email.com', plan: 'Premium', startDate: '2023-12-01', endDate: '2024-03-01', status: 'expired', lastPayment: '2023-12-01' },
];

const mockMachines = [
  { id: 1, name: 'Treadmill Pro', category: 'Cardio', status: 'working', lastMaintenance: '2024-02-10' },
  { id: 2, name: 'Bench Press', category: 'Strength', status: 'maintenance', lastMaintenance: '2024-01-15' },
  { id: 3, name: 'Elliptical Machine', category: 'Cardio', status: 'working', lastMaintenance: '2024-02-20' },
];

const mockInventory = [
  { id: 1, name: 'Protein Powder', category: 'Supplements', stock: 25, price: 45.99, minStock: 10 },
  { id: 2, name: 'Gym Towel', category: 'Accessories', stock: 8, price: 12.50, minStock: 15 },
  { id: 3, name: 'Water Bottle', category: 'Accessories', stock: 42, price: 8.99, minStock: 20 },
];

const mockInvoices = [
  { id: 1, client: 'Juan Pérez', items: ['Premium Plan'], total: 120.00, date: '2024-01-15', status: 'paid' },
  { id: 2, client: 'María García', items: ['Basic Plan'], total: 60.00, date: '2024-02-01', status: 'paid' },
  { id: 3, client: 'Carlos Rodríguez', items: ['Premium Plan'], total: 120.00, date: '2023-12-01', status: 'overdue' },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin'); // 'admin' or 'user'
  const [clients, setClients] = useState(mockClients);
  const [machines, setMachines] = useState(mockMachines);
  const [inventory, setInventory] = useState(mockInventory);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Plan de María García vence en 3 días', type: 'warning' },
    { id: 2, message: 'Stock bajo: Gym Towel (8 unidades)', type: 'error' },
    { id: 3, message: 'Máquina Bench Press necesita mantenimiento', type: 'info' },
  ]);

  // Filter data based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get expiring and expired clients
  const expiringClients = clients.filter(client => client.status === 'expiring');
  const expiredClients = clients.filter(client => client.status === 'expired');

  // Get low stock items
  const lowStockItems = inventory.filter(item => item.stock <= item.minStock);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">GymManager Pro</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 relative"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 mr-3 ${
                              notification.type === 'error' ? 'text-red-500' :
                              notification.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <p className="text-sm text-gray-700">{notification.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Administrador</p>
                  <p className="text-xs text-gray-500">{userRole === 'admin' ? 'Modo Admin' : 'Modo Usuario'}</p>
                </div>
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                {userRole === 'admin' ? (
                  <>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Calendar className="mr-3 h-4 w-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab('clients')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'clients' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Users className="mr-3 h-4 w-4" />
                      Clientes
                    </button>
                    <button
                      onClick={() => setActiveTab('machines')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'machines' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Dumbbell className="mr-3 h-4 w-4" />
                      Máquinas
                    </button>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'inventory' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Package className="mr-3 h-4 w-4" />
                      Inventario
                    </button>
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'invoices' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <CreditCard className="mr-3 h-4 w-4" />
                      Facturación
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Configuración
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('user-dashboard')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'user-dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Calendar className="mr-3 h-4 w-4" />
                      Mi Cuenta
                    </button>
                    <button
                      onClick={() => setActiveTab('user-plans')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'user-plans' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Users className="mr-3 h-4 w-4" />
                      Mis Planes
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                        <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.status === 'active').length}</p>
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
                        <p className="text-2xl font-bold text-gray-900">{inventory.reduce((sum, item) => sum + item.stock, 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map(notification => (
                      <div key={notification.id} className="flex items-start">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 mr-3 ${
                          notification.type === 'error' ? 'text-red-500' :
                          notification.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <p className="text-sm text-gray-700">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.map(client => (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{client.name}</div>
                              <div className="text-sm text-gray-500">{client.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.plan}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.endDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                client.status === 'active' ? 'bg-green-100 text-green-800' :
                                client.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {client.status === 'active' ? 'Activo' :
                                 client.status === 'expiring' ? 'Por vencer' : 'Vencido'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'machines' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Máquinas</h1>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Máquina
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Máquina</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Mantenimiento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMachines.map(machine => (
                          <tr key={machine.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{machine.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                machine.status === 'working' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {machine.status === 'working' ? 'Operativa' : 'Mantenimiento'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.lastMaintenance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Inventario de Tienda</h1>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInventory.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.stock <= item.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {item.stock} unidades
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Factura
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factura</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map(invoice => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">FAC-{invoice.id.toString().padStart(4, '0')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.client}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {invoice.status === 'paid' ? 'Pagado' : 'Vencido'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Gimnasio</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="GymManager Pro" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email de Notificaciones</label>
                      <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="admin@gymmanager.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Días de Anticipación para Recordatorios</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="3" />
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Guardar Configuración
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Module Views */}
            {activeTab === 'user-dashboard' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Juan Pérez</h2>
                      <p className="text-gray-600">juan@email.com</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'user-plans' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Mis Planes</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Plan Premium</h3>
                        <p className="text-gray-600">Válido hasta: 15 de abril de 2024</p>
                        <p className="text-sm text-gray-500 mt-2">Último pago: 15 de enero de 2024</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        Activo
                      </span>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Renovar Plan
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;