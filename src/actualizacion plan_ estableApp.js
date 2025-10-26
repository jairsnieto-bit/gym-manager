import React, { useState, useEffect } from 'react';
import { Users, Dumbbell, ShoppingCart, Calendar, Bell, User, Settings, LogOut, Plus, Edit, Trash2, Search, Package, CreditCard, AlertTriangle, Save, X, FileText } from 'lucide-react';
import { supabase } from './supabaseClient';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin');
  const [clients, setClients] = useState([]);
  const [machines, setMachines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]); // Nueva sección para planes
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for modals
  const [showClientModal, setShowClientModal] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false); // Modal para planes

  // Form data states
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'active',
    last_payment: new Date().toISOString().split('T')[0]
  });

  const [machineForm, setMachineForm] = useState({
    name: '',
    category: 'Cardio',
    status: 'working',
    last_maintenance: new Date().toISOString().split('T')[0]
  });

  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'Supplements',
    stock: 0,
    price: 0,
    min_stock: 5
  });

  const [invoiceForm, setInvoiceForm] = useState({
    client_name: '',
    items: [''],
    total: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'paid'
  });

  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    duration_days: 30,
    description: ''
  });

  // Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar planes primero (necesario para los clientes)
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (plansError) throw plansError;
        setPlans(plansData || []);

        // Cargar clientes con relación a planes
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*, plans(name, price)')
          .order('created_at', { ascending: false });
        
        if (clientsError) throw clientsError;
        setClients(clientsData || []);

        // Cargar máquinas
        const { data: machinesData, error: machinesError } = await supabase
          .from('machines')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (machinesError) throw machinesError;
        setMachines(machinesData || []);

        // Cargar inventario
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (inventoryError) throw inventoryError;
        setInventory(inventoryData || []);

        // Cargar facturas
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData || []);

        // Generar notificaciones
        generateNotifications(clientsData || [], inventoryData || [], machinesData || []);
        
      } catch (error) {
        console.error('Error loading ', error);
        alert('Error al cargar los datos. Por favor, verifica tu conexión.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateNotifications = (clientsData, inventoryData, machinesData) => {
    const newNotifications = [];

    // Notificaciones de planes por vencer (3 días)
    const expiringClients = clientsData.filter(client => {
      const endDate = new Date(client.end_date);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0 && client.status !== 'expired';
    });

    expiringClients.forEach(client => {
      newNotifications.push({
        id: `exp-${client.id}`,
        message: `Plan de ${client.name} vence en ${Math.ceil((new Date(client.end_date) - new Date()) / (1000 * 60 * 60 * 24))} días`,
        type: 'warning'
      });
    });

    // Notificaciones de planes vencidos
    const expiredClients = clientsData.filter(client => {
      return new Date(client.end_date) < new Date() && client.status !== 'expired';
    });

    expiredClients.forEach(client => {
      newNotifications.push({
        id: `expd-${client.id}`,
        message: `Plan de ${client.name} ha vencido`,
        type: 'error'
      });
    });

    // Notificaciones de inventario bajo
    const lowStockItems = inventoryData.filter(item => item.stock <= item.min_stock);
    lowStockItems.forEach(item => {
      newNotifications.push({
        id: `stock-${item.id}`,
        message: `Stock bajo: ${item.name} (${item.stock} unidades)`,
        type: 'error'
      });
    });

    // Notificaciones de mantenimiento de máquinas
    const maintenanceMachines = machinesData.filter(machine => machine.status === 'maintenance');
    maintenanceMachines.forEach(machine => {
      newNotifications.push({
        id: `maint-${machine.id}`,
        message: `Máquina ${machine.name} necesita mantenimiento`,
        type: 'info'
      });
    });

    setNotifications(newNotifications);
  };

  // Funciones CRUD para planes
  const addPlan = async (planData) => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .insert([planData])
        .select();
      
      if (error) throw error;
      setPlans([...plans, data[0]]);
      alert('Plan agregado exitosamente');
      setShowPlanModal(false);
      resetPlanForm();
    } catch (error) {
      console.error('Error adding plan:', error);
      alert('Error al agregar plan: ' + error.message);
    }
  };

  const updatePlan = async (id, planData) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update(planData)
        .eq('id', id);
      
      if (error) throw error;
      setPlans(plans.map(plan => plan.id === id ? { ...plan, ...planData } : plan));
      alert('Plan actualizado exitosamente');
      setShowPlanModal(false);
      resetPlanForm();
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Error al actualizar plan: ' + error.message);
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este plan? Los clientes asignados a este plan podrían verse afectados.')) return;
    
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setPlans(plans.filter(plan => plan.id !== id));
      alert('Plan eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error al eliminar plan: ' + error.message);
    }
  };

  // Funciones CRUD para clientes (actualizadas para usar plan_id)
  const addClient = async (clientData) => {
    try {
      // Calcular end_date basado en la duración del plan
      const selectedPlan = plans.find(plan => plan.id === clientData.plan_id);
      if (selectedPlan) {
        const startDate = new Date(clientData.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + selectedPlan.duration_days);
        clientData.end_date = endDate.toISOString().split('T')[0];
      }
      
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select('*, plans(name, price)');
      
      if (error) throw error;
      setClients([...clients, data[0]]);
      alert('Cliente agregado exitosamente');
      setShowClientModal(false);
      resetClientForm();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error al agregar cliente: ' + error.message);
    }
  };

  const updateClient = async (id, clientData) => {
    try {
      // Recalcular end_date si cambia el plan
      if (clientData.plan_id) {
        const selectedPlan = plans.find(plan => plan.id === clientData.plan_id);
        if (selectedPlan) {
          const startDate = clientData.start_date ? new Date(clientData.start_date) : new Date();
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + selectedPlan.duration_days);
          clientData.end_date = endDate.toISOString().split('T')[0];
        }
      }
      
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Recargar clientes para obtener los datos actualizados con planes
      const { data: updatedClients } = await supabase
        .from('clients')
        .select('*, plans(name, price)')
        .order('created_at', { ascending: false });
      setClients(updatedClients || []);
      
      alert('Cliente actualizado exitosamente');
      setShowClientModal(false);
      resetClientForm();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error al actualizar cliente: ' + error.message);
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setClients(clients.filter(client => client.id !== id));
      alert('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar cliente: ' + error.message);
    }
  };

  // Funciones CRUD para máquinas
  const addMachine = async (machineData) => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .insert([machineData])
        .select();
      
      if (error) throw error;
      setMachines([...machines, data[0]]);
      alert('Máquina agregada exitosamente');
      setShowMachineModal(false);
      resetMachineForm();
    } catch (error) {
      console.error('Error adding machine:', error);
      alert('Error al agregar máquina');
    }
  };

  const updateMachine = async (id, machineData) => {
    try {
      const { error } = await supabase
        .from('machines')
        .update(machineData)
        .eq('id', id);
      
      if (error) throw error;
      setMachines(machines.map(machine => machine.id === id ? { ...machine, ...machineData } : machine));
      alert('Máquina actualizada exitosamente');
      setShowMachineModal(false);
      resetMachineForm();
    } catch (error) {
      console.error('Error updating machine:', error);
      alert('Error al actualizar máquina');
    }
  };

  const deleteMachine = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta máquina?')) return;
    
    try {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setMachines(machines.filter(machine => machine.id !== id));
      alert('Máquina eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting machine:', error);
      alert('Error al eliminar máquina');
    }
  };

  // Funciones CRUD para inventario
  const addInventoryItem = async (itemData) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([itemData])
        .select();
      
      if (error) throw error;
      setInventory([...inventory, data[0]]);
      alert('Producto agregado exitosamente');
      setShowInventoryModal(false);
      resetInventoryForm();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      alert('Error al agregar producto');
    }
  };

  const updateInventoryItem = async (id, itemData) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update(itemData)
        .eq('id', id);
      
      if (error) throw error;
      setInventory(inventory.map(item => item.id === id ? { ...item, ...itemData } : item));
      alert('Producto actualizado exitosamente');
      setShowInventoryModal(false);
      resetInventoryForm();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Error al actualizar producto');
    }
  };

  const deleteInventoryItem = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setInventory(inventory.filter(item => item.id !== id));
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Error al eliminar producto');
    }
  };

  // Funciones CRUD para facturas
  const addInvoice = async (invoiceData) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select();
      
      if (error) throw error;
      setInvoices([...invoices, data[0]]);
      alert('Factura agregada exitosamente');
      setShowInvoiceModal(false);
      resetInvoiceForm();
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert('Error al agregar factura');
    }
  };

  const updateInvoice = async (id, invoiceData) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', id);
      
      if (error) throw error;
      setInvoices(invoices.map(invoice => invoice.id === id ? { ...invoice, ...invoiceData } : invoice));
      alert('Factura actualizada exitosamente');
      setShowInvoiceModal(false);
      resetInvoiceForm();
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Error al actualizar factura');
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta factura?')) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      alert('Factura eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error al eliminar factura');
    }
  };

  // Reset forms
  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      plan_id: plans.length > 0 ? plans[0].id : '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      status: 'active',
      last_payment: new Date().toISOString().split('T')[0]
    });
  };

  const resetMachineForm = () => {
    setMachineForm({
      name: '',
      category: 'Cardio',
      status: 'working',
      last_maintenance: new Date().toISOString().split('T')[0]
    });
  };

  const resetInventoryForm = () => {
    setInventoryForm({
      name: '',
      category: 'Supplements',
      stock: 0,
      price: 0,
      min_stock: 5
    });
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      client_name: '',
      items: [''],
      total: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'paid'
    });
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      price: 0,
      duration_days: 30,
      description: ''
    });
  };

  // Filter data based on search term
  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.plans?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMachines = machines.filter(machine =>
    machine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventory = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlans = plans.filter(plan =>
    plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.items?.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const expiringClients = clients.filter(client => {
    const endDate = new Date(client.end_date);
    const today = new Date();
    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const expiredClients = clients.filter(client => new Date(client.end_date) < new Date());
  const lowStockItems = inventory.filter(item => item.stock <= item.min_stock);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos desde Supabase...</p>
        </div>
      </div>
    );
  }

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
                      onClick={() => setActiveTab('plans')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'plans' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FileText className="mr-3 h-4 w-4" />
                      Planes
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                        <p className="text-2xl font-bold text-gray-900">{clients.filter(c => new Date(c.end_date) >= new Date()).length}</p>
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
                        <p className="text-2xl font-bold text-gray-900">{inventory.reduce((sum, item) => sum + (item.stock || 0), 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

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

            {/* NUEVO MÓDULO: Planes */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Planes</h1>
                  <button 
                    onClick={() => {
                      resetPlanForm();
                      setShowPlanModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Plan
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPlans.map(plan => (
                          <tr key={plan.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${plan.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.duration_days} días</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.description || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                onClick={() => {
                                  setPlanForm({
                                    id: plan.id,
                                    name: plan.name,
                                    price: plan.price,
                                    duration_days: plan.duration_days,
                                    description: plan.description
                                  });
                                  setShowPlanModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deletePlan(plan.id)}
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
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
                  <button 
                    onClick={() => {
                      resetClientForm();
                      setShowClientModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.plans?.name || 'Sin plan'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${client.plans?.price || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.end_date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                new Date(client.end_date) >= new Date() ? 'bg-green-100 text-green-800' :
                                new Date(client.end_date) >= new Date(Date.now() - 3*24*60*60*1000) ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {new Date(client.end_date) >= new Date() ? 'Activo' :
                                 new Date(client.end_date) >= new Date(Date.now() - 3*24*60*60*1000) ? 'Por vencer' : 'Vencido'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                onClick={() => {
                                  setClientForm({
                                    id: client.id,
                                    name: client.name,
                                    email: client.email,
                                    plan_id: client.plan_id,
                                    start_date: client.start_date,
                                    end_date: client.end_date,
                                    status: client.status,
                                    last_payment: client.last_payment
                                  });
                                  setShowClientModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteClient(client.id)}
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
              </div>
            )}

            {activeTab === 'machines' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Máquinas</h1>
                  <button 
                    onClick={() => {
                      resetMachineForm();
                      setShowMachineModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.last_maintenance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                onClick={() => {
                                  setMachineForm({
                                    id: machine.id,
                                    name: machine.name,
                                    category: machine.category,
                                    status: machine.status,
                                    last_maintenance: machine.last_maintenance
                                  });
                                  setShowMachineModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteMachine(machine.id)}
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
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Inventario de Tienda</h1>
                  <button 
                    onClick={() => {
                      resetInventoryForm();
                      setShowInventoryModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
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
                                item.stock <= item.min_stock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {item.stock} unidades
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                onClick={() => {
                                  setInventoryForm({
                                    id: item.id,
                                    name: item.name,
                                    category: item.category,
                                    stock: item.stock,
                                    price: item.price,
                                    min_stock: item.min_stock
                                  });
                                  setShowInventoryModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteInventoryItem(item.id)}
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
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
                  <button 
                    onClick={() => {
                      resetInvoiceForm();
                      setShowInvoiceModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
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
                        {filteredInvoices.map(invoice => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">FAC-{invoice.id.toString().substring(0, 4)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.client_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {invoice.status === 'paid' ? 'Pagado' : 'Vencido'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                onClick={() => {
                                  setInvoiceForm({
                                    id: invoice.id,
                                    client_name: invoice.client_name,
                                    items: invoice.items,
                                    total: invoice.total,
                                    date: invoice.date,
                                    status: invoice.status
                                  });
                                  setShowInvoiceModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteInvoice(invoice.id)}
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
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Supabase</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL de Supabase</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        defaultValue={process.env.REACT_APP_SUPABASE_URL}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clave Anónima</label>
                      <input 
                        type="password" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        defaultValue="••••••••••••••••"
                        readOnly
                      />
                    </div>
                    <button 
                      onClick={() => {
                        alert('Los datos de conexión están configurados en el archivo .env');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Ver Configuración
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'user-dashboard' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Usuario Demo</h2>
                      <p className="text-gray-600">usuario@gymmanager.com</p>
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
                        <p className="text-gray-600">Válido hasta: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500 mt-2">Último pago: {new Date().toLocaleDateString()}</p>
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

      {/* Modals */}
      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {planForm.id ? 'Editar Plan' : 'Agregar Plan'}
              </h2>
              <button 
                onClick={() => setShowPlanModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (planForm.name && planForm.price >= 0 && planForm.duration_days > 0) {
                if (planForm.id) {
                  updatePlan(planForm.id, planForm);
                } else {
                  addPlan(planForm);
                }
              } else {
                alert('Por favor, completa todos los campos correctamente');
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({...planForm, price: parseFloat(e.target.value) || 0})}
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (días) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={planForm.duration_days}
                  onChange={(e) => setPlanForm({...planForm, duration_days: parseInt(e.target.value) || 30})}
                  min="1"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
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
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {clientForm.id ? 'Editar Cliente' : 'Agregar Cliente'}
              </h2>
              <button 
                onClick={() => setShowClientModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (clientForm.name && clientForm.email && clientForm.plan_id) {
                if (clientForm.id) {
                  updateClient(clientForm.id, clientForm);
                } else {
                  addClient(clientForm);
                }
              } else {
                alert('Por favor, completa los campos obligatorios');
              }
            }}>
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
                  onChange={(e) => {
                    const selectedPlanId = e.target.value;
                    setClientForm({...clientForm, plan_id: selectedPlanId});
                    // Recalcular fecha de vencimiento
                    const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
                    if (selectedPlan) {
                      const startDate = new Date(clientForm.start_date);
                      const endDate = new Date(startDate);
                      endDate.setDate(startDate.getDate() + selectedPlan.duration_days);
                      setClientForm(prev => ({...prev, end_date: endDate.toISOString().split('T')[0]}));
                    }
                  }}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={clientForm.start_date}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setClientForm({...clientForm, start_date: newStartDate});
                    // Recalcular fecha de vencimiento
                    if (clientForm.plan_id) {
                      const selectedPlan = plans.find(plan => plan.id === clientForm.plan_id);
                      if (selectedPlan) {
                        const startDate = new Date(newStartDate);
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + selectedPlan.duration_days);
                        setClientForm(prev => ({...prev, end_date: endDate.toISOString().split('T')[0]}));
                      }
                    }
                  }}
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
                  onClick={() => setShowClientModal(false)}
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
      )}

      {/* Machine Modal */}
      {showMachineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Agregar Máquina</h2>
              <button 
                onClick={() => setShowMachineModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (machineForm.name && machineForm.category) {
                if (machineForm.id) {
                  updateMachine(machineForm.id, machineForm);
                } else {
                  addMachine(machineForm);
                }
              } else {
                alert('Por favor, completa los campos obligatorios');
              }
            }}>
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
                  onClick={() => setShowMachineModal(false)}
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
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Agregar Producto</h2>
              <button 
                onClick={() => setShowInventoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (inventoryForm.name && inventoryForm.category) {
                if (inventoryForm.id) {
                  updateInventoryItem(inventoryForm.id, inventoryForm);
                } else {
                  addInventoryItem(inventoryForm);
                }
              } else {
                alert('Por favor, completa los campos obligatorios');
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inventoryForm.category}
                  onChange={(e) => setInventoryForm({...inventoryForm, category: e.target.value})}
                >
                  <option value="Supplements">Suplementos</option>
                  <option value="Accessories">Accesorios</option>
                  <option value="Clothing">Ropa</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inventoryForm.stock}
                  onChange={(e) => setInventoryForm({...inventoryForm, stock: parseInt(e.target.value)})}
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inventoryForm.price}
                  onChange={(e) => setInventoryForm({...inventoryForm, price: parseFloat(e.target.value)})}
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inventoryForm.min_stock}
                  onChange={(e) => setInventoryForm({...inventoryForm, min_stock: parseInt(e.target.value)})}
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInventoryModal(false)}
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
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Agregar Factura</h2>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (invoiceForm.client_name && invoiceForm.items.length > 0) {
                if (invoiceForm.id) {
                  updateInvoice(invoiceForm.id, invoiceForm);
                } else {
                  addInvoice(invoiceForm);
                }
              } else {
                alert('Por favor, completa los campos obligatorios');
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceForm.client_name}
                  onChange={(e) => setInvoiceForm({...invoiceForm, client_name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                <div className="space-y-2">
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...invoiceForm.items];
                          newItems[index] = e.target.value;
                          setInvoiceForm({...invoiceForm, items: newItems});
                        }}
                        placeholder="Ej: Premium Plan"
                      />
                      {invoiceForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = invoiceForm.items.filter((_, i) => i !== index);
                            setInvoiceForm({...invoiceForm, items: newItems});
                          }}
                          className="px-2 py-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setInvoiceForm({...invoiceForm, items: [...invoiceForm.items, '']})}
                    className="mt-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Añadir Item
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceForm.total}
                  onChange={(e) => setInvoiceForm({...invoiceForm, total: parseFloat(e.target.value)})}
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceForm.date}
                  onChange={(e) => setInvoiceForm({...invoiceForm, date: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invoiceForm.status}
                  onChange={(e) => setInvoiceForm({...invoiceForm, status: e.target.value})}
                >
                  <option value="paid">Pagado</option>
                  <option value="overdue">Vencido</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
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
      )}
    </div>
  );
};

export default App;