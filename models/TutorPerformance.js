const mongoose = require('mongoose');

const tutorPerformanceSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cumulativeHours: {
    type: Number,
    default: 0
  },
  activeContracts: {
    type: Number,
    default: 0
  },
  lifetimeDisputes: {
    type: Number,
    default: 0
  },
  completionRatio: {
    type: Number,
    default: 100 // Out of 100
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('TutorPerformance', tutorPerformanceSchema);
