import React, { useState, useEffect } from 'react';
import { Grid, Card, CardMedia, CardContent, CardActions, Typography, Button, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useAppContext } from '../context/AppContext';

function Wishlist() {
  const { wishlist: wishlistItems, fetchWishlist, handleWishlistToggle } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        await fetchWishlist();
        setError(null);
      } catch (err) {
        setError('Error loading wishlist. Please try again later.');
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWishlist();
  }, []);

  const removeFromWishlist = async (product) => {
    try {
      const result = await handleWishlistToggle(product);
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error removing item from wishlist',
        severity: 'error'
      });
      console.error('Error removing from wishlist:', error);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const clearWishlist = async () => {
    try {
      // We'll keep using the API directly for this operation since there's no context method for it
      const { wishlist: wishlistApi } = require('../services/api');
      await wishlistApi.clear();
      // Refresh wishlist after clearing
      await fetchWishlist();
      setSnackbar({
        open: true,
        message: 'Wishlist cleared successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error clearing wishlist',
        severity: 'error'
      });
      console.error('Error clearing wishlist:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wishlist
        </Typography>
        {wishlistItems.length > 0 && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={clearWishlist}
          >
            Clear Wishlist
          </Button>
        )}
      </Box>

      {wishlistItems.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
          <Typography variant="h6" color="text.secondary">
            Your wishlist is empty
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${product.price.toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => removeFromWishlist(product)}
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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

export default Wishlist;