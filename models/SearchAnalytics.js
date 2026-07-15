const mongoose = require('mongoose');

const searchAnalyticsSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  radiusChecked: {
    type: Number,
    required: true
  },
  subjectCategory: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries if needed
searchAnalyticsSchema.index({ location: '2dsphere',
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('SearchAnalytics', searchAnalyticsSchema);
