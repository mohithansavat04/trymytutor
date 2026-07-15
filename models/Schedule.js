const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // e.g. "14:00"
    required: true
  },
  endTime: {
    type: String, // e.g. "15:00"
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  },
  attendanceStatus: {
    type: String,
    enum: ['Pending', 'Present', 'Absent'],
    default: 'Pending'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
