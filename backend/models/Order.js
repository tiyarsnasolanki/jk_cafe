const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  qty: Number,
  category: String
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  branchId: { type: String, required: true },
  branchName: String,
  tableNo: { type: String, default: 'Take-Away' },
  customer: { type: String, default: 'Guest' },
  phone: { type: String, default: '' },
  items: [OrderItemSchema],
  subtotal: Number,
  gst: Number,
  total: Number,
  status: { type: String, enum: ['pending', 'preparing', 'ready', 'done'], default: 'pending' },
  kotPrinted: { type: Boolean, default: false },
  billPrinted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
