import express from 'express';
import { body, validationResult } from 'express-validator';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management endpoints
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist with product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wishlist'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    
    if (!wishlist) {
      // Create a new wishlist if one doesn't exist
      wishlist = new Wishlist({ user: req.user._id, products: [] });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
});

/**
 * @swagger
 * /wishlist/add:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to add to wishlist
 *     responses:
 *       200:
 *         description: Product added to wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wishlist'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post('/add', [
  body('productId').notEmpty().withMessage('Product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { productId } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find user's wishlist or create a new one
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }
    
    // Check if product already in wishlist
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    
    // Return updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
  }
});

/**
 * @swagger
 * /wishlist/remove/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to remove
 *     responses:
 *       200:
 *         description: Product removed from wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wishlist'
 *       404:
 *         description: Wishlist not found
 *       500:
 *         description: Server error
 */
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(product => product.toString() !== productId);
    await wishlist.save();
    
    // Return updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
  }
});

/**
 * @swagger
 * /wishlist/clear:
 *   delete:
 *     summary: Clear all items from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
 *       404:
 *         description: Wishlist not found
 *       500:
 *         description: Server error
 */
router.delete('/clear', async (req, res) => {
  try {
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Clear wishlist items
    wishlist.products = [];
    await wishlist.save();
    
    res.status(200).json({ message: 'Wishlist cleared successfully', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing wishlist', error: error.message });
  }
});

export default router;