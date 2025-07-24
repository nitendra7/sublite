const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        unique: true, // Enable unique constraint for usernames
        sparse: true, // Allow null values to be non-unique (for users without usernames)
    },
    
    email: { 
        type: String, 
        required: true, 
        trim: true, 
        lowercase: true,
        unique: true // Ensure email uniqueness across all users
    },
    
    phone: String,

    // Password required only if NOT a social login
    password: {
        type: String,
        required: function() { return !this.isSocialLogin; }
    },

    isProvider: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    profilePicture: String,

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },

    providerSettings: {
        activeHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '12:00' },
        },
        timezone: { type: String, default: 'UTC' }
    },
    providerSettingsCompleted: { type: Boolean, default: false },

    businessName: String,
    businessDescription: String,

    // Social login flag
    isSocialLogin: {
        type: Boolean,
        default: false,
    },

    // Firebase UID for social login users (nullable for manual users)
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
    },

    // Refresh token fields (optional, based on your auth strategy)
    refreshToken: {
        type: String,
    },
    refreshTokenExpiry: {
        type: Date,
    },

}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isProvider: 1 });
userSchema.index({ firebaseUid: 1 });  // Enable firebaseUid index for fast Firebase user lookups

// Password hashing hook
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password && !this.isSocialLogin) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
