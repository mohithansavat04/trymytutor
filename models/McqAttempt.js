const mongoose = require('mongoose');

const mcqAttemptSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  score: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('McqAttempt', mcqAttemptSchema);
