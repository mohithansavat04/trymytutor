const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['Student / Parent', 'Tutor'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Suspended'],
    default: 'Active'
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  otp: {
    type: String,
    default: ''
  },
  otpExpires: {
    type: Date
  },
  subjects: {
    type: String,
    default: ''
  },
  classes: {
    type: [String],
    default: []
  },
  board: {
    type: String,
    default: ''
  },
  availability: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  // Tutor specific fields
  experience: {
    type: Number,
    default: 0
  },
  mcqScore: {
    type: String,
    default: ''
  },
  tutorState: {
    type: String,
    enum: ['Interview pending', 'Live', 'In-house', 'MCQ Failed', 'Suspended'],
    default: 'Interview pending'
  },
  radius: {
    type: Number,
    default: 5
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  availabilityGrid: {
    type: String,
    default: ''
  },
  notifications: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
