const mongoose = require('mongoose');

const demoCancellationSchema = new mongoose.Schema({
  demoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Demo',
    required: true
  },
  cancelingRole: {
    type: String,
    enum: ['Parent', 'Tutor'],
    required: true
  },
  timeDeltaMinutes: {
    type: Number,
    required: true
  },
  penaltyAssessed: {
    type: Boolean,
    default: false
  },
  waiverIssued: {
    type: Boolean,
    default: false
  },
  walletRef: {
    type: String
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('DemoCancellation', demoCancellationSchema);
