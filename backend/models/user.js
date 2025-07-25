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
        sparse: true, // Allow null values to be non-unique (for users without usernames)
    },
    
    email: { 
        type: String, 
        required: true, 
        trim: true, 
        lowercase: true
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
        sparse: true,
    },

    // Refresh token fields (optional, based on your auth strategy)
    refreshToken: {
        type: String,
    },
    refreshTokenExpiry: {
        type: Date,
    },

    resetOtp: {
      type: String,
      default: null
    },
    resetOtpExpires: {
      type: Date,
      default: null
    },

    signupOtp: {
      type: String,
      default: null
    },
    signupOtpExpires: {
      type: Date,
      default: null
    },

}, { timestamps: true });

// Create compound and specialized indexes
// Note: These indexes might already exist in the database from previous runs
// If you get duplicate index warnings, the database already has these indexes
userSchema.index({ email: 1 }, { unique: true }); // Unique email constraint
// userSchema.index({ username: 1 }, { unique: true, sparse: true }); // Unique username constraint - commented to avoid duplicates
// userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true }); // Unique firebaseUid constraint - commented to avoid duplicates
userSchema.index({ isProvider: 1 }); // Provider lookup index

// Password hashing hook
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password && !this.isSocialLogin) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

const User = mongoose.model("User", userSchema);

// PendingUser model for signup OTP verification
const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, trim: true, lowercase: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  signupOtp: { type: String, required: true },
  signupOtpExpires: { type: Date, required: true },
}, { timestamps: true });

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports.PendingUser = PendingUser;

module.exports = User;
