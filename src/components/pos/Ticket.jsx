// src/components/pos/Ticket.jsx
import React from 'react';

const Ticket = React.forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  return (
    <div 
      ref={ref} 
      className="p-4 max-w-md mx-auto bg-white"
      style={{ 
        fontFamily: 'monospace', 
        fontSize: '12px',
        lineHeight: '1.4'
      }}
    >
      <div className="text-center mb-3">
        <h2 className="font-bold text-lg">GYM MANAGER</h2>
        <p className="text-sm">Tu gimnasio de confianza</p>
        <p className="text-xs mt-1">Fecha: {new Date(sale.date).toLocaleDateString()}</p>
      </div>

      <div className="mb-3">
        <p><strong>Cliente:</strong> {sale.client_name}</p>
      </div>

      <div className="border-t border-b py-2 mb-3">
        <div className="flex justify-between font-bold">
          <span>Producto</span>
          <span>Cant.</span>
          <span>Precio</span>
          <span>Total</span>
        </div>
      </div>

      {sale.items.map((item, index) => (
        <div key={index} className="flex justify-between text-sm mb-1">
          <span className="w-24 truncate">{item.name}</span>
          <span className="text-center w-8">{item.quantity}</span>
          <span className="w-12 text-right">${item.price.toFixed(2)}</span>
          <span className="w-12 text-right">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}

      <div className="border-t pt-2 mt-2">
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>${sale.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mt-4 text-xs">
        <p>¡Gracias por tu compra!</p>
        <p>www.gymmanager.com</p>
      </div>
    </div>
  );
});

export default Ticket;