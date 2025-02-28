import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  internalReference: {
    type: String,
    required: true
  },
  shellId: {
    type: Number,
    required: true
  },
  inventoryStatus: {
    type: String,
    required: true,
    enum: ['INSTOCK', 'LOWSTOCK', 'OUTOFSTOCK']
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Update inventory status based on quantity
productSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.inventoryStatus = 'OUTOFSTOCK';
  } else if (this.quantity <= 10) {
    this.inventoryStatus = 'LOWSTOCK';
  } else {
    this.inventoryStatus = 'INSTOCK';
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;