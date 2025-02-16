const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['text', 'trade'], default: 'text' },
  tradeOffer: {
    itemId: { type: String },
    itemName: { type: String },
    senderId: { type: String },
    recipientId: { type: String }
  }
});

module.exports = mongoose.model('Message', messageSchema);