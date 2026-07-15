const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  batchSize: { type: Number, default: 10 },
  batchInterval: { type: String, default: '60 min' },
  concurrentDemoCap: { type: Number, default: 5 },
  rescheduleCutoff: { type: String, default: '60 min' },
  platformFeePercentage: { type: Number, default: 10 },
  autoBidDelay: { type: Number, default: 5 },
  averagePriceCalculation: { type: String, enum: ['Mean', 'Median'], default: 'Mean' },
  leadTierTriggerTimer: { type: Number, default: 60 },
  leadInitialTutors: { type: Number, default: 10 },
  leadBatchSteps: { type: Number, default: 10 },
  baseTravelLimit: { type: Number, default: 7 },
  overMileageSurcharge: { type: Number, default: 50 },
  baseDemoCharge: { type: Number, default: 200 },
  autoBidEngineActive: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
