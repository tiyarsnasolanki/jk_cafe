const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders - optionally filter by branchId
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const d = new Date(req.query.date);
      d.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      filter.createdAt = { $gte: d, $lte: end };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update order
router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    await Order.deleteOne({ id: req.params.id });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Today's stats per branch
router.get('/stats/today', async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    const filter = { createdAt: { $gte: start, $lte: end } };
    if (req.query.branchId) filter.branchId = req.query.branchId;

    const orders = await Order.find(filter);
    const revenue = orders.reduce((s, o) => s + (o.total||0), 0);
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    res.json({
      count: orders.length,
      revenue,
      avg: orders.length ? Math.round(revenue / orders.length) : 0,
      pending,
      preparing
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Date-range report (for Excel export)
router.get('/report/range', async (req, res) => {
  try {
    const { from, to, branchId } = req.query;
    const start = new Date(from); start.setHours(0,0,0,0);
    const end   = new Date(to);   end.setHours(23,59,59,999);
    const filter = { createdAt: { $gte: start, $lte: end }, status: 'done' };
    if (branchId && branchId !== 'all') filter.branchId = branchId;
    const orders = await Order.find(filter).sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
