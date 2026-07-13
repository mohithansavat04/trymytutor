const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'At least one option is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Options array cannot be empty'
    }
  },
  correctOptionIndex: {
    type: Number,
    required: [true, 'Correct option index is required'],
    min: [0, 'Index cannot be negative'],
    validate: {
      validator: function(v) {
        return this.options && v < this.options.length;
      },
      message: 'Correct option index is out of bounds'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Mcq', mcqSchema);
