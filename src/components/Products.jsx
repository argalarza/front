import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar
} from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  form: { maxWidth: 600, margin: "20px auto", backgroundColor: "#1c1c1c", padding: 20, borderRadius: 8 },
  table: { backgroundColor: "#ffffff", color: "#fff", minWidth: 650 },
  button: { margin: 10, backgroundColor: "#00796b", "&:hover": { backgroundColor: "#004d40" } },
  dialog: { backgroundColor: "#333", color: "#fff" },
  textField: { width: "100%", marginBottom: 10 },
  successMessage: { backgroundColor: "#4caf50", color: "#fff" },
  errorMessage: { backgroundColor: "#f44336", color: "#fff" },
  detailsContainer: {
    position: 'fixed', top: '20%', right: '10%', backgroundColor: '#333',
    padding: 20, borderRadius: 8, boxShadow: '0 4px 6px rgba(255,255,255,0.1)', zIndex: 1000, color: '#fff', width: 300
  },
  closeButton: {
    marginTop: 10, backgroundColor: '#f44336', color: '#fff',
    '&:hover': { backgroundColor: '#c62828' }
  }
});

const Products = () => {
  const classes = useStyles();
  const [product, setProduct] = useState({ name: "", description: "", price: "", brand: "" });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const query = `
      query {
        listProducts {
          _id
          name
          description
          price
          brand
        }
      }
    `;
    try {
      const res = await axios.post("http://54.87.109.220:4010/", { query });
      setProducts(res.data.data.listProducts);
    } catch (err) {
      setError("Error al obtener productos.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: name === "price" ? parseFloat(value) : value }));
  };

  const validate = () => {
    if (!product.name || !product.description || !product.brand) {
      setError("Todos los campos son requeridos.");
      return false;
    }
    if (product.price === "" || product.price <= 0) {
      setError("El precio debe ser mayor a 0.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const endpoint = isEditing ? "http://34.234.80.122:4008/" : "http://13.217.66.96:4007/";
      const mutation = isEditing
        ? `mutation {
            updateProduct(id: "${selectedProduct._id}", input: {
              name: "${product.name}",
              description: "${product.description}",
              price: ${product.price},
              brand: "${product.brand}"
            })
          }`
        : `mutation {
            createProduct(input: {
              name: "${product.name}",
              description: "${product.description}",
              price: ${product.price},
              brand: "${product.brand}"
            })
          }`;

      await axios.post(endpoint, { query: mutation });
      setSuccessMessage(isEditing ? "Producto actualizado." : "Producto creado.");
      setOpenDialog(false);
      setProduct({ name: "", description: "", price: "", brand: "" });
      fetchProducts();
    } catch (err) {
      setError("Error al procesar el producto.");
    }
  };

  const handleDelete = async (id) => {
    const mutation = `mutation { deleteProduct(id: "${id}") }`;
    try {
      await axios.post("http://44.216.83.89:4009/", { query: mutation });
      setSuccessMessage("Producto eliminado.");
      fetchProducts();
    } catch {
      setError("Error al eliminar el producto.");
    }
  };

  const handleViewDetails = async (id) => {
    const query = `query {
      getProductById(id: "${id}") {
        _id name description price brand
      }
    }`;
    try {
      const res = await axios.post("http://52.202.218.39:4011/", { query });
      setSelectedProduct(res.data.data.getProductById);
    } catch {
      setError("Error al obtener detalles.");
    }
  };

  const openDialogCreate = () => {
    setProduct({ name: "", description: "", price: "", brand: "" });
    setIsEditing(false);
    setOpenDialog(true);
  };

  return (
    <div>
      <Button className={classes.button} onClick={openDialogCreate}>Crear Producto</Button>

      <Snackbar
        open={!!(successMessage || error)}
        message={successMessage || error}
        autoHideDuration={3000}
        onClose={() => { setSuccessMessage(""); setError(""); }}
        ContentProps={{ className: successMessage ? classes.successMessage : classes.errorMessage }}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} className={classes.dialog}>
        <DialogTitle>{isEditing ? "Editar Producto" : "Crear Producto"}</DialogTitle>
        <DialogContent>
          <TextField className={classes.textField} label="Nombre" name="name" value={product.name} onChange={handleChange} required />
          <TextField className={classes.textField} label="Descripción" name="description" value={product.description} onChange={handleChange} required />
          <TextField className={classes.textField} label="Precio" name="price" value={product.price} onChange={handleChange} required type="number" />
          <TextField className={classes.textField} label="Marca" name="brand" value={product.brand} onChange={handleChange} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{isEditing ? "Actualizar" : "Crear"}</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((prod) => (
              <TableRow key={prod._id}>
                <TableCell>{prod.name}</TableCell>
                <TableCell>{prod.description}</TableCell>
                <TableCell>${prod.price.toFixed(2)}</TableCell>
                <TableCell>{prod.brand}</TableCell>
                <TableCell>
                  <Button onClick={() => {
                    setProduct(prod);
                    setSelectedProduct(prod);
                    setIsEditing(true);
                    setOpenDialog(true);
                  }}>Editar</Button>
                  <Button onClick={() => handleDelete(prod._id)}>Eliminar</Button>
                  <Button onClick={() => handleViewDetails(prod._id)}>Ver</Button>
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
};

export default Products;
