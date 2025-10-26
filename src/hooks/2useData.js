import { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';
import { planService } from '../services/planService';
import { trainerService } from '../services/trainerService';
import { machineService } from '../services/machineService';
import { inventoryService } from '../services/inventoryService'; 
import { salesInvoiceService } from '../services/salesInvoiceService';
import { inventoryConfigService } from '../services/inventoryConfigService';

export const useData = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        clientsData,
        plansData,
        trainersData,
        machinesData,
        inventoryData,
        salesInvoicesData,
        categoriesData,
        locationsData,
        unitsData
      ] = await Promise.all([
        clientService.getAll(),
        planService.getAll(),
        trainerService.getAll(),
        machineService.getAll(),
        inventoryService.getAll(),
        salesInvoiceService.getAll(),
        inventoryConfigService.getCategories(),
        inventoryConfigService.getLocations(),
        inventoryConfigService.getUnits()
      ]);

      setClients(clientsData);
      setPlans(plansData);
      setTrainers(trainersData);
      setMachines(machinesData);
      setInventory(inventoryData);
      setSalesInvoices(salesInvoicesData);
      setCategories(categoriesData);
      setLocations(locationsData);
      setUnits(unitsData);

    } catch (err) {
      console.error('Error loading ', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
//  useEffect(() => {
  //   fetchData();

//  }, []);

  useEffect(() => {
    // Datos de prueba
    setCategories([
      { id: '1', name: 'Supplements', description: 'Suplementos nutricionales' },
      { id: '2', name: 'Accessories', description: 'Accesorios para gimnasio' }
    ]);
    setLocations([
      { id: '1', name: 'General', description: 'Ubicación general' },
      { id: '2', name: 'Estantería A1', description: 'Estantería principal - Sección A1' }
    ]);
    setUnits([
      { id: '1', name: 'Unidad', abbreviation: 'u', description: 'Unidad individual' },
      { id: '2', name: 'Paquete', abbreviation: 'pkg', description: 'Paquete o caja' }
    ]);

    // ✅ Establece loading = false para que la UI se actualice
    setLoading(false);

    // fetchData(); // Comenta esto temporalmente para probar
  }, []);

  return { 
    clients, 
    plans, 
    trainers,
    machines,
    inventory,
    salesInvoices,
    categories,
    locations,
    units,
    loading, 
    error, 
     refetch: () => {} // Puedes dejarlo vacío temporalmente	
    //refetch: fetchData 
  };
};