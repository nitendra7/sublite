const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Sync Clerk user with backend
router.post('/auth/clerk-sync', async (req, res) => {
  try {
    const { clerkUserId, email, name, profileImage } = req.body;

    if (!clerkUserId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Clerk user data'
      });
    }

    // Check if user already exists by Clerk ID or email
    let user = await User.findOne({
      $or: [
        { clerkUserId: clerkUserId },
        { email: email }
      ]
    });

    if (user) {
      // Update existing user with Clerk data (preserve custom name)
      user.clerkUserId = clerkUserId;
      // Don't overwrite name - user may have customized it
      user.profileImage = profileImage || user.profileImage;
      user.isActive = true;
      user.isEmailVerified = true; // Clerk handles email verification
      user.isSocialLogin = true; // Mark as social login
      await user.save();
    } else {
      // Create new user from Clerk data
      user = new User({
        clerkUserId,
        email,
        name: name || 'User',
        username: email.split('@')[0], // Generate username from email
        profileImage,
        isActive: true,
        isEmailVerified: true,
        isSocialLogin: true,
        role: 'client' // Default role
      });
      await user.save();
    }

    // Generate your backend JWT token
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        clerkUserId: user.clerkUserId
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    // Return user data and token for frontend
    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        role: user.role,
        clerkUserId: user.clerkUserId
      }
    });

  } catch (error) {
    console.error('❌ Clerk sync error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user with backend',
      error: error.message
    });
  }
});

module.exports = router;