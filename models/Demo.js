const mongoose = require('mongoose');

const demoSchema = new mongoose.Schema({
  requirement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requirement',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Demo', demoSchema);
