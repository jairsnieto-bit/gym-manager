import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const SalesInvoiceModal = ({ 
  isOpen, 
  onClose, 
  invoiceForm, 
  setInvoiceForm, 
  onSave,
  isEditing,
  inventory
}) => {
  const [tempItem, setTempItem] = useState({
    inventory_id: '',
    quantity: 1,
    price: 0,
    name: ''
  });

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (tempItem.inventory_id && tempItem.quantity > 0) {
      const selectedItem = inventory.find(item => item.id === tempItem.inventory_id);
      if (selectedItem) {
        const newItem = {
          inventory_id: selectedItem.id,
          name: selectedItem.name,
          quantity: tempItem.quantity,
          price: selectedItem.price,
          current_stock: selectedItem.stock
        };
        setInvoiceForm(prev => ({
          ...prev,
          items: [...prev.items, newItem]
        }));
        setTempItem({ inventory_id: '', quantity: 1, price: 0, name: '' });
      }
    }
  };

  const handleRemoveItem = (index) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return invoiceForm.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (invoiceForm.client_name && invoiceForm.items.length > 0) {
      setInvoiceForm(prev => ({ ...prev, total: calculateTotal() }));
      onSave({ ...invoiceForm, total: calculateTotal() });
    } else {
      alert('Por favor, completa los campos obligatorios');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Factura de Venta' : 'Nueva Factura de Venta'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
            <div className="space-y-2">
              {/* Formulario para añadir productos */}
              <div className="flex space-x-2 mb-4">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={tempItem.inventory_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedItem = inventory.find(item => item.id === selectedId);
                    setTempItem({
                      inventory_id: selectedId,
                      quantity: 1,
                      price: selectedItem ? selectedItem.price : 0,
                      name: selectedItem ? selectedItem.name : ''
                    });
                  }}
                >
                  <option value="">Selecciona un producto</option>
                  {inventory.filter(item => item.stock > 0).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ${item.price} ({item.stock} en stock)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={tempItem.quantity}
                  onChange={(e) => setTempItem({...tempItem, quantity: parseInt(e.target.value) || 1})}
                  min="1"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Lista de productos seleccionados */}
              {invoiceForm.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-gray-600">x{item.quantity}</span>
                    <span className="ml-2 text-gray-600">${item.price}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Total: ${calculateTotal().toFixed(2)}</label>
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
              <option value="pending">Pendiente</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesInvoiceModal;