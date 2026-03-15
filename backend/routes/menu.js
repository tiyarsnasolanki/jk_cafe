const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

const DEFAULT_MENU = [
  { id:'p1', name:'Sada Paper', price:60, category:'Paper' },
  { id:'p2', name:'Cheese Sada Paper', price:120, category:'Paper' },
  { id:'p3', name:'Baby Paper', price:60, category:'Paper' },
  { id:'p4', name:'Cheese Garlic Paper', price:130, category:'Paper' },
  { id:'p5', name:'Schezwan Sada Paper', price:90, category:'Paper' },
  { id:'p6', name:'Cheese Schezwan Sada', price:130, category:'Paper' },
  { id:'p7', name:'Jeera Nylon', price:90, category:'Paper' },
  { id:'p8', name:'Nylon Paper', price:80, category:'Paper' },
  { id:'p9', name:'Cheese Nylon Paper', price:130, category:'Paper' },
  { id:'p10', name:'Baby Nylon Paper', price:80, category:'Paper' },
  { id:'p11', name:'Cheese Baby Nylon', price:130, category:'Paper' },
  { id:'p12', name:'Garlic Nylon', price:90, category:'Paper' },
  { id:'p13', name:'Cheese Garlic Nylon', price:140, category:'Paper' },
  { id:'p14', name:'Chocolate Paper', price:80, category:'Paper' },
  { id:'p15', name:'Cheese Baby Paper', price:120, category:'Paper' },
  { id:'p16', name:'Schezwan Nylon', price:100, category:'Paper' },
  { id:'p17', name:'Cheese Schezwan Nylon', price:140, category:'Paper' },
  { id:'p18', name:'Cheese Chili Garlic Nylon', price:150, category:'Paper' },
  { id:'p19', name:'Limbu Mari Nylon', price:90, category:'Paper' },
  { id:'p20', name:'Cheese Limbu Mari Nylon', price:130, category:'Paper' },
  { id:'p21', name:'Mari Nylon', price:90, category:'Paper' },
  { id:'p22', name:'Cheese Mari Nylon', price:130, category:'Paper' },
  { id:'p23', name:'Jeera Mari Nylon', price:90, category:'Paper' },
  { id:'p24', name:'Cheese Jeera Mari Nylon', price:130, category:'Paper' },
  { id:'p25', name:'Cheese Chocolate Nylon', price:130, category:'Paper' },
  { id:'g1', name:'Mysore', price:140, category:'Gravy Item' },
  { id:'g2', name:'Tawa Mysore', price:180, category:'Gravy Item' },
  { id:'g3', name:'Cheese Mysore', price:200, category:'Gravy Item' },
  { id:'g4', name:'Paneer Surma', price:200, category:'Gravy Item' },
  { id:'g5', name:'Paneer Tukda Mysore', price:200, category:'Gravy Item' },
  { id:'g6', name:'Cheese Paneer Surma', price:250, category:'Gravy Item' },
  { id:'g7', name:'Cheese Paneer Tukda Mysore', price:250, category:'Gravy Item' },
  { id:'g8', name:'Cheese Surma', price:250, category:'Gravy Item' },
  { id:'g9', name:'Cheese Gotalo', price:280, category:'Gravy Item' },
  { id:'g10', name:'Cheese Patra', price:300, category:'Gravy Item' },
  { id:'g11', name:'JK Special Garlic Fry', price:330, category:'Gravy Item' },
  { id:'f1', name:'Masala Dosa', price:100, category:'Fancy Dosa' },
  { id:'f2', name:'Separate Masala Dosa', price:120, category:'Fancy Dosa' },
  { id:'f3', name:'Cheese Masala Dosa', price:180, category:'Fancy Dosa' },
  { id:'f4', name:'Palak Dosa', price:170, category:'Fancy Dosa' },
  { id:'f5', name:'Aloo Paneer Dosa', price:170, category:'Fancy Dosa' },
  { id:'f6', name:'Sweet Corn Dosa', price:170, category:'Fancy Dosa' },
  { id:'f7', name:'Cheese Sweet Corn Dosa', price:200, category:'Fancy Dosa' },
  { id:'f8', name:'Palak Paneer Dosa', price:190, category:'Fancy Dosa' },
  { id:'f9', name:'Cheese Palak Dosa', price:200, category:'Fancy Dosa' },
  { id:'f10', name:'Cheese Palak Paneer', price:220, category:'Fancy Dosa' },
  { id:'f11', name:'Cheese Aloo Palak', price:200, category:'Fancy Dosa' },
  { id:'f12', name:'Paneer Dosa', price:200, category:'Fancy Dosa' },
  { id:'f13', name:'Cheese Paneer Dosa', price:220, category:'Fancy Dosa' },
  { id:'f14', name:'Jini Dosa', price:200, category:'Fancy Dosa' },
  { id:'f15', name:'Mix Dosa', price:220, category:'Fancy Dosa' },
  { id:'f16', name:'Pizza Dosa', price:260, category:'Fancy Dosa' },
  { id:'b1', name:'Special Salad', price:20, category:'Beverages' },
  { id:'b2', name:'Cold Drinks', price:20, category:'Beverages' },
  { id:'b3', name:'Buttermilk', price:20, category:'Beverages' },
  { id:'b4', name:'Water', price:20, category:'Beverages' },
];

// Seed default menu if empty
router.post('/seed', async (req, res) => {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      await MenuItem.insertMany(DEFAULT_MENU.map(i => ({ ...i, available: true, branchId: 'all' })));
      res.json({ seeded: DEFAULT_MENU.length });
    } else {
      res.json({ skipped: true, existing: count });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({ available: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = new MenuItem({ ...req.body, id: req.body.id || 'item_' + Date.now() });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await MenuItem.deleteOne({ id: req.params.id });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.DEFAULT_MENU = DEFAULT_MENU;
