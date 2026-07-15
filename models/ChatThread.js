const mongoose = require('mongoose');

const chatThreadSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messageCount: {
    type: Number,
    default: 0
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Terminated'],
    default: 'Active'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('ChatThread', chatThreadSchema);
