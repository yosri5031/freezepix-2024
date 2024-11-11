import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    province: String,
    state: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    province: String,
    state: String
  },
  orderItems: [{
    imageUrl: String,
    imageId: String, // Changed from imageKey to imageId for Cloudinary public_id
    productType: String,
    size: String,
    crystalShape: String,
    quantity: Number,
    price: Number
  }],,
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  orderNote: String,
  paymentMethod: {
    type: String,
    enum: ['credit', 'cod'],
    required: true
  },
  stripePaymentId: String,
  discountCode: String,
  discountAmount: Number,
  status: {
    type: String,
    enum: ['open', 'cancelled', 'in_progress', 'shipped'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;