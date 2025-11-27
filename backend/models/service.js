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
            return Math.ceil((this.originalPrice / this.maxUsers) * 1.1);
        }
    },

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

serviceSchema.pre('save', function(next) {
    if (!this.rentalPrice && this.originalPrice && this.maxUsers) {
        this.rentalPrice = Math.ceil((this.originalPrice / this.maxUsers) * 1.1);
    }
    
    this.availableSlots = this.maxUsers - this.currentUsers;
    
    next();
});

serviceSchema.index({ providerId: 1 });
serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ serviceStatus: 1 });
serviceSchema.index({ availableSlots: 1 });

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
