const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g. 'Maths', 'French', 'Guitar'
    unique: true
  },
  type: {
    type: String,
    enum: ['Subject', 'Language', 'Hobby'],
    required: true
  },
  classes: {
    type: [String], // e.g. ['Class 1', 'Class 2', 'Beginner', 'Advanced']
    default: []
  },
  days: {
    type: [String], // e.g. ['Monday', 'Tuesday']
    default: []
  },
  timings: {
    type: [String], // e.g. ['5-6 pm', '10-11 am']
    default: []
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
