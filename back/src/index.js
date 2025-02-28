import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import { authenticateToken } from './middleware/auth.js';
import setupSwagger from './swagger.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { dbName: 'alten_ecommerce' })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
// Protected routes - require authentication
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/cart', authenticateToken, cartRoutes);
app.use('/api/wishlist', authenticateToken, wishlistRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Alten E-commerce API is running');
});

// Setup Swagger documentation
setupSwagger(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});