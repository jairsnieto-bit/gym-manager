import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardStats from './components/layout/DashboardStats';
import PlanTable from './components/tables/PlanTable';
import ClientTable from './components/tables/ClientTable';
import TrainerTable from './components/tables/TrainerTable';
import MachineTable from './components/tables/MachineTable';
import InventoryTable from './components/tables/InventoryTable';
import SalesInvoiceTable from './components/tables/SalesInvoiceTable';
import PlanModal from './components/modals/PlanModal';
import ClientModal from './components/modals/ClientModal';
import TrainerModal from './components/modals/TrainerModal';
import MachineModal from './components/modals/MachineModal';
import InventoryModal from './components/modals/InventoryModal';
import SalesInvoiceModal from './components/modals/SalesInvoiceModal';
import StockAdjustmentModal from './components/modals/StockAdjustmentModal';
import InventoryMovementsModal from './components/modals/InventoryMovementsModal';
import InventoryConfigModal from './components/modals/InventoryConfigModal';
import InventoryConfigTable from './components/tables/InventoryConfigTable';
import PlanInvoiceTable from './components/tables/PlanInvoiceTable';
import { billingService } from './services/billingService';
import { useData } from './hooks/useData';
import { generateNotifications } from './utils/notifications';
import { planService } from './services/planService';
import { clientService } from './services/clientService';
import { trainerService } from './services/trainerService';
import { machineService } from './services/machineService';
import { inventoryService } from './services/inventoryService';
import { salesInvoiceService } from './services/salesInvoiceService';
import { inventoryConfigService } from './services/inventoryConfigService';
import { toast } from 'react-hot-toast';
import { 
  Users, Dumbbell, ShoppingCart, Calendar, Bell, User, Settings, 
  LogOut, Plus, Edit, Trash2, Search, Package, CreditCard, 
  AlertTriangle, Save, X, FileText, Camera, Minus, TrendingUp, 
  TrendingDown 
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Plan modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    duration_days: 30,
    description: ''
  });

  // Client modal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    plan_id: '',
    trainer_id: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'active',
    last_payment: new Date().toISOString().split('T')[0]
  });

  // Trainer modal states
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainerForm, setTrainerForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    status: 'active'
  });

  // Machine modal states
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [machineForm, setMachineForm] = useState({
    name: '',
    category: 'Cardio',
    status: 'working',
    last_maintenance: new Date().toISOString().split('T')[0]
  });

  // Inventory modal states
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'Supplements',
    stock: 0,
    price: 0,
    min_stock: 5,
    supplier: '',
    barcode: '',
    cost_price: 0,
    reorder_point: 0,
    location: 'General',
    unit: 'Unidad',
    description: ''
  });

  // Sales Invoice modal states
  const [showSalesInvoiceModal, setShowSalesInvoiceModal] = useState(false);
  const [salesInvoiceForm, setSalesInvoiceForm] = useState({
    client_name: '',
    items: [],
    total: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'paid'
  });

  // Estados adicionales para inventario
  const [showStockAdjustmentModal, setShowStockAdjustmentModal] = useState(false);
  const [showInventoryMovementsModal, setShowInventoryMovementsModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [inventoryMovements, setInventoryMovements] = useState([]);

  // Estados para configuración de inventario
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    name: '',
    abbreviation: '',
    description: ''
  });
  const [configType, setConfigType] = useState('category'); // 'category', 'location', 'unit'
  // En App.jsx, después de los otros estados  estado separado para las sub-pestañas
  const [configSubTab, setConfigSubTab] = useState('categories');

  const { clients, plans, trainers, machines, inventory, salesInvoices, categories, locations, units, loading, error, refetch } = useData();

    // Estado para facturas de planes
const [planInvoices, setPlanInvoices] = useState([]);

// Función para generar facturas desde clientes
const generatePlanInvoices = useCallback(() => {
  const generated = clients
    .filter(client => client.plan_id)
    .map(client => {
      const plan = plans.find(p => p.id === client.plan_id);
      return {
        id: `inv-${client.id}`,
        client_id: client.id,
        client_name: client.name,
        plan_id: plan?.id || null,
        plan_name: plan?.name || 'Plan desconocido',
        amount: plan?.price || 0,
        period_start: client.start_date,
        period_end: client.end_date,
        status: new Date(client.end_date) >= new Date() ? 'active' : 'expired',
        last_payment: client.last_payment,
        created_at: new Date().toISOString().split('T')[0],
        notes: `Factura generada automáticamente para el plan ${plan?.name || 'desconocido'}`
      };
    });
  setPlanInvoices(generated);
}, [clients, plans]);


  // Generate notifications
  const notifications = useMemo(() => {
    return generateNotifications(clients, inventory, machines);
  }, [clients, inventory, machines]);

  useEffect(() => {
  generatePlanInvoices();
}, [clients, plans, generatePlanInvoices]);

  // Plan handlers
  const handleAddPlan = async (planData) => {
    try {
      await planService.create(planData);
      toast.success('Plan agregado exitosamente');
      setShowPlanModal(false);
      setPlanForm({ name: '', price: 0, duration_days: 30, description: '' });
      refetch();
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.success('Error al agregar plan: ' + error.message);
    }
  };

  const handleEditPlan = (plan) => {
    setPlanForm(plan);
    setShowPlanModal(true);
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este plan?')) return;
    
    try {
      await planService.delete(id);
      toast.success('Plan eliminado exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.success('Error al eliminar plan: ' + error.message);
    }
  };

  // Client handlers
  const handleAddClient = async (clientData) => {
    try {
      // Calcular end_date basado en la duración del plan
      const selectedPlan = plans.find(plan => plan.id === clientData.plan_id);
      if (selectedPlan) {
        const startDate = new Date(clientData.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + selectedPlan.duration_days);
        clientData.end_date = endDate.toISOString().split('T')[0];
      }

      await clientService.create(clientData);
      toast.success('Cliente agregado exitosamente');
      setShowClientModal(false);
      setClientForm({
        name: '',
        email: '',
        plan_id: '',
        trainer_id: null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'active',
        last_payment: new Date().toISOString().split('T')[0]
      });
      refetch();
    } catch (error) {
      console.error('Error adding client:', error);
      toast.success('Error al agregar cliente: ' + error.message);
    }
  };

  const handleEditClient = (client) => {
    setClientForm({
      id: client.id,
      name: client.name,
      email: client.email,
      plan_id: client.plan_id,
      trainer_id: client.trainer_id,
      start_date: client.start_date,
      end_date: client.end_date,
      status: client.status,
      last_payment: client.last_payment
    });
    setShowClientModal(true);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await clientService.delete(id);
      toast.success('Cliente eliminado exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.success('Error al eliminar cliente: ' + error.message);
    }
  };

  // Trainer handlers
  const handleAddTrainer = async (trainerData) => {
    try {
      await trainerService.create(trainerData);
      toast.success('Entrenador agregado exitosamente');
      setShowTrainerModal(false);
      setTrainerForm({ name: '', email: '', phone: '', specialization: '', status: 'active' });
      refetch();
    } catch (error) {
      console.error('Error adding trainer:', error);
      toast.success('Error al agregar entrenador: ' + error.message);
    }
  };

  const handleEditTrainer = (trainer) => {
    setTrainerForm(trainer);
    setShowTrainerModal(true);
  };

  const handleDeleteTrainer = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este entrenador?')) return;
    
    try {
      await trainerService.delete(id);
      toast.success('Entrenador eliminado exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting trainer:', error);
      toast.success('Error al eliminar entrenador: ' + error.message);
    }
  };

  // Machine handlers
  const handleAddMachine = async (machineData) => {
    try {
      await machineService.create(machineData);
      toast.success('Máquina agregada exitosamente');
      setShowMachineModal(false);
      setMachineForm({
        name: '',
        category: 'Cardio',
        status: 'working',
        last_maintenance: new Date().toISOString().split('T')[0]
      });
      refetch();
    } catch (error) {
      console.error('Error adding machine:', error);
      toast.success('Error al agregar máquina: ' + error.message);
    }
  };

  const handleEditMachine = (machine) => {
    setMachineForm({
      id: machine.id,
      name: machine.name,
      category: machine.category,
      status: machine.status,
      last_maintenance: machine.last_maintenance
    });
    setShowMachineModal(true);
  };

  const handleDeleteMachine = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta máquina?')) return;
    
    try {
      await machineService.delete(id);
      toast.success('Máquina eliminada exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting machine:', error);
      toast.success('Error al eliminar máquina: ' + error.message);
    }
  };

  // Inventory handlers
  const handleAddInventory = async (inventoryData) => {
    try {
      await inventoryService.create(inventoryData);
      toast.success('Producto agregado exitosamente');
      setShowInventoryModal(false);
      setInventoryForm({
        name: '',
        category: 'Supplements',
        stock: 0,
        price: 0,
        min_stock: 5,
        supplier: '',
        barcode: '',
        cost_price: 0,
        reorder_point: 0,
        location: 'General',
        unit: 'Unidad',
        description: ''
      });
      refetch();
    } catch (error) {
      console.error('Error adding inventory:', error);
      toast.success('Error al agregar producto: ' + error.message);
    }
  };

  const handleEditInventory = (item) => {
    setInventoryForm({
      id: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock,
      price: item.price,
      min_stock: item.min_stock,
      supplier: item.supplier || '',
      barcode: item.barcode || '',
      cost_price: item.cost_price || 0,
      reorder_point: item.reorder_point || 0,
      location: item.location || 'General',
      unit: item.unit || 'Unidad',
      description: item.description || ''
    });
    setShowInventoryModal(true);
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await inventoryService.delete(id);
      toast.success('Producto eliminado exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast.success('Error al eliminar producto: ' + error.message);
    }
  };

  // Handlers para inventario
  const handleAdjustStock = async (item) => {
    setSelectedInventoryItem(item);
    setShowStockAdjustmentModal(true);
  };

  const handleSaveStockAdjustment = async (itemId, adjustmentData) => {
    try {
      let newStock;
      if (adjustmentData.type === 'ajuste') {
        newStock = adjustmentData.quantity;
      } else {
        const currentProduct = await inventoryService.getById(itemId);
        newStock = adjustmentData.type === 'entrada' 
          ? currentProduct.stock + adjustmentData.quantity 
          : currentProduct.stock - adjustmentData.quantity;
      }

      await inventoryService.updateStock(itemId, newStock, {
        movement_type: adjustmentData.type,
        quantity: adjustmentData.type === 'ajuste' 
          ? Math.abs(newStock - (await inventoryService.getById(itemId)).stock)
          : adjustmentData.quantity,
        reason: adjustmentData.reason,
        created_by: 'admin'
      });

      toast.success('Stock actualizado exitosamente');
      setShowStockAdjustmentModal(false);
      refetch();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.success('Error al ajustar el stock: ' + error.message);
    }
  };

  const handleViewMovements = async (item) => {
    try {
      const movements = await inventoryService.getMovementsByInventoryId(item.id);
      setSelectedInventoryItem(item);
      setInventoryMovements(movements);
      setShowInventoryMovementsModal(true);
    } catch (error) {
      console.error('Error loading movements:', error);
      toast.success('Error al cargar el historial: ' + error.message);
    }
  };

  // Sales Invoice handlers
  const handleAddSalesInvoice = async (invoiceData) => {
    try {
      await salesInvoiceService.create(invoiceData);
      toast.success('Factura de venta creada exitosamente');
      setShowSalesInvoiceModal(false);
      setSalesInvoiceForm({
        client_name: '',
        items: [],
        total: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'paid'
      });
      refetch();
    } catch (error) {
      console.error('Error adding sales invoice:', error);
      toast.success('Error al crear factura de venta: ' + error.message);
    }
  };

  const handleEditSalesInvoice = (invoice) => {
    setSalesInvoiceForm({
      id: invoice.id,
      client_name: invoice.client_name,
      items: invoice.items,
      total: invoice.total,
      date: invoice.date,
      status: invoice.status
    });
    setShowSalesInvoiceModal(true);
  };

  const handleDeleteSalesInvoice = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta factura?')) return;
    
    try {
      await salesInvoiceService.delete(id);
      toast.success('Factura eliminada exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting sales invoice:', error);
      toast.success('Error al eliminar factura: ' + error.message);
    }
  };

  // Handlers para configuración de inventario
  const handleAddConfig = (type) => {
    setConfigType(type);
    setConfigForm({ name: '', abbreviation: '', description: '' });
    setShowConfigModal(true);
  };

  const handleSaveConfig = async (configData) => {
    try {
      switch (configType) {
        case 'category':
          await inventoryConfigService.createCategory(configData);
          break;
        case 'location':
          await inventoryConfigService.createLocation(configData);
          break;
        case 'unit':
          await inventoryConfigService.createUnit(configData);
          break;
      }
      toast.success('Configuración guardada exitosamente');
      setShowConfigModal(false);
      refetch();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.success('Error al guardar la configuración: ' + error.message);
    }
  };

  const handleEditConfig = (item, type) => {
    setConfigType(type);
    setConfigForm({
      id: item.id,
      name: item.name,
      abbreviation: item.abbreviation || '',
      description: item.description || ''
    });
    setShowConfigModal(true);
  };

  const handleDeleteConfig = async (id, type) => {
    if (!window.confirm('¿Estás seguro de eliminar esta configuración?')) return;
    
    try {
      switch (type) {
        case 'category':
          await inventoryConfigService.deleteCategory(id);
          break;
        case 'location':
          await inventoryConfigService.deleteLocation(id);
          break;
        case 'unit':
          await inventoryConfigService.deleteUnit(id);
          break;
      }
      toast.success('Configuración eliminada exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.success('Error al eliminar la configuración: ' + error.message);
    }
  };
 
  // handlers facturaion plan
  const handleMarkInvoiceAsPaid = async (invoiceId) => {
  try {
    await billingService.markAsPaid(invoiceId);
    toast.success('Factura marcada como pagada');
    // Opcional: actualizar el estado local
    setPlanInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'active' } : inv
    ));
  } catch (error) {
    console.error('Error marcando factura como pagada:', error);
    toast.success('Error al marcar factura como pagada');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const expiringClients = clients.filter(client => {
    const endDate = new Date(client.end_date);
    const today = new Date();
    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const expiredClients = clients.filter(client => new Date(client.end_date) < new Date());
  const lowStockItems = inventory.filter(item => item.stock <= item.min_stock);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <DashboardStats 
                  clients={clients}
                  expiringClients={expiringClients}
                  expiredClients={expiredClients}
                  inventory={inventory}
                />
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Planes</h1>
                  <button 
                    onClick={() => {
                      setPlanForm({ name: '', price: 0, duration_days: 30, description: '' });
                      setShowPlanModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Plan
                  </button>
                </div>
                <PlanTable 
                  plans={plans}
                  onEdit={handleEditPlan}
                  onDelete={handleDeletePlan}
                  searchTerm={searchTerm}
                />
              </div>
            )}

            {activeTab === 'trainers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Entrenadores</h1>
                  <button 
                    onClick={() => {
                      setTrainerForm({ name: '', email: '', phone: '', specialization: '', status: 'active' });
                      setShowTrainerModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Entrenador
                  </button>
                </div>
                <TrainerTable 
                  trainers={trainers}
                  onEdit={handleEditTrainer}
                  onDelete={handleDeleteTrainer}
                  searchTerm={searchTerm}
                />
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
                  <button 
                    onClick={() => {
                      setClientForm({
                        name: '',
                        email: '',
                        plan_id: plans.length > 0 ? plans[0].id : '',
                        trainer_id: null,
                        start_date: new Date().toISOString().split('T')[0],
                        end_date: '',
                        status: 'active',
                        last_payment: new Date().toISOString().split('T')[0]
                      });
                      setShowClientModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                  </button>
                </div>
                <ClientTable 
                  clients={clients}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                  searchTerm={searchTerm}
                />
              </div>
            )}

            {activeTab === 'machines' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Máquinas</h1>
                  <button 
                    onClick={() => {
                      setMachineForm({
                        name: '',
                        category: 'Cardio',
                        status: 'working',
                        last_maintenance: new Date().toISOString().split('T')[0]
                      });
                      setShowMachineModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Máquina
                  </button>
                </div>
                <MachineTable 
                  machines={machines}
                  onEdit={handleEditMachine}
                  onDelete={handleDeleteMachine}
                  searchTerm={searchTerm}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Inventario de Tienda</h1>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setInventoryForm({
                          name: '',
                          category: categories.length > 0 ? categories[0].name : 'Supplements',
                          stock: 0,
                          price: 0,
                          min_stock: 5,
                          supplier: '',
                          barcode: '',
                          cost_price: 0,
                          reorder_point: 0,
                          location: locations.length > 0 ? locations[0].name : 'General',
                          unit: units.length > 0 ? units[0].name : 'Unidad',
                          description: ''
                        });
                        setShowInventoryModal(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Producto
                    </button>
                  </div>
                </div>
                <InventoryTable 
                  inventory={inventory}
                  onEdit={handleEditInventory}
                  onDelete={handleDeleteInventory}
                  searchTerm={searchTerm}
                  onAdjustStock={handleAdjustStock}
                  onViewMovements={handleViewMovements}
                />
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Tienda</h1>
                  <button 
                    onClick={() => {
                      setSalesInvoiceForm({
                        client_name: '',
                        items: [],
                        total: 0,
                        date: new Date().toISOString().split('T')[0],
                        status: 'paid'
                      });
                      setShowSalesInvoiceModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Venta
                  </button>
                </div>
                <SalesInvoiceTable 
                  invoices={salesInvoices}
                  onEdit={handleEditSalesInvoice}
                  onDelete={handleDeleteSalesInvoice}
                  searchTerm={searchTerm}
                />
              </div>
            )}

              {activeTab === 'invoices' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Facturación de Planes</h1>
                    <button 
                      onClick={() => {
                        // Aquí podrías abrir un modal para generar factura manual
                        toast.success('Generar factura manual (funcionalidad futura)');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Factura Manual
                    </button>
                  </div>
                  <PlanInvoiceTable 
                    invoices={planInvoices}
                    onMarkAsPaid={handleMarkInvoiceAsPaid}
                    searchTerm={searchTerm}
                  />
                </div>
              )}

              {activeTab === 'inventory-config' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Configuración de Inventario</h1>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* Pestañas de configuración */}
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={() => {
                        setActiveTab('inventory-config');
                        setConfigSubTab('categories');
                      }}
                      className={`px-4 py-2 rounded-md font-medium ${
                        configSubTab === 'categories' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Categorías
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('inventory-config');
                        setConfigSubTab('locations');
                      }}
                      className={`px-4 py-2 rounded-md font-medium ${
                        configSubTab === 'locations' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Ubicaciones
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('inventory-config');
                        setConfigSubTab('units');
                      }}
                      className={`px-4 py-2 rounded-md font-medium ${
                        configSubTab === 'units' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Unidades
                    </button>
                  </div>

                  {/* Contenido de Categorías */}
                  {configSubTab === 'categories' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Gestión de Categorías</h2>
                        <button 
                          onClick={() => handleAddConfig('category')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Categoría
                        </button>
                      </div>
                      <InventoryConfigTable 
                        items={categories}
                        onEdit={(item) => handleEditConfig(item, 'category')}
                        onDelete={(id) => handleDeleteConfig(id, 'category')}
                        configType="category"
                        searchTerm={searchTerm}
                      />
                    </div>
                  )}

                  {/* Contenido de Ubicaciones */}
                  {configSubTab === 'locations' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Gestión de Ubicaciones</h2>
                        <button 
                          onClick={() => handleAddConfig('location')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Ubicación
                        </button>
                      </div>
                      <InventoryConfigTable 
                        items={locations}
                        onEdit={(item) => handleEditConfig(item, 'location')}
                        onDelete={(id) => handleDeleteConfig(id, 'location')}
                        configType="location"
                        searchTerm={searchTerm}
                      />
                    </div>
                  )}

                  {/* Contenido de Unidades */}
                  {configSubTab === 'units' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Gestión de Unidades</h2>
                        <button 
                          onClick={() => handleAddConfig('unit')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Unidad
                        </button>
                      </div>
                      <InventoryConfigTable 
                        items={units}
                        onEdit={(item) => handleEditConfig(item, 'unit')}
                        onDelete={(id) => handleDeleteConfig(id, 'unit')}
                        configType="unit"
                        searchTerm={searchTerm}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        planForm={planForm}
        setPlanForm={setPlanForm}
        onSave={handleAddPlan}
        isEditing={!!planForm.id}
      />

      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        clientForm={clientForm}
        setClientForm={setClientForm}
        onSave={handleAddClient}
        isEditing={!!clientForm.id}
        plans={plans}
        trainers={trainers}
      />

      <TrainerModal
        isOpen={showTrainerModal}
        onClose={() => setShowTrainerModal(false)}
        trainerForm={trainerForm}
        setTrainerForm={setTrainerForm}
        onSave={handleAddTrainer}
        isEditing={!!trainerForm.id}
      />

      <MachineModal
        isOpen={showMachineModal}
        onClose={() => setShowMachineModal(false)}
        machineForm={machineForm}
        setMachineForm={setMachineForm}
        onSave={handleAddMachine}
        isEditing={!!machineForm.id}
      />

      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        inventoryForm={inventoryForm}
        setInventoryForm={setInventoryForm}
        onSave={handleAddInventory}
        isEditing={!!inventoryForm.id}
      />

      <SalesInvoiceModal
        isOpen={showSalesInvoiceModal}
        onClose={() => setShowSalesInvoiceModal(false)}
        invoiceForm={salesInvoiceForm}
        setInvoiceForm={setSalesInvoiceForm}
        onSave={handleAddSalesInvoice}
        isEditing={!!salesInvoiceForm.id}
        inventory={inventory}
      />

      <StockAdjustmentModal
        isOpen={showStockAdjustmentModal}
        onClose={() => setShowStockAdjustmentModal(false)}
        item={selectedInventoryItem}
        onSave={handleSaveStockAdjustment}
      />

      <InventoryMovementsModal
        isOpen={showInventoryMovementsModal}
        onClose={() => setShowInventoryMovementsModal(false)}
        item={selectedInventoryItem}
        movements={inventoryMovements}
      />

      <InventoryConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        configForm={configForm}
        setConfigForm={setConfigForm}
        onSave={handleSaveConfig}
        isEditing={!!configForm.id}
        configType={configType}
      />
    </div>
  );
};

export default App;