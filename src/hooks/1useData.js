import { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';
import { machineService } from '../services/machineService';
import { inventoryService } from '../services/inventoryService';
import { invoiceService } from '../services/invoiceService';
import { planService } from '../services/planService';

export const useData = () => {
  const [clients, setClients] = useState([]);
  const [machines, setMachines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        clientsData,
        machinesData,
        inventoryData,
        invoicesData,
        plansData
      ] = await Promise.all([
        clientService.getAll(),
        machineService.getAll(),
        inventoryService.getAll(),
        invoiceService.getAll(),
        planService.getAll()
      ]);

      setClients(clientsData);
      setMachines(machinesData);
      setInventory(inventoryData);
      setInvoices(invoicesData);
      setPlans(plansData);

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
    machines, 
    inventory, 
    invoices, 
    plans, 
    loading, 
    error, 
    refetch: fetchData 
  };
};