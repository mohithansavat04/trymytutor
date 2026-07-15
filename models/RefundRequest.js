const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remainingBalance: {
    type: Number,
    required: true
  },
  depositLeft: {
    type: Number,
    required: true
  },
  settlementMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Disbursed', 'Rejected'],
    default: 'Pending Review'
  },
  transactionHash: {
    type: String
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
