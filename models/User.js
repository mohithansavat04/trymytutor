const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'User',
  },
  email: {
    type: String,
    sparse: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['Student / Parent', 'Tutor'],
    required: true
  },
  status: { type: String, enum: ['Active', 'Inactive', 'Pending', 'Banned'], default: 'Active' },
  isDeleted: { type: Boolean, default: false },
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
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Not Specified'],
    default: 'Not Specified'
  },
  age: {
    type: Number,
    default: null
  },
  classLevel: {
    type: String,
    default: ''
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
    enum: ['Pending', 'Interview Passed', 'Live', 'Rejected', 'Interview pending', 'In-house', 'MCQ Failed', 'Suspended'],
    default: 'Pending'
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
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
