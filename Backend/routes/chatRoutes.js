const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models (you'll need to create these)
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Authentication middleware (you already have this)
const { protect } = require('../middleware/auth');

// ========== SELLER ENDPOINTS ==========

// GET /api/buyer/sellers - Get all sellers (for buyers)
router.get('/sellers', protect, async (req, res) => {
  try {
    // Only allow buyers to access this
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only buyers can view sellers.' 
      });
    }

    // Find all users with role 'seller' who are active
    const sellers = await User.find({ 
      role: 'seller',
      isActive: { $ne: false } // Assuming you have an isActive field
    }).select('_id name email businessName storeName avatar logo location rating productsCount');

    // Get product counts for each seller
    const Product = require('../models/Product');
    const sellersWithCounts = await Promise.all(sellers.map(async (seller) => {
      const productsCount = await Product.countDocuments({ sellerId: seller._id });
      return {
        ...seller.toObject(),
        productsCount
      };
    }));

    res.json({
      success: true,
      data: sellersWithCounts
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========== CONVERSATION ENDPOINTS ==========

// GET /api/buyer/messages/conversations - Get all conversations for current user
router.get('/messages/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    
    if (userRole === 'buyer') {
      query = { buyer: userId };
    } else if (userRole === 'seller') {
      query = { seller: userId };
    }

    const conversations = await Conversation.find(query)
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name businessName storeName avatar logo')
      .populate('lastMessage.sender', 'name')
      .sort('-updatedAt');
    
    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => {
      const unreadCount = conv.unreadCount || 0;
      return {
        ...conv.toObject(),
        unreadCount
      };
    });

    res.json({
      success: true,
      data: conversationsWithUnread
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

    // Validate seller exists
    const seller = await User.findOne({ _id: sellerId, role: 'seller' });
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found' 
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      buyer: buyerId,
      seller: sellerId
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [
          { userId: buyerId, role: 'buyer', lastRead: new Date() },
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
        text: initialMessage || 'Hello, I would like to chat about your products',
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
      data: populatedConversation,
      message: conversation ? 'Conversation already exists' : 'New conversation created'
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/buyer/messages/conversations/:conversationId - Get messages for a conversation
router.get('/messages/conversations/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { buyer: userId },
        { seller: userId }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

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
    const { conversationId, text } = req.body;
    const senderId = req.user._id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { buyer: senderId },
        { seller: senderId }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

    const message = new Message({
      conversationId,
      sender: senderId,
      text,
      read: false,
      delivered: true
    });
    
    await message.save();

    // Determine receiver (for unread count)
    const receiverId = conversation.buyer.toString() === senderId.toString() 
      ? conversation.seller 
      : conversation.buyer;

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

// PUT /api/buyer/messages/conversations/:conversationId/read - Mark conversation as read
router.put('/messages/conversations/:conversationId/read', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { buyer: userId },
        { seller: userId }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

    // Mark all messages as read
    await Message.updateMany(
      { 
        conversationId, 
        read: false,
        sender: { $ne: userId } // Don't mark own messages as read
      },
      { read: true }
    );

    // Reset unread count
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