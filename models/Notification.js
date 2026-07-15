const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['Info', 'Alert', 'Promotional', 'System'], default: 'Info' },
  channel: { type: String, enum: ['In-App', 'Email', 'SMS', 'Push'], default: 'In-App' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  deliveryStatus: { type: String, enum: ['Sent', 'Failed'] },
  errorLog: { type: String },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
