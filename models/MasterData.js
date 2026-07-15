const mongoose = require('mongoose');

const masterDataSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['subject', 'class', 'board', 'school'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Prevent duplicate names within the same type
masterDataSchema.index({ type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('MasterData', masterDataSchema);
