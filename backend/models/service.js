const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },

    serviceName: { type: String, required: true },
    serviceType: { type: String, required: true },
    description: String,

    originalPrice: { type: Number, required: true },
    rentalPrice: { type: Number, required: true },
    rentalDuration: { type: Number, required: true }, // in days

    maxUsers: { type: Number, required: true },
    currentUsers: { type: Number, default: 0 },
    availableSlots: {
        type: Number,
        default: function () {
            return this.maxUsers;
        }
    },

    features: [String],

    credentials: {
        username: String,
        password: String,
        profileName: String
    },

    serviceStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },

    subscriptionExpiry: Date,

    images: [String],
    terms: String,

    location: {
        city: String,
        state: String,
        country: String
    }

}, { timestamps: true });

serviceSchema.index({ providerId: 1 });
serviceSchema.index({ serviceType: 1 });
serviceSchema.index({ serviceStatus: 1 });
serviceSchema.index({ 'location.city': 1 });
serviceSchema.index({ availableSlots: 1 });
serviceSchema.index({ createdAt: -1 });

const Service = mongoose.model("service", serviceSchema);
module.exports = Service;