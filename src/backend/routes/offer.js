const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  product: { type: String, required: true },
  category: { type: String },
  distance: { type: Number },
  details: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);