const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find({ active: true });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const branch = new Branch({ ...req.body, id: req.body.id || 'branch_' + Date.now() });
    await branch.save();
    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const branch = await Branch.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true });
    res.json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Branch.findOneAndUpdate({ id: req.params.id }, { active: false });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed default branch
router.post('/seed', async (req, res) => {
  try {
    const count = await Branch.countDocuments();
    if (count === 0) {
      await Branch.create({ id: 'branch_main', name: 'Main Branch', address: 'Bardoli, Gujarat', phone: '' });
      res.json({ seeded: true });
    } else {
      res.json({ skipped: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
