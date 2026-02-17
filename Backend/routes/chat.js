const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Seller = require('../models/Seller');
const { protect } = require('../middleware/auth');

// Get all sellers
router.get('/sellers', protect, async (req, res) => {
  try {
    const sellers = await Seller.find({ isActive: true })
      .populate('userId', 'name email avatar')
      .select('-__v');
    
    res.json({
      success: true,
      data: sellers
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all conversations for a user
router.get('/messages/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversations = await Conversation.find({
      $or: [
        { 'participants.userId': userId },
        { buyer: userId },
        { seller: userId }
      ]
    })
    .populate('buyer', 'name email avatar')
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

// Create new conversation
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
      .populate('buyer', 'name email avatar')
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

// Get messages for a conversation
router.get('/messages/:conversationId', protect, async (req, res) => {
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

// Send a message
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

// Mark conversation as read
router.put('/messages/read/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    await Message.updateMany(
      { conversationId, read: false },
      { read: true }
    );
    
    await Conversation.findByIdAndUpdate(conversationId, {
      unreadCount: 0,
      'participants.$[elem].lastRead': new Date()
    }, {
      arrayFilters: [{ 'elem.userId': userId }]
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