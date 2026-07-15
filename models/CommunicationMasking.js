const mongoose = require('mongoose');

const communicationMaskingSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  parentMaskedId: {
    type: String,
    required: true
  },
  tutorMaskedId: {
    type: String,
    required: true
  },
  virtualExtension: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Severed'],
    default: 'Active'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CommunicationMasking', communicationMaskingSchema);
