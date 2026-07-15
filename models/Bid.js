const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  requirement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requirement',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);
