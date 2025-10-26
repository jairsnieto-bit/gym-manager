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

      console.log('Iniciando carga de datos...');

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

      console.log('Datos cargados:', {
        clients: clientsData.length,
        plans: plansData.length,
        trainers: trainersData.length,
        machines: machinesData.length,
        inventory: inventoryData.length,
        salesInvoices: salesInvoicesData.length,
        categories: categoriesData.length,
        locations: locationsData.length,
        units: unitsData.length
      });

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

  useEffect(() => {
    fetchData();
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
    refetch: fetchData 
  };
};