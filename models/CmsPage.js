const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String, // HTML or Markdown
    required: true
  },
  status: {
    type: String,
    enum: ['Published', 'Draft'],
    default: 'Draft'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CmsPage', cmsPageSchema);
