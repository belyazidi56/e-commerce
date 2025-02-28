import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Badge, IconButton, Button } from '@mui/material';
import { ShoppingCart, Contacts, Store, Favorite, Login as LoginIcon, Logout, PersonAdd, AdminPanelSettings } from '@mui/icons-material';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
import Wishlist from './components/Wishlist';
import Admin from './components/Admin';
import { useAppContext } from './context/AppContext';

const drawerWidth = 240;

function App() {
  const { 
    cart, 
    isAuthenticated, 
    userEmail, 
    loading, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    handleLogout 
  } = useAppContext();
  
  const [cartOpen, setCartOpen] = useState(false);
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Alten E-Commerce
          </Typography>
          
          {isAuthenticated ? (
            <>
              <IconButton color="inherit" onClick={() => setCartOpen(true)}>
                <Badge badgeContent={totalItems} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register" startIcon={<PersonAdd />}>
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button component={Link} to="/">
              <ListItemIcon>
                <Store />
              </ListItemIcon>
              <ListItemText primary="Shop" />
            </ListItem>
            {isAuthenticated && (
              <ListItem button component={Link} to="/wishlist">
                <ListItemIcon>
                  <Favorite />
                </ListItemIcon>
                <ListItemText primary="Wishlist" />
              </ListItem>
            )}
            {isAuthenticated && userEmail === 'admin@admin.com' && (
              <ListItem button component={Link} to="/admin">
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary="Admin" />
              </ListItem>
            )}
            <ListItem button component={Link} to="/contact">
              <ListItemIcon>
                <Contacts />
              </ListItemIcon>
              <ListItemText primary="Contact" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={
            <ProductList
              onAddToCart={addToCart}
              updateQuantity={updateQuantity}
              cartItems={cart}
            />
          } />
          <Route path="/contact" element={<Contact />} />
          {/* Protected routes */}
          <Route path="/wishlist" element={
            isAuthenticated ? (
              <Wishlist />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/admin" element={
            isAuthenticated && userEmail === 'admin@admin.com' ? (
              <Admin />
            ) : (
              <Navigate to="/" replace />
            )
          } />
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Box>

      <Cart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </Box>
  );
}

export default App;