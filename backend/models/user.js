const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3
    },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: String,
    password: { type: String, required: true }, // Should be hashed

    isProvider: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    profilePicture: String,

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },

    // Provider-specific settings for availability
    providerSettings: {
        activeHours: {
            // --- UPDATED DEFAULT as per your request ---
            start: { type: String, default: '09:00' }, // 9 AM
            end: { type: String, default: '12:00' },   // 12 PM (Noon)
        },
        timezone: { type: String, default: 'UTC' } // e.g., "Asia/Kolkata"
    },

    // This flag becomes true only after a user explicitly saves their provider settings.
    providerSettingsCompleted: { type: Boolean, default: false },

    businessName: String,
    businessDescription: String,

}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isProvider: 1 });

const User = mongoose.model("user", userSchema);
module.exports = User;
