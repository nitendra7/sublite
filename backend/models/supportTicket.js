const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.ObjectId, ref: 'Booking' },

  subject: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['technical', 'payment', 'service', 'other'] },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },

  messages: [{
    senderId: { type: mongoose.Schema.ObjectId },
    senderType: { type: String, enum: ['user', 'admin'] },
    message: String,
    timestamp: { type: Date, default: Date.now },
    attachments: [String]
  }],

  assignedTo: { type: mongoose.Schema.ObjectId }, // admin user ID

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  resolvedAt: Date
});

supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ bookingId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ createdAt: -1 });

const SupportTicket = mongoose.model("supportTicket", supportTicketSchema);
module.exports = SupportTicket;