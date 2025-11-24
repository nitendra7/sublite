const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      sparse: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: String,

    // Password required only if NOT a social login
    password: {
      type: String,
      required: function () {
        return !this.isSocialLogin;
      },
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
        start: { type: String, default: "09:00" },
        end: { type: String, default: "12:00" },
      },
      timezone: { type: String, default: "UTC" },
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
      default: null,
    },
    resetOtpExpires: {
      type: Date,
      default: null,
    },

    signupOtp: {
      type: String,
      default: null,
    },
    signupOtpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);


userSchema.index({ email: 1 }, { unique: true }); // Unique email constraint
// userSchema.index({ username: 1 }, { unique: true, sparse: true }); // Unique username constraint - commented to avoid duplicates
// userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true }); // Unique firebaseUid constraint - commented to avoid duplicates
userSchema.index({ isProvider: 1 }); // Provider lookup index

// OTP-related indexes for improved query performance
userSchema.index({ resetOtp: 1 }); // Index for password reset OTP lookup
userSchema.index({ resetOtpExpires: 1 }); // Index for expired OTP cleanup queries
userSchema.index({ email: 1, resetOtp: 1 }); // Compound index for password reset verification
userSchema.index({ signupOtpExpires: 1 }); // Index for expired signup OTP cleanup queries
userSchema.index({ email: 1, signupOtp: 1 }); // Compound index for signup OTP verification

// Password hashing hook
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password && !this.isSocialLogin) {
    // Check if password is already a bcrypt hash to prevent double-hashing
    const isBcryptHash = /^\$2[abyab]\$\d{1,2}\$/.test(this.password);
    if (!isBcryptHash) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

// PendingUser model for signup OTP verification
const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, trim: true, lowercase: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    signupOtp: { type: String, required: true },
    signupOtpExpires: { type: Date, required: true },
  },
  { timestamps: true },
);

// OTP-related indexes for PendingUser model
pendingUserSchema.index({ signupOtpExpires: 1 }); // Index for expired OTP cleanup queries
pendingUserSchema.index({ email: 1, signupOtp: 1 }); // Compound index for signup OTP verification

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

module.exports = { User, PendingUser };
