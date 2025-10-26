export const generateNotifications = (clients = [], inventory = [], machines = []) => {
  const notifications = [];

  const expiringClients = clients.filter(client => {
    const endDate = new Date(client.end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0 && client.status !== 'expired';
  });

  expiringClients.forEach(client => {
    notifications.push({
      id: `exp-${client.id}`,
      message: `Plan de ${client.name} vence en ${Math.ceil((new Date(client.end_date) - new Date()) / (1000 * 60 * 60 * 24))} días`,
      type: 'warning'
    });
  });

  const expiredClients = clients.filter(client => {
    return new Date(client.end_date) < new Date() && client.status !== 'expired';
  });

  expiredClients.forEach(client => {
    notifications.push({
      id: `expd-${client.id}`,
      message: `Plan de ${client.name} ha vencido`,
      type: 'error'
    });
  });

  const lowStockItems = inventory.filter(item => item.stock <= item.min_stock);
  lowStockItems.forEach(item => {
    notifications.push({
      id: `stock-${item.id}`,
      message: `Stock bajo: ${item.name} (${item.stock} unidades)`,
      type: 'error'
    });
  });

  const maintenanceMachines = machines.filter(machine => machine.status === 'maintenance');
  maintenanceMachines.forEach(machine => {
    notifications.push({
      id: `maint-${machine.id}`,
      message: `Máquina ${machine.name} necesita mantenimiento`,
      type: 'info'
    });
  });

  return notifications;
};