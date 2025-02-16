const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// POST /accept-trade - Handle trade completion
router.post('/', async (req, res) => {
  try {
    const { senderOfferId, recipientUserId, senderUserId } = req.body;

    // Validate input
    if (!senderOfferId || !recipientUserId || !senderUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Verify both items exist
    const [senderOffer, recipientOffer] = await Promise.all([
      mongoose.model('Offer').findById(senderOfferId),
      mongoose.model('Offer').findOne({ userId: recipientUserId })
    ]);

    if (!senderOffer) {
      return res.status(404).json({ error: 'Sender offer not found' });
    }
    if (!recipientOffer) {
      return res.status(404).json({ error: 'Recipient does not have an item available for trade' });
    }

    // 2. Delete both items from the database
    await Promise.all([
      mongoose.model('Offer').deleteOne({ _id: senderOfferId }),
      mongoose.model('Offer').deleteOne({ _id: recipientOffer._id })
    ]);

    // 3. Create trade record
    const trade = new mongoose.model('Trade')({
      participants: [senderUserId, recipientUserId],
      items: [senderOfferId, recipientOffer._id],
      completedAt: new Date()
    });
    await trade.save();

    // 4. Send confirmation messages to both users
    const message = new mongoose.model('Message')({
      text: `Trade completed between ${senderOffer.product} and ${recipientOffer.product}`,
      sender: 'system',
      recipients: [senderUserId, recipientUserId],
      type: 'text'
    });
    await message.save();

    res.json({ success: true, trade });

  } catch (error) {
    console.error('Trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;