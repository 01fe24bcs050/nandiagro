const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theme name is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  colors: {
    darkGreen: { type: String, default: '#6FB381' },
    lightGreen: { type: String, default: '#6FB381' },
    golden: { type: String, default: '#6FB381' },
    textPrimary: { type: String, default: '#000000' },
    textSecondary: { type: String, default: '#000000' },
    bgColor: { type: String, default: '#EDEDED' },
    bodyBg: { type: String, default: '#EDEDED' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);
