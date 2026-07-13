const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  demo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Demo' // Optional, if rating is for a demo
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule' // Optional, if rating is for a specific session
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  reviewText: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
