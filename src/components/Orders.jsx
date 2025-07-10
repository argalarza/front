import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar, Typography, Dialog, DialogTitle, DialogContent
} from '@mui/material';

const Orders = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

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

  const addToCart = () => {
    if (!selectedProduct || !quantity || quantity <= 0) return;
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
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCart([]);
      setSnackbar({ open: true, message: "Orden creada exitosamente", error: false });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error al crear orden", error: true });
    }
  };

  const getOrderById = async () => {
    if (!orderId) return;
    try {
      const response = await axios.get(`http://13.223.17.187:5001/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderDetails(response.data);
      setShowDialog(true);
    } catch {
      setSnackbar({ open: true, message: "Error al obtener orden", error: true });
    }
  };

  const updateOrder = async () => {
    if (!orderId || !orderStatus) return;
    try {
      await axios.put(`http://13.223.17.187:5001/orders/${orderId}`, {
        status: orderStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: "Orden actualizada", error: false });
    } catch {
      setSnackbar({ open: true, message: "Error al actualizar orden", error: true });
    }
  };

  const deleteOrder = async () => {
    if (!orderId) return;
    try {
      await axios.delete(`http://13.223.17.187:5001/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: "Orden eliminada", error: false });
    } catch {
      setSnackbar({ open: true, message: "Error al eliminar orden", error: true });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <Typography variant="h4" gutterBottom>🧾 Gestión de Órdenes</Typography>

      {/* Tabla de productos */}
      <Typography variant="h6">📦 Productos</Typography>
      <TableContainer component={Paper} style={{ marginBottom: 20 }}>
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
                    style={{ width: 80 }}
                    value={selectedProduct?._id === prod._id ? quantity : 1}
                    onChange={(e) => {
                      setSelectedProduct(prod);
                      setQuantity(parseInt(e.target.value));
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => {
                    setSelectedProduct(prod);
                    addToCart();
                  }}>Agregar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Carrito */}
      <Typography variant="h6">🛒 Carrito</Typography>
      <TableContainer component={Paper} style={{ marginBottom: 20 }}>
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

      {/* Acciones extra */}
      <Typography variant="h6" style={{ marginTop: 40 }}>🔧 Administrar Orden</Typography>
      <TextField label="Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} style={{ marginRight: 10 }} />
      <TextField label="Nuevo Estado" value={orderStatus} onChange={e => setOrderStatus(e.target.value)} style={{ marginRight: 10 }} />
      <Button variant="outlined" onClick={getOrderById}>📄 Ver</Button>
      <Button variant="outlined" color="success" onClick={updateOrder}>✏️ Actualizar</Button>
      <Button variant="outlined" color="error" onClick={deleteOrder}>🗑️ Eliminar</Button>

      {/* Detalle de orden */}
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
                {orderDetails.items.map((item, i) => (
                  <li key={i}>
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
        message={snackbar.message}
        ContentProps={{
          style: {
            backgroundColor: snackbar.error ? '#f44336' : '#4caf50',
            color: '#fff'
          }
        }}
      />
    </div>
  );
};

export default Orders;
