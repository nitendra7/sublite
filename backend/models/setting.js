const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed,
  description: String,

  updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

settingSchema.index({ key: 1 }, { unique: true });

const Setting = mongoose.model("setting", settingSchema);
module.exports = Setting;