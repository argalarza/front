import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar } from '@mui/material';
import { makeStyles } from "@mui/styles";  
import { styled } from "@mui/system"; 

const useStyles = makeStyles({
  form: {
    width: '100%',
    maxWidth: '600px',
    margin: '20px auto',
    backgroundColor: '#1c1c1c',
    padding: '20px',
    borderRadius: '8px',
  },
  table: {
    backgroundColor: '#ffffff',
    color: '#fff',
    minWidth: 650,
  },
  button: {
    margin: '10px',
    backgroundColor: '#00796b',
    '&:hover': {
      backgroundColor: '#004d40',
    },
  },
  dialog: {
    backgroundColor: '#333',
    color: '#fff',
  },
  textField: {
    width: '100%',
    marginBottom: '10px',
  },
  successMessage: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  errorMessage: {
    backgroundColor: '#f44336',
    color: '#fff',
  },
  detailsContainer: {
    position: 'fixed',
    top: '20%',
    right: '10%',
    backgroundColor: '#333',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    color: '#fff',
    width: '300px',
  },
  closeButton: {
    marginTop: '10px',
    backgroundColor: '#f44336',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#c62828',
    },
  },
});

const Products = () => {
  const classes = useStyles();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    brand: "",
  });

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://53.83.38.238:3010/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  const validate = () => {
    if (!product.name || !product.description || !product.category || !product.brand) {
      setError("Todos los campos son requeridos.");
      return false;
    }
    if (product.price === "" || product.price <= 0) {
      setError("El precio debe ser mayor a 0.");
      return false;
    }
    if (product.quantity === "" || product.quantity < 0) {
      setError("La cantidad no puede ser negativa.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");

    if (!validate()) return;

    try {
      if (isEditing) {
        await axios.put(`http://44.203.183.252:3008/products/${selectedProduct.id}`, product);
        setSuccessMessage("Producto actualizado exitosamente.");
        setIsEditing(false);
      } else {
        await axios.post("http://44.202.237.191:3006/products", product);
        setSuccessMessage("Producto creado exitosamente.");
      }

      setProduct({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        brand: "",
      });

      fetchProducts();
      setOpenDialog(false);
    } catch (error) {
      setError("Error al procesar el producto.");
    }
  };

  const handleEdit = (product) => {
    setProduct(product);
    setSelectedProduct(product);
    setIsEditing(true);
    setIsCreating(false);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://52.55.93.175:3007/products/${id}`);
      setSuccessMessage("Producto eliminado exitosamente.");
      fetchProducts();
    } catch (error) {
      setError("Error al eliminar el producto.");
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3009/products/${id}`);
      setSelectedProduct(response.data);
    } catch (error) {
      setError("Error al obtener detalles del producto.");
    }
  };

  const handleOpenCreateDialog = () => {
    setProduct({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category: "",
      brand: "",
    });
    setIsEditing(false);
    setIsCreating(true);
    setOpenDialog(true);
  };

  return (
    <div>
      <Button variant="contained" className={classes.button} onClick={handleOpenCreateDialog}>Crear Producto</Button>
      <Snackbar
        open={successMessage || error}
        message={successMessage || error}
        autoHideDuration={3000}
        onClose={() => setError("")}
        ContentProps={{
          className: successMessage ? classes.successMessage : classes.errorMessage
        }}
      />

      {/* Crear / Editar Producto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} className={classes.dialog}>
        <DialogTitle>{isCreating ? "Crear Producto" : "Editar Producto"}</DialogTitle>
        <DialogContent>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

          <TextField
            className={classes.textField}
            label="Nombre"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
          <TextField
            className={classes.textField}
            label="Descripción"
            name="description"
            value={product.description}
            onChange={handleChange}
            required
          />
          <TextField
            className={classes.textField}
            label="Precio"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
            type="number"
            min="0"
          />
          <TextField
            className={classes.textField}
            label="Cantidad"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            required
            type="number"
            min="0"
          />
          <TextField
            className={classes.textField}
            label="Categoría"
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          />
          <TextField
            className={classes.textField}
            label="Marca"
            name="brand"
            value={product.brand}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isEditing ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lista de Productos */}
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length > 0 ? (
              products.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell>{prod.id}</TableCell>
                  <TableCell>{prod.name}</TableCell>
                  <TableCell>{prod.description}</TableCell>
                  <TableCell>${prod.price.toFixed(2)}</TableCell>
                  <TableCell>{prod.quantity}</TableCell>
                  <TableCell>{prod.category}</TableCell>
                  <TableCell>{prod.brand}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleEdit(prod)}>
                      Editar
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => handleDelete(prod.id)}>
                      Eliminar
                    </Button>
                    <Button variant="contained" color="info" onClick={() => handleViewDetails(prod.id)}>
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} style={{ textAlign: 'center' }}>No hay productos disponibles</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Detalles del Producto */}
      {selectedProduct && (
        <div className={classes.detailsContainer}>
          <h3>Detalles del Producto</h3>
          <p><strong>Nombre:</strong> {selectedProduct.name}</p>
          <p><strong>Descripción:</strong> {selectedProduct.description}</p>
          <p><strong>Precio:</strong> ${selectedProduct.price}</p>
          <p><strong>Cantidad:</strong> {selectedProduct.quantity}</p>
          <p><strong>Categoría:</strong> {selectedProduct.category}</p>
          <p><strong>Marca:</strong> {selectedProduct.brand}</p>
          <Button onClick={() => setSelectedProduct(null)} className={classes.closeButton}>Cerrar</Button>
        </div>
      )}
    </div>
  );
};

export default Products;
