const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: true,
    index: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  delivered: { 
    type: Boolean, 
    default: true 
  },
  attachments: [{
    type: { 
      type: String, 
      enum: ['image', 'video', 'file', 'audio'] 
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }]
}, { 
  timestamps: true 
});

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);