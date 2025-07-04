const mongoose=require("mongoose")

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    password: { type: String, required: true }, // hashed

    userType: { type: String, enum: ['client', 'provider'], required: true },
    isAdmin: { type: Boolean, default: false },
    profilePicture: String,

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },

  // Provider-specific
    businessName: String,
    businessDescription: String,
    businessCategory: String,
    businessLocation: {
        address: String,
        city: String,
        state: String,
        pincode: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    }
    },

  // Client-specific
    preferredLocation: {
        city: String,
        state: String
    }

}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userType: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'businessLocation.city': 1 });

const User=mongoose.model("user",userSchema);
module.exports=User;


