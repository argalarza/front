import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './orders.css'; // Para importar los estilos modernos

const Orders = () => {
  const [username, setUsername] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [orders, setOrders] = useState([]);  // Asegurarse de que esto sea siempre un arreglo
  const [orderDetail, setOrderDetail] = useState(null);
  const [showModal, setShowModal] = useState(false); // Para controlar la ventana flotante

  // Obtener el token JWT almacenado en localStorage
  const getToken = () => {
    const token = localStorage.getItem('jwtToken');
    console.log('JWT Token:', token);  // Verifica si el token está presente
    return token;
  };

  // Configuración de axios con el token JWT
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`,  // Incluir el token correctamente
    },
  };

  const createOrder = async () => {
    const token = getToken();
    if (!token) {
      alert('No JWT token found, please login first.');
      return;
    }

    if (!username || !productId || !quantity) {
      alert("Please fill all fields to create the order.");
      return;
    }

    try {
      await axios.post('http://localhost:3011/create_order', {
        username,
        product_id: productId,
        quantity,
      }, axiosConfig);
      alert('Order created successfully!');
      fetchOrders(); // Refresca la lista después de crear la orden
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  const updateOrder = async () => {
    if (!orderId || !productId || !quantity || !totalPrice || !productPrice || !username) {
      alert("Please fill all fields to update the order.");
      return;
    }

    try {
      await axios.put(`http://localhost:3013/update_order/${orderId}`, {
        product_id: productId,
        quantity,
        total_price: totalPrice,
        product_price: productPrice,
        username,
      }, axiosConfig);
      alert('Order updated successfully!');
      fetchOrders(); // Refresca la lista después de actualizar
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!orderId) {
      alert('Please provide a valid Order ID to delete.');
      return;
    }
    try {
      await axios.delete(`http://localhost:3012/delete_order/${orderId}`, axiosConfig);
      alert('Order deleted successfully!');
      fetchOrders(); // Refresca la lista después de eliminar la orden
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3014/orders', axiosConfig);
      console.log('API Response:', response.data); // Verifica la estructura
      setOrders(response.data.orders || response.data); // Accede a la propiedad correcta
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error fetching orders');
    }
  };

  const fetchOrderDetail = async () => {
    if (!orderId) {
      alert("Please provide a valid Order ID.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3016/orders/${orderId}`, axiosConfig);
      setOrderDetail(response.data);
      setShowModal(true); // Abre el modal con los detalles de la orden
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Error fetching order details');
    }
  };

  useEffect(() => {
    fetchOrders(); // Carga las órdenes cuando el componente se monta
  }, []);

  return (
    <div className="order-container">
      <h2>Create Order</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="number" placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
      <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      <button onClick={createOrder}>Create Order</button>

      <h2>Update Order</h2>
      <input type="text" placeholder="Order ID" value={orderId || ''} onChange={(e) => setOrderId(e.target.value)} />
      <input type="number" placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
      <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      <input type="number" placeholder="Total Price" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
      <input type="number" placeholder="Product Price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
      <button onClick={updateOrder}>Update Order</button>

      <h2>Orders List</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Username</th>
            <th>Product ID</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}> {/* Cambié "_id" a "id" según tu respuesta */}
                <td>{order.id}</td>
                <td>{order.username}</td>
                <td>{order.product_id}</td>
                <td>{order.quantity}</td>
                <td>
                  <button onClick={() => { setOrderId(order.id); fetchOrderDetail(); }}>View Details</button>
                  <button onClick={() => deleteOrder(order.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No orders available</td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && orderDetail && (
        <div className="modal">
          <div className="modal-content">
            <h3>Order Detail</h3>
            <p><strong>Username:</strong> {orderDetail.username}</p>
            <p><strong>Product ID:</strong> {orderDetail.product_id}</p>
            <p><strong>Quantity:</strong> {orderDetail.quantity}</p>
            <p><strong>Total Price:</strong> {orderDetail.total_price}</p>
            <p><strong>Product Price:</strong> {orderDetail.product_price}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
