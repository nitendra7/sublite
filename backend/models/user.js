const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Don't forget to require bcryptjs if you use it in pre-save hooks

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: {
        type: String,
        required: true,
        //unique: true,
        trim: true,
        lowercase: true,
        minlength: 3
    },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: String,
    // MODIFIED: Password is required only if it's NOT a social login
    password: {
        type: String,
        required: function() { return !this.isSocialLogin; } // Password not required if isSocialLogin is true
    }, 

    isProvider: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    profilePicture: String, // Already present, good for social logins

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

    // NEW: Fields for Social Login identification
    isSocialLogin: {
      type: Boolean,
      default: false,
    },
    // NEW: Fields for Refresh Token Rotation on the User document (if you choose to store here)
    // Note: The primary storage for refresh tokens should be the RefreshToken model.
    // These fields are more relevant if you're not using a separate RefreshToken model
    // or if you want to store the *current* active token on the user for easy lookup.
    // Your authController.js uses RefreshToken model, so these might be redundant on User,
    // but useful if you plan a mixed approach or a different refresh token strategy.
    // For now, let's include them as they were discussed previously on the user model level.
    // They are not directly used by the current `authController.js`'s refresh token handling
    // as that controller relies on the separate `RefreshToken` model.
    // If you intend to use the RefreshToken model as the *sole* source of truth for refresh tokens,
    // you can remove these two fields from the User model.
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

// Pre-save hook for password hashing (only if password is provided and modified, and not a social login)
userSchema.pre('save', async function (next) {
  // Only hash if the password field is modified AND it's not a social login (no password provided by user)
  if (this.isModified('password') && this.password && !this.isSocialLogin) { //
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("User", userSchema); 
module.exports = User;
