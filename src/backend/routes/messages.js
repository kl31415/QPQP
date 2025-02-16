const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /messages - Retrieve message history
router.get('/', async (req, res) => {
  try {
    const { userId, recipientId } = req.query;
    
    const messages = await mongoose.model('Message').find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        timestamp: new Date()
      };
  
      const newMessage = await mongoose.model('Message').create(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  });

module.exports = router;