// controllers/authController.js

const { User, PendingUser } = require("../models/user");
const RefreshToken = require("../models/refreshtoken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const crypto = require("crypto");
const {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
} = require("../utils/errors");
const logger = require("../utils/logger");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Email helper function
const sendEmail = async (to, subject, text) => {
  try {
    if (process.env.NODE_ENV === "production" && process.env.RESEND_API_KEY) {
      // Use Resend API only in production (to bypass Render's SMTP blocking)
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const result = await resend.emails.send({
        from: 'Sublite <onboarding@resend.dev>', // Use sandbox domain
        to: [to],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2bb6c4;">Sublite</h2>
            <p>${text}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This email was sent from Sublite. If you didn't request this, please ignore it.
            </p>
          </div>
        `,
      });
      console.log('Email sent via Resend:', result.data?.id);
      return result;
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use nodemailer in development
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent via Gmail:', result.messageId);
      return result;
    } else {
      console.error('Email configuration missing - no EMAIL_USER/EMAIL_PASS or RESEND_API_KEY provided');
      throw new Error('Email service not configured');
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// These functions handle manual email/password registration, login, token refreshing, and logout.

exports.register = async (req, res, next) => {
  try {
    logger.info('=== REGISTER FUNCTION START ===');
    logger.info('Request body received:', {
      hasName: !!req.body.name,
      hasUsername: !!req.body.username,
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
      passwordLength: req.body.password ? req.body.password.length : 0
    });

    let { name, username, email, password } = req.body;
    logger.info('Input validation starting...');

    name = name.trim();
    username = username.toLowerCase().trim();
    email = email.toLowerCase().trim();
    // Password should not be trimmed since validation already ensures no whitespace
    const trimmedPassword = password;

    logger.info('Input trimmed:', { name, username, email, passwordLength: password.length });

    logger.info('Checking existing users...');
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });
    logger.info('Existing user check completed:', {
      userFound: !!existingUser,
      existingUserEmail: existingUser?.email,
      existingUserUsername: existingUser?.username
    });

    if (existingUser) {
      logger.warn('User already exists with email/username:', { email, username });
      throw new ConflictError(
        "A user with this email or username already exists.",
      );
    }
    logger.info('Checking existing pending users...');
    const existingPending = await PendingUser.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });
    logger.info('Existing pending user check completed:', {
      pendingFound: !!existingPending,
      pendingUserEmail: existingPending?.email,
      pendingUserUsername: existingPending?.username
    });

    if (existingPending) {
      logger.info('Removing old pending user record...');
      await PendingUser.deleteOne({ _id: existingPending._id }); // Remove old pending signup for this email/username
      logger.info('Old pending user record removed successfully');
    }

    // Generate OTP
    logger.info('Generating OTP...');
    const otp = (await crypto.randomInt(100000, 999999)).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    logger.info('OTP generated:', { otp, expiresAt: otpExpires });

    // Hash password before storing in PendingUser
    logger.info('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    logger.info('Password hashed successfully');

    logger.info('Creating pending user object...');
    const pendingUser = new PendingUser({
      name,
      username,
      email,
      password: hashedPassword,
      signupOtp: otp,
      signupOtpExpires: otpExpires,
    });
    logger.info('Pending user object created, saving to database...');
    await pendingUser.save();
    logger.info('Pending user saved to database successfully');

    logger.info('Sending verification email...');
    await sendEmail(
      email,
      "Your Signup OTP",
      `Your OTP for signup is: ${otp}. It will expire in 10 minutes.`
    );
    logger.info('Verification email sent successfully');

    logger.info('=== REGISTER FUNCTION SUCCESS ===');
    res.status(201).json({
      message:
        "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (err) {
    logger.error('=== REGISTER FUNCTION ERROR ===');
    logger.error('Error occurred in register function:', {
      error: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      statusCode: err.statusCode
    });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const emailOrUsername =
      (
        req.body.emailOrUsername ||
        req.body.email ||
        req.body.username
      )?.trim() || "";
    const { password } = req.body;
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });
    if (!user) {
      logger.warn(`Login failed: User not found for ${emailOrUsername}`);
      throw new AuthenticationError(
        "Invalid credentials. If you recently reset your password, please check your email and try again.",
      );
    }
    // Compare password directly without trimming since validation ensures no whitespace
    logger.info(
      `Login attempt for ${user.email || user.username}: password length=${password.length}, hash=${user.password.substring(0, 30)}...`,
    );

    const passwordMatch = await bcrypt.compare(password, user.password);

    // Add backward compatibility for existing users with trimmed passwords
    let finalMatch = passwordMatch;
    if (!passwordMatch) {
      const trimmedMatch = await bcrypt.compare(password.trim(), user.password);
      if (trimmedMatch) {
        logger.info(
          `Login successful with trimmed password for ${user.email || user.username} - user should reset password`,
        );
        finalMatch = true;
      }
    }

    if (!finalMatch) {
      logger.warn(
        `Login failed: Password mismatch for ${user.email || user.username} - tried both direct and trimmed comparison`,
      );
      throw new AuthenticationError(
        "Invalid credentials. If you're having trouble logging in, try resetting your password using the 'Forgot Password' link.",
      );
    }

    if (!user.isVerified) {
      throw new AuthorizationError(
        "Account not verified. Please verify your email before logging in.",
      );
    }

    if (!user.isActive) {
      throw new AuthorizationError("Your account has been deactivated.");
    }

    const newRefreshToken = uuidv4();
    const refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await RefreshToken.deleteOne({ userId: user._id });
    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: new Date(refreshTokenExpiry),
    });

    const accessTokenPayload = {
      userId: user._id,
      id: user._id, // Keep both for backward compatibility
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
      tokenType: "custom_jwt",
    };
    const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isProvider: user.isProvider,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    console.log('🔄 Refresh token request received:', {
      hasRefreshToken: !!refreshToken,
      tokenPreview: refreshToken ? refreshToken.substring(0, 10) + '...' : 'none'
    });

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      console.error('❌ Refresh token not found in database');
      throw new AuthenticationError(
        "Invalid or expired refresh token. Please log in again.",
      );
    }

    console.log('✓ Refresh token found in database, checking expiry...');

    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
      console.error('❌ Refresh token has expired:', storedToken.expiresAt);
      await RefreshToken.deleteOne({ token: refreshToken });
      throw new AuthenticationError(
        "Refresh token expired. Please log in again.",
      );
    }

    console.log('✓ Refresh token is valid, looking up user...');

    const user = await User.findById(storedToken.userId);
    if (!user) {
      console.error('❌ User not found for refresh token userId:', storedToken.userId);
      await RefreshToken.deleteOne({ token: refreshToken });
      throw new AuthenticationError(
        "User not found for this refresh token. Please log in again.",
      );
    }

    console.log('✓ User found, generating new tokens...');

    await RefreshToken.deleteOne({ token: refreshToken });
    const newRefreshToken = uuidv4();
    const newRefreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: new Date(newRefreshTokenExpiry),
    });

    const newAccessTokenPayload = {
      userId: user._id,
      id: user._id, // Keep both for backward compatibility
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
      tokenType: "custom_jwt",
    };
    const newAccessToken = jwt.sign(
      newAccessTokenPayload,
      ACCESS_TOKEN_SECRET,
      { expiresIn: "8h" },
    );

    console.log('✓ New tokens generated successfully for user:', user._id);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('❌ Refresh token error:', err.message);
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await RefreshToken.deleteOne({ token: refreshToken });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const emailOrUsername = req.body.email || req.body.username;
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });
    if (!user) {
      throw new NotFoundError("No user found with this email or username.");
    }
    if (!user.isVerified) {
      throw new ValidationError(
        "Account not verified. Please complete signup verification first.",
      );
    }

    // Generate OTP
    const otp = (await crypto.randomInt(100000, 999999)).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      user.email,
      "Sublite Password Reset OTP",
      `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
    );

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const pendingUser = await PendingUser.findOne({
      email: email.toLowerCase(),
    });
    if (!pendingUser) {
      throw new NotFoundError("No pending registration found for this email.");
    }
    if (pendingUser.signupOtp !== otp) {
      throw new ValidationError("Invalid OTP.");
    }
    if (pendingUser.signupOtpExpires < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      throw new ValidationError("OTP expired. Please register again.");
    }
    // Create real user
    const newUser = new User({
      name: pendingUser.name,
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password, // Already hashed, pre-save hook will detect this
      isVerified: true,
    });
    await newUser.save();
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Instant login support
    if (req.body.instantLogin === true) {
      const newRefreshToken = uuidv4();
      const refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

      await RefreshToken.deleteOne({ userId: newUser._id });
      await RefreshToken.create({
        token: newRefreshToken,
        userId: newUser._id,
        expiresAt: new Date(refreshTokenExpiry),
      });

      const accessTokenPayload = {
        userId: newUser._id,
        id: newUser._id,
        username: newUser.username,
        isProvider: newUser.isProvider,
        isAdmin: newUser.isAdmin,
        tokenType: "custom_jwt",
      };
      const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, {
        expiresIn: "8h",
      });

      return res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          isProvider: newUser.isProvider,
          isAdmin: newUser.isAdmin,
        },
      });
    }

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    // Password should not be trimmed since validation already ensures no whitespace
    const passwordToHash = newPassword;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError("No user found with this email.");
    }
    if (!user.isVerified) {
      throw new ValidationError(
        "Account not verified. Please complete signup verification first.",
      );
    }
    if (!user.resetOtp || !user.resetOtpExpires) {
      throw new ValidationError("OTP not requested.");
    }
    if (user.resetOtp !== otp) {
      throw new ValidationError("Invalid OTP.");
    }
    if (user.resetOtpExpires < Date.now()) {
      throw new ValidationError("OTP expired.");
    }
    const hashedPassword = await bcrypt.hash(passwordToHash, 12);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();
    res.json({ message: "Password reset successful." });
  } catch (err) {
    next(err);
  }
};

exports.verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError("No user found with this email.");
    }
    if (!user.isVerified) {
      throw new ValidationError(
        "Account not verified. Please complete signup verification first.",
      );
    }
    if (!user.resetOtp || !user.resetOtpExpires) {
      throw new ValidationError("OTP not requested.");
    }
    if (user.resetOtp !== otp) {
      throw new ValidationError("Invalid OTP.");
    }
    if (user.resetOtpExpires < Date.now()) {
      throw new ValidationError("OTP expired.");
    }
    res.json({ message: "OTP verified. You can now reset your password." });
  } catch (err) {
    next(err);
  }
};
