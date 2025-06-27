const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  isActive: { type: Boolean, default: true },
  sortOrder: Number,

  createdAt: { type: Date, default: Date.now }
});

categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

const Category = mongoose.model("category", categorySchema);
module.exports = Category;
