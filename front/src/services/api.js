import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login page if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: async (credentials) => {
    const response = await api.post('/auth/token', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/account', userData);
    return response.data;
  }
};

// Products API
export const products = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  update: async (id, productData) => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Cart API
export const cart = {
  get: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addItem: async (productId, quantity) => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },
  updateItem: async (productId, quantity) => {
    const response = await api.patch('/cart/update', { productId, quantity });
    return response.data;
  },
  removeItem: async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  },
  clear: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};

// Wishlist API
export const wishlist = {
  get: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },
  addItem: async (productId) => {
    const response = await api.post('/wishlist/add', { productId });
    return response.data;
  },
  removeItem: async (productId) => {
    const response = await api.delete(`/wishlist/remove/${productId}`);
    return response.data;
  },
  clear: async () => {
    const response = await api.delete('/wishlist/clear');
    return response.data;
  }
};