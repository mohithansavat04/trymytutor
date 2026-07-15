const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorClaimStatus: {
    type: String
  },
  parentObjectionNotes: {
    type: String
  },
  systemEvidenceAttachments: [{
    type: String
  }],
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Settled'],
    default: 'Open'
  },
  internalInvestigationNotes: {
    type: String
  },
  resolution: {
    type: String
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
