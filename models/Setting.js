const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  batchSize: { type: Number, default: 10 },
  batchInterval: { type: String, default: '60 min' },
  autoBidDelay: { type: String, default: '2-3 min' },
  concurrentDemoCap: { type: Number, default: 5 },
  rescheduleCutoff: { type: String, default: '60 min' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
