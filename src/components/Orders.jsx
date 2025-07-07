import React, { useState } from 'react';
import axios from 'axios';
import './orders.css';

const Orders = () => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState('');
  const [orderDetail, setOrderDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getToken = () => localStorage.getItem('jwtToken');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  };

  const createOrder = async () => {
    if (!productId || !quantity) {
      alert("Por favor ingresa productId y quantity.");
      return;
    }

    try {
      const response = await axios.post(
        'http://13.223.17.187:5001/orders',
        { items: [{ productId, quantity: parseInt(quantity) }] },
        axiosConfig
      );
      alert('Orden creada exitosamente');
      console.log(response.data);
    } catch (error) {
      console.error('Error al crear orden:', error);
      alert('Fallo al crear orden');
    }
  };

  const updateOrder = async () => {
    if (!orderId || !status) {
      alert("Por favor ingresa el ID de la orden y el nuevo estado.");
      return;
    }

    try {
      const response = await axios.put(
        `http://13.223.17.187:5001/orders/${orderId}`,
        { status },
        axiosConfig
      );
      alert('Orden actualizada exitosamente');
      console.log(response.data);
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      alert('Fallo al actualizar orden');
    }
  };

  const deleteOrder = async () => {
    if (!orderId) {
      alert("Por favor ingresa el ID de la orden a eliminar.");
      return;
    }

    try {
      await axios.delete(`http://13.223.17.187:5001/orders/${orderId}`, axiosConfig);
      alert('Orden eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar orden:', error);
      alert('Fallo al eliminar orden');
    }
  };

  const getOrderById = async () => {
    if (!orderId) {
      alert("Por favor ingresa un ID de orden.");
      return;
    }

    try {
      const response = await axios.get(`http://13.223.17.187:5001/orders/${orderId}`, axiosConfig);
      setOrderDetail(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error al obtener orden:', error);
      alert('Fallo al obtener orden');
    }
  };

  return (
    <div className="order-container">
      <h2>Crear Orden</h2>
      <input type="text" placeholder="Product ID" value={productId} onChange={e => setProductId(e.target.value)} />
      <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
      <button onClick={createOrder}>Crear Orden</button>

      <h2>Actualizar Estado de Orden</h2>
      <input type="text" placeholder="Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} />
      <input type="text" placeholder="Nuevo Estado (e.g., CANCELLED)" value={status} onChange={e => setStatus(e.target.value)} />
      <button onClick={updateOrder}>Actualizar Orden</button>

      <h2>Eliminar Orden</h2>
      <input type="text" placeholder="Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} />
      <button onClick={deleteOrder}>Eliminar Orden</button>

      <h2>Consultar Orden por ID</h2>
      <input type="text" placeholder="Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} />
      <button onClick={getOrderById}>Ver Detalles</button>

      {showModal && orderDetail && (
        <div className="modal">
          <div className="modal-content">
            <h3>Detalle de Orden</h3>
            <p><strong>ID:</strong> {orderDetail.id}</p>
            <p><strong>Email:</strong> {orderDetail.email}</p>
            <p><strong>Status:</strong> {orderDetail.status}</p>
            <p><strong>Total:</strong> ${orderDetail.total}</p>
            <p><strong>Items:</strong></p>
            <ul>
              {orderDetail.items.map((item, index) => (
                <li key={index}>
                  Producto ID: {item.productId}, Cantidad: {item.quantity}, Precio: ${item.price}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
