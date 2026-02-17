const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/buyer/sellers - Get all sellers
router.get('/sellers', protect, async (req, res) => {
  try {
    // Find all users with role 'seller' who are active
    const sellers = await User.find({ 
      role: 'seller',
      isActive: true 
    }).select('name email businessName storeName avatar logo location rating productsCount');
    
    res.json({
      success: true,
      data: sellers
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/buyer/messages/conversations - Get all conversations for a buyer
router.get('/messages/conversations', protect, async (req, res) => {
  try {
    const buyerId = req.user._id;
    
    const conversations = await Conversation.find({
      buyer: buyerId
    })
    .populate('seller', 'name businessName storeName avatar logo')
    .populate('lastMessage.sender', 'name')
    .sort('-updatedAt');
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/buyer/messages/conversations - Create new conversation
router.post('/messages/conversations', protect, async (req, res) => {
  try {
    const { sellerId, initialMessage } = req.body;
    const buyerId = req.user._id;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      buyer: buyerId,
      seller: sellerId
    });
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [
          { userId: buyerId, role: 'buyer' },
          { userId: sellerId, role: 'seller' }
        ],
        buyer: buyerId,
        seller: sellerId,
        unreadCount: 1
      });
      
      await conversation.save();
      
      // Create first message
      const message = new Message({
        conversationId: conversation._id,
        sender: buyerId,
        text: initialMessage || 'Hello, I would like to chat',
        read: false,
        delivered: true
      });
      
      await message.save();
      
      // Update conversation with last message
      conversation.lastMessage = {
        text: message.text,
        sender: message.sender,
        createdAt: message.createdAt
      };
      
      await conversation.save();
    }
    
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('seller', 'name businessName storeName avatar logo');
    
    res.json({
      success: true,
      data: populatedConversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/buyer/messages/conversations/:conversationId - Get messages
router.get('/messages/conversations/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort('createdAt');
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/buyer/messages/send - Send a message
router.post('/messages/send', protect, async (req, res) => {
  try {
    const { conversationId, text, receiverId } = req.body;
    const senderId = req.user._id;
    
    const message = new Message({
      conversationId,
      sender: senderId,
      text,
      read: false,
      delivered: true
    });
    
    await message.save();
    
    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: message.text,
        sender: message.sender,
        createdAt: message.createdAt
      },
      updatedAt: new Date(),
      $inc: { unreadCount: 1 }
    });
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar');
    
    res.json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/buyer/messages/conversations/:conversationId/read - Mark as read
router.put('/messages/conversations/:conversationId/read', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await Message.updateMany(
      { conversationId, read: false },
      { read: true }
    );
    
    await Conversation.findByIdAndUpdate(conversationId, {
      unreadCount: 0
    });
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;