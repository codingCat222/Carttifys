const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');           // FIX: Seller is a User with role 'seller'
const { auth } = require('../middleware/auth');   // FIX: was 'protect', correct name is 'auth'

// Get all sellers
router.get('/sellers', auth, async (req, res) => {
  try {
    // FIX: query User model filtering by role instead of missing Seller model
    const sellers = await User.find({ role: 'seller', isActive: true })
      .select('name email businessName businessType profileImage rating isSellerVerified');
    
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
router.get('/messages/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversations = await Conversation.find({
      $or: [
        { 'participants.userId': userId },
        { buyer: userId },
        { seller: userId }
      ]
    })
    .populate('buyer', 'name email profileImage')
    .populate('seller', 'name businessName profileImage')
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
router.post('/messages/conversations', auth, async (req, res) => {
  try {
    const { sellerId, initialMessage } = req.body;
    const buyerId = req.user._id;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      buyer: buyerId,
      seller: sellerId
    });
    
    if (!conversation) {
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
      
      const message = new Message({
        conversationId: conversation._id,
        sender: buyerId,
        text: initialMessage || 'Hello, I would like to chat',
        read: false,
        delivered: true
      });
      
      await message.save();
      
      conversation.lastMessage = {
        text: message.text,
        sender: message.sender,
        createdAt: message.createdAt
      };
      
      await conversation.save();
    }
    
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('buyer', 'name email profileImage')
      .populate('seller', 'name businessName profileImage');
    
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
router.get('/messages/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name profileImage')
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
router.post('/messages/send', auth, async (req, res) => {
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
      .populate('sender', 'name profileImage');
    
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
router.put('/messages/read/:conversationId', auth, async (req, res) => {
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