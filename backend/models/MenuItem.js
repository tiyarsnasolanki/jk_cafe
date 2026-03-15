const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, default: true },
  branchId: { type: String, default: 'all' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
