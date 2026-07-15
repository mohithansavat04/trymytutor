const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Distributed', 'Accepted', 'Rejected', 'Demo Scheduled', 'Converted', 'Lost'], default: 'Distributed' },
  bidAmount: { type: Number },
  distributedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
