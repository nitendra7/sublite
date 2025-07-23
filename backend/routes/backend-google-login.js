// routes/auth.js (or authRoutes.js)

// 1. Ensure you have these packages installed:
//    npm install google-auth-library jsonwebtoken bcryptjs uuidv4 (or any UUID generator)

const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // For generating unique refresh tokens

// Assuming you have a User model (e.g., Mongoose model)
// This is a placeholder. Replace with your actual User model import and implementation.
const User = {
    // In a real application, this would be your database model (e.g., Mongoose User model).
    // It should have fields like 'email', 'name', 'password', 'refreshToken', 'refreshTokenExpiry'.
    findOne: async (query) => {
        console.log('DB: Searching for user with query:', query);
        // Simulate finding a user by email
        if (query.email === 'testgoogle@example.com') {
            return {
                _id: 'user123google',
                name: 'Test Google User',
                email: 'testgoogle@example.com',
                username: 'testgoogle',
                password: 'hashedpassword_for_sim', // In a real app, this would be a hashed password
                refreshToken: 'some_existing_refresh_token_string_if_any',
                refreshTokenExpiry: Date.now() + (7 * 24 * 60 * 60 * 1000) // Example: 7 days from now
            };
        }
        return null;
    },
    create: async (userData) => {
        console.log('DB: Creating new user:', userData);
        // Simulate creating a user. Ensure generatedPassword is hashed.
        const newUser = {
            _id: `user_${Date.now()}`,
            ...userData,
            password: await bcrypt.hash(userData.password, 10), // Hash the generated password
            createdAt: new Date(),
        };
        return newUser;
    },
    findByIdAndUpdate: async (userId, update, options) => {
        console.log(`DB: Updating user ${userId} with:`, update);
        // Simulate updating a user
        return { _id: userId, ...update.$set }; // Return updated user or part of it
    }
};

// IMPORTANT: Ensure these are loaded from your .env file
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google-login
 * Handles Google ID token verification and user authentication/registration.
 * Now generates and manages refresh tokens.
 *
 * Request Body:
 * {
 * "token": "Google_ID_Token_String"
 * }
 *
 * Response:
 * {
 * "accessToken": "Your_App_JWT",
 * "refreshToken": "Your_App_Refresh_Token"
 * }
 */
router.post('/google-login', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Google ID token is missing.' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ error: 'Google token does not contain an email address.' });
        }

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            // If user doesn't exist, create a new one
            isNewUser = true;
            const generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            user = await User.create({
                name: name || 'Google User',
                email: email,
                username: email.split('@')[0], // Simple username from email, ensure uniqueness
                password: hashedPassword,
                profilePicture: picture,
                isSocialLogin: true,
            });
        }

        // --- Refresh Token Generation & Storage (NEW LOGIC) ---
        const newRefreshToken = uuidv4(); // Generate a unique refresh token
        const refreshTokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // Expires in 7 days (example)

        // Store refresh token and its expiry in the user's document in the database
        await User.findByIdAndUpdate(user._id, {
            $set: {
                refreshToken: newRefreshToken,
                refreshTokenExpiry: new Date(refreshTokenExpiry)
            }
        }, { new: true }); // `new: true` returns the updated document

        // --- Generate Access Token ---
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '15m' } // Access token typically has a short expiry (e.g., 15 minutes)
        );

        // --- Send both tokens to the frontend ---
        res.json({ accessToken, refreshToken: newRefreshToken });

    } catch (error) {
        console.error('Google login backend error:', error);
        if (error.code === 'ERR_INVALID_ARG_VALUE') {
            return res.status(401).json({ error: 'Invalid Google token provided.' });
        }
        res.status(500).json({ error: 'Internal server error during Google login.' });
    }
});

module.exports = router;
