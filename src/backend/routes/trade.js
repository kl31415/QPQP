const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }],
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true }],
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);