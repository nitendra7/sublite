const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, trim: true, lowercase: true, minlength: 3, sparse: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: String,
    password: {
      type: String,
      required: function () {
        return !this.isSocialLogin;
      }
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
        end: { type: String, default: "12:00" }
      },
      timezone: { type: String, default: "UTC" }
    },
    providerSettingsCompleted: { type: Boolean, default: false },
    businessName: String,
    businessDescription: String,
    isSocialLogin: { type: Boolean, default: false },
    clerkUserId: { type: String, sparse: true },
    refreshToken: { type: String },
    refreshTokenExpiry: { type: Date },
    resetOtp: { type: String, default: null },
    resetOtpExpires: { type: Date, default: null },
    signupOtp: { type: String, default: null },
    signupOtpExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isProvider: 1 });
userSchema.index({ clerkUserId: 1 }, { unique: true, sparse: true });
userSchema.index({ resetOtp: 1 });
userSchema.index({ resetOtpExpires: 1 });
userSchema.index({ email: 1, resetOtp: 1 });
userSchema.index({ signupOtpExpires: 1 });
userSchema.index({ email: 1, signupOtp: 1 });

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password && !this.isSocialLogin) {
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(this.password);
    if (!isBcryptHash) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, trim: true, lowercase: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    signupOtp: { type: String, required: true },
    signupOtpExpires: { type: Date, required: true }
  },
  { timestamps: true }
);

pendingUserSchema.index({ signupOtpExpires: 1 });
pendingUserSchema.index({ email: 1, signupOtp: 1 });

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

module.exports = { User, PendingUser };
