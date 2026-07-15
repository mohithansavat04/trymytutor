const mongoose = require('mongoose');

const autoBidLogSchema = new mongoose.Schema({
  requirementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requirement',
    required: true
  },
  calculatedAveragePrice: {
    type: Number,
    required: true
  },
  injectionDelayTimer: {
    type: Number,
    required: true
  },
  executionStatus: {
    type: String,
    enum: ['Pending', 'Dispatched', 'Failed'],
    default: 'Pending'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('AutoBidLog', autoBidLogSchema);
