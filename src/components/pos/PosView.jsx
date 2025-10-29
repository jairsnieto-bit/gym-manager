// src/components/pos/PosView.jsx
import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Minus, X, CreditCard, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import Ticket from './Ticket';

const PosView = ({ 
  inventory, 
  clients, 
  onSaleComplete,
  searchTerm,
  setSearchTerm
}) => {
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const componentRef = useRef();
  const [currentSale, setCurrentSale] = useState(null);

  // Filtrar productos
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.barcode && item.barcode.includes(searchTerm))
  );

  // Agregar producto al carrito
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => 
          c.id === item.id 
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setSearchTerm(''); // Limpiar búsqueda
  };

  // Actualizar cantidad
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Eliminar del carrito
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calcular total
  const total = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  , [cart]);

  // ✅ SOLO UNA declaración de processSale
  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    // ⚠️ NO incluir client_id (no existe en sales_invoices)
    const saleData = {
      client_name: selectedClient?.name || 'Cliente ocasional',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      total,
      status: 'paid',
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await onSaleComplete(saleData);
      setCurrentSale(saleData); // Para imprimir
      setCart([]);
      setSelectedClient(null);
      toast.success('Venta realizada exitosamente');
      
      // Imprimir después de un breve retraso
      setTimeout(() => {
        handlePrint();
      }, 100);
    } catch (error) {
      console.error('Error processing sale:', error);
      toast.error('Error al procesar la venta');
    }
  };

  // Función para imprimir
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de búsqueda y productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar producto por nombre o código..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Lista de productos */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 max-h-96 overflow-y-auto">
              {filteredInventory.map(item => (
                <div 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition"
                >
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Stock: {item.stock}
                  </div>
                  <div className="text-lg font-bold text-blue-600 mt-1">
                    ${item.price.toFixed(2)}
                  </div>
                  {item.barcode && (
                    <div className="text-xs text-gray-400 mt-1">
                      {item.barcode}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de carrito y resumen */}
        <div className="space-y-4">
          {/* Selección de cliente */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Cliente</h3>
              <button 
                onClick={() => setShowClientModal(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Cambiar
              </button>
            </div>
            <div className="flex items-center">
              <User className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-gray-700">
                {selectedClient?.name || 'Cliente ocasional'}
              </span>
            </div>
          </div>

          {/* Carrito */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-gray-900 mb-3">Carrito ({cart.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm font-medium text-gray-900 ml-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-gray-500 text-center py-4">Carrito vacío</p>
              )}
            </div>
          </div>

          {/* Resumen y pago */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Impuestos (0%):</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={processSale}
              disabled={cart.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Procesar Pago
            </button>
          </div>
        </div>

        {/* Modal de selección de cliente (simple) */}
        {showClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Seleccionar Cliente</h3>
                <button onClick={() => setShowClientModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedClient(null);
                    setShowClientModal(false);
                  }}
                >
                  Cliente ocasional
                </div>
                {clients.map(client => (
                  <div 
                    key={client.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowClientModal(false);
                    }}
                  >
                    {client.name} - {client.email}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Componente de ticket (oculto visualmente) */}
      <div style={{ display: 'none' }}>
        <Ticket ref={componentRef} sale={currentSale} />
      </div>
    </>
  );
};

export default PosView;
