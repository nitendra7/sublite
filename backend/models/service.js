const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    categoryId: { type: mongoose.Schema.ObjectId, ref: 'Category' }, // ADDED

    serviceName: { type: String, required: true },
    serviceType: { type: String, required: true },
    description: String,

    originalPrice: { type: Number, required: true },
    rentalPrice: { 
        type: Number,
        default: function() {
            // Calculate fair rental price: (originalPrice / maxUsers) with a small markup
            return Math.ceil((this.originalPrice / this.maxUsers) * 1.1);
        }
    },
    // rentalDuration will be set by buyers when they purchase, not by providers

    maxUsers: { type: Number, required: true },
    currentUsers: { type: Number, default: 0 },
    availableSlots: {
        type: Number,
        default: function () {
            return this.maxUsers - this.currentUsers;
        }
    },

    features: [String],
    credentials: {
        username: String,
        password: String,
        profileName: String
    },
    accessInstructionsTemplate: String,
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

// Pre-save middleware to calculate rental price and available slots
serviceSchema.pre('save', function(next) {
    // Calculate rental price if not set
    if (!this.rentalPrice && this.originalPrice && this.maxUsers) {
        this.rentalPrice = Math.ceil((this.originalPrice / this.maxUsers) * 1.1);
    }
    
    // Update available slots
    this.availableSlots = this.maxUsers - this.currentUsers;
    
    next();
});

serviceSchema.index({ providerId: 1 });
serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ serviceStatus: 1 });
serviceSchema.index({ availableSlots: 1 });

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
