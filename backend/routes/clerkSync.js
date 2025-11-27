const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

router.post('/auth/clerk-sync', async (req, res) => {
  try {
    const { clerkUserId, email, name, profileImage } = req.body;

    if (!clerkUserId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Clerk user data'
      });
    }

    let user = await User.findOne({
      $or: [
        { clerkUserId: clerkUserId },
        { email: email }
      ]
    });

    if (user) {
      user.clerkUserId = clerkUserId;
      user.profileImage = profileImage || user.profileImage;
      user.isActive = true;
      user.isEmailVerified = true;
      user.isSocialLogin = true;
      await user.save();
    } else {
      user = new User({
        clerkUserId,
        email,
        name: name || 'User',
        username: email.split('@')[0],
        profileImage,
        isActive: true,
        isEmailVerified: true,
        isSocialLogin: true,
        role: 'client'
      });
      await user.save();
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        clerkUserId: user.clerkUserId
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

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
    console.error('Clerk sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user with backend',
      error: error.message
    });
  }
});

module.exports = router;