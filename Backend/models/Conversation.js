const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['buyer', 'seller'], required: true },
    lastRead: { type: Date, default: Date.now }
  }],
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  },
  unreadCount: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

// Index for faster queries
conversationSchema.index({ buyer: 1, seller: 1 }, { unique: true });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);