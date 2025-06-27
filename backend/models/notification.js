const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking', 'payment', 'reminder', 'promotion'], required: true },

  isRead: { type: Boolean, default: false },

  relatedId: { type: mongoose.Schema.ObjectId },
  relatedType: { type: String, enum: ['booking', 'payment', 'service'] },

  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("notification", notificationSchema);
module.exports = Notification;
