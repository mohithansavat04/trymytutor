const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  classLevel: {
    type: String,
    required: true
  },
  board: {
    type: String,
    required: true
  },
  daysTime: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Demo Scheduled'],
    default: 'Open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Requirement', requirementSchema);
