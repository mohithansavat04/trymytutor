const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { type: String, enum: ['Aadhaar', 'PAN', 'PAN Card', 'Passport', 'Driving License', 'Academic Certificate'], required: true },
  documentNumber: { type: String, required: true },
  documentUrl: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
  rejectionReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  reviewedAt: { type: Date },
  reviewerNotes: {
    type: String,
    default: ''
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Kyc', kycSchema);
