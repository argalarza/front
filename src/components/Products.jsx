// src/components/Products.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert
} from '@mui/material';
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  form: { maxWidth: 600, margin: "20px auto", backgroundColor: "#1e1e1e", padding: 20, borderRadius: 8 },
  table: { backgroundColor: "#f4f4f4", minWidth: 650 },
  button: {
    margin: 10, backgroundColor: "#1976d2", color: "#fff",
    '&:hover': { backgroundColor: "#004ba0" }
  },
  dialog: { backgroundColor: "#222", color: "#fff" },
  textField: { width: "100%", marginBottom: 10 },
  successMessage: { backgroundColor: "#4caf50", color: "#fff" },
  errorMessage: { backgroundColor: "#f44336", color: "#fff" },
  detailsContainer: {
    position: 'fixed', top: '20%', right: '10%', backgroundColor: '#333',
    padding: 20, borderRadius: 8, boxShadow: '0 4px 6px rgba(255,255,255,0.1)',
    zIndex: 1000, color: '#fff', width: 300
  },
  closeButton: {
    marginTop: 10, backgroundColor: '#f44336', color: '#fff',
    '&:hover': { backgroundColor: '#c62828' }
  },
});

const endpoints = {
  create: "http://13.217.66.96:4007/",
  update: "http://34.234.80.122:4008/",
  delete: "http://44.216.83.89:4009/",
  list:   "http://54.87.109.220:4010/",
  search: "http://54.91.169.90:4012/",
  getById:"http://52.202.218.39:4011/",
};

export default function Products() {
  const classes = useStyles();
  const [product, setProduct] = useState({ name: "", description: "", price: "", brand: "", search: "" });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const token = localStorage.getItem("jwtToken");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const query = `query { listProducts { _id name description price brand } }`;
    try {
      const res = await axios.post(endpoints.list, { query }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.data.listProducts || []);
    } catch {
      setError("Error al obtener productos");
    }
  };

  const handleSearch = async () => {
    const query = `query { searchProducts(keyword: "${product.search}") { _id name description price brand } }`;
    try {
      const res = await axios.post(endpoints.search, { query }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.data.searchProducts || []);
    } catch {
      setError("Error al buscar productos");
    }
  };

  const openForm = (prod = null) => {
    if (prod) {
      setProduct(prod);
      setIsEditing(true);
      setSelectedProduct(prod);
    } else {
      setProduct({ name: "", description: "", price: "", brand: "", search: "" });
      setIsEditing(false);
      setSelectedProduct(null);
    }
    setOpenDialog(true);
    setError("");
    setSuccessMessage("");
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: name === "price" ? parseFloat(value) : value }));
  };

  const handleSubmit = async () => {
    if (!product.name || !product.description || !product.price || !product.brand) {
      setError("Completa todos los campos");
      return;
    }

    const q = isEditing
      ? `mutation { updateProduct(id: "${selectedProduct._id}", input: {
            name: "${product.name}", description: "${product.description}",
            price: ${product.price}, brand: "${product.brand}"
        }) }`
      : `mutation { createProduct(input: {
            name: "${product.name}", description: "${product.description}",
            price: ${product.price}, brand: "${product.brand}"
        }) }`;

    try {
      await axios.post(isEditing ? endpoints.update : endpoints.create, { query: q }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage(isEditing ? "Producto actualizado correctamente" : "Producto creado exitosamente");
      fetchProducts();
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      setError("Error al guardar producto");
    }
  };

  const handleDelete = async (_id) => {
    const q = `mutation { deleteProduct(id: "${_id}") }`;
    try {
      await axios.post(endpoints.delete, { query: q }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage("Producto eliminado correctamente");
      fetchProducts();
    } catch {
      setError("Error al eliminar producto");
    }
  };

  const viewDetails = async (_id) => {
    const q = `query { getProductById(id: "${_id}") { _id name description price brand } }`;
    try {
      const res = await axios.post(endpoints.getById, { query: q }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedProduct(res.data.data.getProductById);
    } catch {
      setError("Error al obtener detalles");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Button className={classes.button} onClick={() => openForm()}>Crear Producto</Button>
        <TextField
          className={classes.textField} label="Buscar"
          name="search" value={product.search} onChange={handleChange}
        />
        <Button className={classes.button} onClick={handleSearch}>Buscar</Button>
      </div>

      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={3000}
        onClose={() => { setError(""); setSuccessMessage(""); }}
      >
        <Alert severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error || successMessage}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} className={classes.dialog}>
        <DialogTitle>{isEditing ? "Editar Producto" : "Crear Producto"}</DialogTitle>
        <DialogContent>
          <TextField className={classes.textField} label="Nombre" name="name"
            value={product.name} onChange={handleChange} required />
          <TextField className={classes.textField} label="Descripción" name="description"
            value={product.description} onChange={handleChange} required />
          <TextField className={classes.textField} label="Precio" name="price"
            type="number" value={product.price} onChange={handleChange} required />
          <TextField className={classes.textField} label="Marca" name="brand"
            value={product.brand} onChange={handleChange} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} className={classes.closeButton}>Cancelar</Button>
          <Button onClick={handleSubmit} className={classes.button}>
            {isEditing ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Precio</strong></TableCell>
              <TableCell><strong>Marca</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p._id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell>${p.price}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>
                  <Button onClick={() => openForm(p)} color="primary">Editar</Button>
                  <Button onClick={() => handleDelete(p._id)} color="secondary">Eliminar</Button>
                  <Button onClick={() => viewDetails(p._id)} style={{ color: '#1976d2' }}>Ver</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedProduct && (
        <div className={classes.detailsContainer}>
          <h3>Detalles del Producto</h3>
          <p><strong>Nombre:</strong> {selectedProduct.name}</p>
          <p><strong>Descripción:</strong> {selectedProduct.description}</p>
          <p><strong>Precio:</strong> ${selectedProduct.price}</p>
          <p><strong>Marca:</strong> {selectedProduct.brand}</p>
          <Button onClick={() => setSelectedProduct(null)} className={classes.closeButton}>Cerrar</Button>
        </div>
      )}
    </div>
  );
}
