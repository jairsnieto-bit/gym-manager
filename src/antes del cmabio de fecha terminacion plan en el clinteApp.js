import React, { useState, useMemo } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardStats from './components/layout/DashboardStats';
import PlanTable from './components/tables/PlanTable';
import ClientTable from './components/tables/ClientTable';
import PlanModal from './components/modals/PlanModal';
import ClientModal from './components/modals/ClientModal';
import { useData } from './hooks/useData';
import { generateNotifications } from './utils/notifications';
import { planService } from './services/planService';
import { clientService } from './services/clientService';
import TrainerTable from './components/tables/TrainerTable';
import TrainerModal from './components/modals/TrainerModal';
import { trainerService } from './services/trainerService';

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
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'active',
    last_payment: new Date().toISOString().split('T')[0]
  });

   // Estados adicionales
   const [showTrainerModal, setShowTrainerModal] = useState(false);
   const [trainerForm, setTrainerForm] = useState({
   name: '',
   email: '',
   phone: '',
   specialization: '',
   status: 'active'
});	

  const { clients, plans,trainers, loading, error, refetch } = useData();

  // Generate notifications
  const notifications = useMemo(() => {
    return generateNotifications(clients, [], []);
  }, [clients]);

  // Plan handlers
  const handleAddPlan = async (planData) => {
    try {
      await planService.create(planData);
      alert('Plan agregado exitosamente');
      setShowPlanModal(false);
      setPlanForm({ name: '', price: 0, duration_days: 30, description: '' });
      refetch();
    } catch (error) {
      console.error('Error adding plan:', error);
      alert('Error al agregar plan: ' + error.message);
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
      alert('Plan eliminado exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error al eliminar plan: ' + error.message);
    }
  };

  // Client handlers
  const handleAddClient = async (clientData) => {
    try {
      await clientService.create(clientData);
      alert('Cliente agregado exitosamente');
      setShowClientModal(false);
      setClientForm({
        name: '',
        email: '',
        plan_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'active',
        last_payment: new Date().toISOString().split('T')[0]
      });
      refetch();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error al agregar cliente: ' + error.message);
    }
  };

  const handleEditClient = (client) => {
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
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await clientService.delete(id);
      alert('Cliente eliminado exitosamente');
      refetch();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar cliente: ' + error.message);
    }
  };
  
      // Handlers para entrenadores
      const handleAddTrainer = async (trainerData) => {
        try {
          await trainerService.create(trainerData);
          alert('Entrenador agregado exitosamente');
          setShowTrainerModal(false);
          setTrainerForm({ name: '', email: '', phone: '', specialization: '', status: 'active' });
          refetch();
         }catch (error) {
            console.error('Error adding trainer:', error);
           alert('Error al agregar entrenador: ' + error.message);
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
         alert('Entrenador eliminado exitosamente');
         refetch();
         } catch (error) {
            console.error('Error deleting trainer:', error);
           alert('Error al eliminar entrenador: ' + error.message);
         }
        } ;



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
                  inventory={[]}
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
                    <span className="mr-2">+</span>
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
                        start_date: new Date().toISOString().split('T')[0],
                        end_date: '',
                        status: 'active',
                        last_payment: new Date().toISOString().split('T')[0]
                      });
                      setShowClientModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <span className="mr-2">+</span>
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
                   <span className="mr-2">+</span>
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
        trainers={trainers} // Pasar entrenadores
      />
      <TrainerModal
  	isOpen={showTrainerModal}
  	onClose={() => setShowTrainerModal(false)}
  	trainerForm={trainerForm}
  	setTrainerForm={setTrainerForm}
  	onSave={handleAddTrainer}
  	isEditing={!!trainerForm.id}
/>
    </div>
  );
};

export default App;
