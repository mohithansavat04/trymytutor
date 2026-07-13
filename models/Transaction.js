const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  purpose: {
    type: String,
    enum: ['recharge', 'tuition_fee', 'demo_fee', 'bidding_fee', 'travel_surcharge', 'cancellation_penalty', 'payout', 'refund'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed'
  },
  referenceId: {
    type: String, // Can be external payment gateway ID or internal reference
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
