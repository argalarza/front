// Orders.jsx - Versión corregida y optimizada

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar,
  Typography, Dialog, DialogTitle, DialogContent, Alert
} from '@mui/material';

const Orders = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', error: false });
  const [showDialog, setShowDialog] = useState(false);
  const token = localStorage.getItem('jwtToken');
  const fetchProducts = async () => {
    const query = `query { listProducts { _id name description price brand } }`;
    try {
      const res = await axios.post("http://54.87.109.220:4010/", { query }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.data.listProducts || []);
    } catch {
      setSnackbar({ open: true, message: "Error al cargar productos", error: true });
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await axios.get("http://13.223.17.187:5001/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserOrders(res.data || []);
    } catch {
      setSnackbar({ open: true, message: "Error al listar órdenes", error: true });
    }
  };

  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) return;
    const existing = cart.find(item => item.productId === selectedProduct._id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === selectedProduct._id
          ? { ...item, quantity: item.quantity + parseInt(quantity) }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: parseInt(quantity)
      }]);
    }
    setSelectedProduct(null);
    setQuantity(1);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const createOrder = async () => {
    if (!cart.length) {
      setSnackbar({ open: true, message: "Agrega productos antes de crear la orden", error: true });
      return;
    }

    try {
      await axios.post('http://13.223.17.187:5001/orders', {
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCart([]);
      fetchUserOrders();
      setSnackbar({ open: true, message: "Orden creada exitosamente", error: false });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error al crear orden", error: true });
    }
  };

  const getOrderById = async (id) => {
    try {
      const response = await axios.get(`http://13.223.17.187:5001/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderDetails(response.data);
      setShowDialog(true);
    } catch {
      setSnackbar({ open: true, message: "Error al obtener orden", error: true });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUserOrders();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <Typography variant="h4" gutterBottom>🧾 Gestión de Órdenes</Typography>

      <Typography variant="h6">📦 Productos</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Agregar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(prod => (
              <TableRow key={prod._id}>
                <TableCell>{prod.name}</TableCell>
                <TableCell>{prod.brand}</TableCell>
                <TableCell>${prod.price}</TableCell>
                <TableCell>{prod.description}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={selectedProduct?._id === prod._id ? quantity : 1}
                    onChange={(e) => {
                      setSelectedProduct(prod);
                      setQuantity(parseInt(e.target.value));
                    }}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => { setSelectedProduct(prod); addToCart(); }}>Agregar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6">🛒 Carrito</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map(item => (
              <TableRow key={item.productId}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.price}</TableCell>
                <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => removeFromCart(item.productId)}>X</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" color="primary" onClick={createOrder}>✅ Confirmar Orden</Button>

      <Typography variant="h6" sx={{ mt: 4 }}>📋 Mis Órdenes</Typography>
      <Button variant="outlined" onClick={fetchUserOrders} sx={{ mb: 2 }}>🔄 Actualizar Órdenes</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <ul>
                    {order.items.map((item) => (
                      <li key={`${order.id}-${item.productId}`}>{item.productId} x{item.quantity} - ${item.price}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => getOrderById(order.id)}>📄</Button>
                  <Button
                    size="small"
                    color="success"
                    onClick={async () => {
                      const newStatus = prompt("Nuevo estado:", order.status);
                      if (newStatus) {
                        try {
                          await axios.put(`http://13.223.17.187:5001/orders/${order.id}`, { status: newStatus }, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          setSnackbar({ open: true, message: "Orden actualizada", error: false });
                          fetchUserOrders();
                        } catch {
                          setSnackbar({ open: true, message: "Error al actualizar", error: true });
                        }
                      }
                    }}
                  >✏️</Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={async () => {
                      if (window.confirm("¿Eliminar esta orden?")) {
                        try {
                          await axios.delete(`http://13.223.17.187:5001/orders/${order.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          setSnackbar({ open: true, message: "Orden eliminada", error: false });
                          fetchUserOrders();
                        } catch {
                          setSnackbar({ open: true, message: "Error al eliminar", error: true });
                        }
                      }
                    }}
                  >🗑️</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Detalle de Orden</DialogTitle>
        <DialogContent>
          {orderDetails && (
            <div>
              <p><strong>ID:</strong> {orderDetails.id}</p>
              <p><strong>Email:</strong> {orderDetails.email}</p>
              <p><strong>Status:</strong> {orderDetails.status}</p>
              <p><strong>Total:</strong> ${orderDetails.total}</p>
              <p><strong>Items:</strong></p>
              <ul>
                {orderDetails.items.map(item => (
                  <li key={`${orderDetails.id}-${item.productId}`}>
                    Producto: {item.productId} | Cantidad: {item.quantity} | Precio: ${item.price}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Orders;
