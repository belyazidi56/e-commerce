import React, { createContext, useState, useContext, useEffect } from 'react';
import { cart as cartApi, wishlist as wishlistApi } from '../services/api';

// Create the context
const AppContext = createContext();

// Create a custom hook to use the context
export const useAppContext = () => useContext(AppContext);

// Create the provider component
export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    if (token) {
      setIsAuthenticated(true);
      if (email) {
        setUserEmail(email);
      }
    }
    setLoading(false);
  }, []);

  // Fetch cart data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const cartData = await cartApi.get();
      // Transform cart data to match our frontend structure
      const cartItems = cartData.items.map(item => ({
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
        inventoryStatus: item.product.inventoryStatus
      }));
      setCart(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      // Handle unauthenticated users
      alert('Please log in to add items to your cart');
      return;
    }

    try {
      await cartApi.addItem(product._id, 1);
      fetchCart(); // Refresh cart after adding item
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartApi.removeItem(productId);
      fetchCart(); // Refresh cart after removing item
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
    } else {
      try {
        await cartApi.updateItem(productId, newQuantity);
        fetchCart(); // Refresh cart after updating quantity
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserEmail('');
    setCart([]);
    setWishlist([]);
  };

  // Fetch wishlist items
  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Only fetch if user is authenticated
      
      const data = await wishlistApi.get();
      setWishlist(data.products || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Handle add/remove from wishlist
  const handleWishlistToggle = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'Please log in to add items to your wishlist' };
      }
      
      const productInWishlist = wishlist.some(item => item._id === product._id);
      
      if (productInWishlist) {
        await wishlistApi.removeItem(product._id);
        await fetchWishlist();
        return { success: true, message: 'Product removed from wishlist' };
      } else {
        await wishlistApi.addItem(product._id);
        await fetchWishlist();
        return { success: true, message: 'Product added to wishlist' };
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      return { success: false, message: 'Error updating wishlist' };
    }
  };

  // Value to be provided to consumers
  const contextValue = {
    cart,
    wishlist,
    isAuthenticated,
    userEmail,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    handleLogout,
    fetchWishlist,
    handleWishlistToggle,
    isAdmin: isAuthenticated && userEmail === 'admin@admin.com'
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};