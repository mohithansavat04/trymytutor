const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Transferred', 'Processed', 'Rejected'],
    default: 'Pending'
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String,
    upiId: String
  },
  processedAt: {
    type: Date
  },
  remarks: {
    type: String
  },
  txHash: {
    type: String
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
