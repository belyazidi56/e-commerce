import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total price before saving
cartSchema.pre('save', async function(next) {
  try {
    let total = 0;
    
    // If there are items in the cart
    if (this.items && this.items.length > 0) {
      // Populate product details to get prices
      const populatedCart = await this.constructor.findById(this._id)
        .populate('items.product');
      
      if (populatedCart && populatedCart.items) {
        // Calculate total price
        populatedCart.items.forEach(item => {
          if (item.product && item.product.price) {
            total += item.product.price * item.quantity;
          }
        });
      }
    }
    
    this.totalPrice = total;
    next();
  } catch (error) {
    next(error);
  }
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;