// src/services/billingService.js

export const billingService = {
  // Genera facturas virtuales basadas en clientes y sus planes
  getAllPlanInvoices: async () => {
    // Simulamos una llamada a API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([]);
      }, 500);
    });
  },

  // Genera una factura para un cliente específico (simulado)
  generateInvoiceForClient: async (clientId, clients, plans) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) throw new Error("Cliente no encontrado");

    const plan = plans.find(p => p.id === client.plan_id);
    if (!plan) throw new Error("Plan no encontrado");

    const invoice = {
      id: `inv-${Date.now()}-${clientId}`,
      client_id: client.id,
      client_name: client.name,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.price,
      period_start: client.start_date,
      period_end: client.end_date,
      status: new Date(client.end_date) >= new Date() ? 'active' : 'expired',
      last_payment: client.last_payment,
      created_at: new Date().toISOString().split('T')[0],
      notes: `Factura generada automáticamente para el plan ${plan.name}`
    };

    return invoice;
  },

  // Marcar como pagada (simulado)
  markAsPaid: async (invoiceId) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, message: "Factura marcada como pagada" });
      }, 300);
    });
  }
};