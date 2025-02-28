import React, { useState, useEffect } from 'react';
import { Grid, Card, CardMedia, CardContent, CardActions, Typography, Button, Rating, Chip, Box, TextField, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Add, Remove, Favorite, FavoriteBorder } from '@mui/icons-material';
import { products as productsApi } from '../services/api';
import { useAppContext } from '../context/AppContext';

function ProductList({ onAddToCart, updateQuantity, cartItems }) {
  const { isAuthenticated, wishlist: wishlistItems, handleWishlistToggle: toggleWishlistItem } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filter, setFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
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

    fetchProducts();
  }, []);
  
  // Wishlist items are now coming from context

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(filter.toLowerCase()) ||
    product.category.toLowerCase().includes(filter.toLowerCase()) ||
    product.description.toLowerCase().includes(filter.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get quantity of product in cart
  const getQuantityInCart = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };
  
  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems && wishlistItems.some(item => item._id === productId);
  };
  
  // Handle add/remove from wishlist
  const handleWishlistToggle = async (product) => {
    try {
      const result = await toggleWishlistItem(product);
      
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'warning'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating wishlist',
        severity: 'error'
      });
      console.error('Error updating wishlist:', error);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle quantity change
  const handleQuantityChange = (product, newQuantity) => {
    updateQuantity(product._id, newQuantity);
  };

  // Render inventory status with appropriate color
  const renderInventoryStatus = (status) => {
    let color = 'default';
    if (status === 'INSTOCK') color = 'success';
    if (status === 'LOWSTOCK') color = 'warning';
    if (status === 'OUTOFSTOCK') color = 'error';
    
    return <Chip label={status} color={color} size="small" />
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Products
        </Typography>
        <TextField
          label="Search products"
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Box>

      <Grid container spacing={3}>
        {currentItems.map((product) => {
          const quantityInCart = getQuantityInCart(product._id);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.code}>
              <Card className="product-card">
                <CardMedia
                  component="img"
                  className="product-image"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent className="product-card-content">
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" color="primary">
                      ${product.price.toFixed(2)}
                    </Typography>
                    {renderInventoryStatus(product.inventoryStatus)}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Rating:
                    </Typography>
                    <Rating
                      value={product.rating}
                      precision={0.5}
                      onChange={() => {
                        alert('Rating functionality will be implemented soon!');
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({product.rating.toFixed(1)})
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Category: {product.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available: {product.quantity}
                  </Typography>
                </CardContent>
                <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    {quantityInCart > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(product, quantityInCart - 1)}
                          disabled={quantityInCart <= 0}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          size="small"
                          value={quantityInCart}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            handleQuantityChange(product, value);
                          }}
                          inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          sx={{ width: '60px', mx: 1 }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(product, quantityInCart + 1)}
                          disabled={product.inventoryStatus === 'OUTOFSTOCK' || quantityInCart >= product.quantity}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button 
                        size="small" 
                        variant="contained" 
                        fullWidth
                        onClick={() => onAddToCart(product)}
                        disabled={product.inventoryStatus === 'OUTOFSTOCK'}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </Box>
                  <Tooltip title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}>
                    <IconButton 
                      color="error" 
                      onClick={() => handleWishlistToggle(product)}
                      size="small"
                    >
                      {isInWishlist(product._id) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <Box sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
            Page {currentPage} of {totalPages}
          </Box>
          <Button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </Box>
      )}
      
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
    </div>
  );
}

export default ProductList;