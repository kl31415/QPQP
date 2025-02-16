// Create new route file items.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/user-items', async (req, res) => {
  try {
    const items = await mongoose.model('Offer').find({
      userId: req.query.userId
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;