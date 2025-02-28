import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { products as productsApi } from '../services/api';

function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    image: '',
    category: '',
    price: 0,
    quantity: 0,
    internalReference: '',
    shellId: 0,
    inventoryStatus: 'INSTOCK',
    rating: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error loading products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, product = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        code: product.code,
        description: product.description,
        image: product.image,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        internalReference: product.internalReference,
        shellId: product.shellId,
        inventoryStatus: product.inventoryStatus,
        rating: product.rating
      });
    } else {
      // Reset form for add mode
      setSelectedProduct(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        image: '',
        category: '',
        price: 0,
        quantity: 0,
        internalReference: '',
        shellId: 0,
        inventoryStatus: 'INSTOCK',
        rating: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Create updated form data
    const updatedFormData = {
      ...formData,
      [name]: name === 'price' || name === 'quantity' || name === 'shellId' || name === 'rating' 
        ? Number(value) 
        : value
    };
    
    // If quantity field is changed, automatically update inventory status
    if (name === 'quantity') {
      const quantity = Number(value);
      if (quantity === 0) {
        updatedFormData.inventoryStatus = 'OUTOFSTOCK';
      } else if (quantity <= 10) {
        updatedFormData.inventoryStatus = 'LOWSTOCK';
      } else {
        updatedFormData.inventoryStatus = 'INSTOCK';
      }
    }
    
    setFormData(updatedFormData);
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await productsApi.create(formData);
        setSnackbar({ open: true, message: 'Product added successfully', severity: 'success' });
      } else {
        await productsApi.update(selectedProduct._id, formData);
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchProducts(); // Refresh product list
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.response?.data?.message || 'Something went wrong'}`, 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.delete(productId);
        setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
        fetchProducts(); // Refresh product list
      } catch (err) {
        setSnackbar({ 
          open: true, 
          message: `Error: ${err.response?.data?.message || 'Something went wrong'}`, 
          severity: 'error' 
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => handleOpenDialog('add')}
        >
          Add New Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.code}>
                <TableCell>
                  {product.image && (
                    <Box 
                      component="img" 
                      src={product.image} 
                      alt={product.name}
                      sx={{ width: 50, height: 50, objectFit: 'contain' }}
                    />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.inventoryStatus}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenDialog('edit', product)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(product._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Product' : 'Edit Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="code"
                label="Code"
                value={formData.code}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="image"
                label="Image URL"
                value={formData.image}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Inventory Status</InputLabel>
                <Select
                  name="inventoryStatus"
                  value={formData.inventoryStatus}
                  onChange={handleChange}
                  label="Inventory Status"
                  disabled={true}
                >
                  <MenuItem value="INSTOCK">In Stock</MenuItem>
                  <MenuItem value="LOWSTOCK">Low Stock</MenuItem>
                  <MenuItem value="OUTOFSTOCK">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="internalReference"
                label="Internal Reference"
                value={formData.internalReference}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="shellId"
                label="Shell ID"
                type="number"
                value={formData.shellId}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="rating"
                label="Rating"
                type="number"
                value={formData.rating}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, max: 5, step: 0.1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add Product' : 'Update Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Admin;