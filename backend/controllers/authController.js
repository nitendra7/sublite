const { User, PendingUser } = require("../models/user");
const RefreshToken = require("../models/refreshtoken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
} = require("../utils/errors");
const logger = require("../utils/logger");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const sendEmail = async (to, subject, text, timeoutMs = 10000) => {
  const emailPromise = (async () => {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Sublite <onboarding@resend.dev>";
    return resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2bb6c4;">Sublite</h2>
          <p style="font-size: 16px; line-height: 1.6;">${text}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from Sublite. If you didn't request this, please ignore it.
          </p>
        </div>
      `,
    });
  })();

  return Promise.race([
    emailPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Email timeout")), timeoutMs)),
  ]);
};

const normalize = (s = "") => s.toString().trim().toLowerCase();

exports.register = async (req, res, next) => {
  try {
    logger.info("=== REGISTER FUNCTION START ===");
    logger.info("Request body received:", {
      hasName: !!req.body.name,
      hasUsername: !!req.body.username,
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
      passwordLength: req.body.password ? req.body.password.length : 0,
    });

    const { name: rawName = "", username: rawUsername = "", email: rawEmail = "", password } = req.body;
    const name = rawName.trim();
    const username = normalize(rawUsername);
    const email = normalize(rawEmail);

    logger.info("Checking existing users...");
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    logger.info("Existing user check completed:", {
      userFound: !!existingUser,
      existingUserEmail: existingUser?.email,
      existingUserUsername: existingUser?.username,
    });
    if (existingUser) throw new ConflictError("A user with this email or username already exists.");

    logger.info("Checking existing pending users...");
    const existingPending = await PendingUser.findOne({
      $or: [{ email }, { username }],
    });
    logger.info("Existing pending user check completed:", {
      pendingFound: !!existingPending,
      pendingUserEmail: existingPending?.email,
      pendingUserUsername: existingPending?.username,
    });
    if (existingPending) {
      await PendingUser.deleteOne({ _id: existingPending._id });
      logger.info("Removed old pending user record");
    }

    logger.info("Generating OTP...");
    const otp = (await crypto.randomInt(100000, 999999)).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    logger.info("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);

    const pendingUser = new PendingUser({
      name,
      username,
      email,
      password: hashedPassword,
      signupOtp: otp,
      signupOtpExpires: otpExpires,
    });
    await pendingUser.save();
    logger.info("Pending user saved");

    logger.info("Sending verification email...");
    try {
      await sendEmail(email, "Your Signup OTP", `Your OTP for signup is: ${otp}. It will expire in 10 minutes.`);
      logger.info("Verification email sent");
    } catch (emailError) {
      logger.error("Failed to send verification email:", emailError.message);

      logger.warn("EMAIL SENDING FAILED - OTP FOR VERIFICATION", {
        email,
        otp,
        expires: otpExpires.toISOString(),
        error: emailError.message
      });

      if (emailError.message && emailError.message.includes("only send testing emails")) {
        logger.warn("TIP: Resend sandbox can only send to your verified email. Either register with your verified email or verify a domain at https://resend.com/domains");
      }
    }

    logger.info("=== REGISTER FUNCTION SUCCESS ===");
    res.status(201).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      email,
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (err) {
    logger.error("=== REGISTER FUNCTION ERROR ===", { message: err.message });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const emailOrUsername = normalize(req.body.emailOrUsername || req.body.email || req.body.username || "");
    const { password } = req.body;
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
    if (!user) throw new AuthenticationError("Invalid credentials. If you recently reset your password, please check your email and try again.");

    logger.info(`Login attempt for ${user.email || user.username}: password length=${password.length}`);
    const passwordMatch = await bcrypt.compare(password, user.password);

    let finalMatch = passwordMatch;
    if (!passwordMatch) {
      const trimmedMatch = await bcrypt.compare(password.trim(), user.password);
      if (trimmedMatch) {
        logger.info(`Login successful with trimmed password for ${user.email || user.username} - user should reset password`);
        finalMatch = true;
      }
    }

    if (!finalMatch) throw new AuthenticationError("Invalid credentials. If you're having trouble logging in, try resetting your password using the 'Forgot Password' link.");

    if (!user.isVerified) throw new AuthorizationError("Account not verified. Please verify your email before logging in.");
    if (!user.isActive) throw new AuthorizationError("Your account has been deactivated.");

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
      id: user._id,
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
      tokenType: "custom_jwt",
    };
    const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: "8h" });

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
    logger.info("🔄 Refresh token request received", { hasRefreshToken: !!refreshToken });

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) throw new AuthenticationError("Invalid or expired refresh token. Please log in again.");

    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token: refreshToken });
      throw new AuthenticationError("Refresh token expired. Please log in again.");
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      await RefreshToken.deleteOne({ token: refreshToken });
      throw new AuthenticationError("User not found for this refresh token. Please log in again.");
    }

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
      id: user._id,
      username: user.username,
      isProvider: user.isProvider,
      isAdmin: user.isAdmin,
      tokenType: "custom_jwt",
    };
    const newAccessToken = jwt.sign(newAccessTokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: "8h" });

    logger.info("✓ New tokens generated successfully", { userId: user._id });
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    logger.error("❌ Refresh token error", { message: err.message });
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
    const emailOrUsername = normalize(req.body.email || req.body.username || "");
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    if (!user) throw new NotFoundError("No user found with this email or username.");
    if (!user.isVerified) throw new ValidationError("Account not verified. Please complete signup verification first.");

    const otp = (await crypto.randomInt(100000, 999999)).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendEmail(user.email, "Sublite Password Reset OTP", `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`);
    } catch (emailError) {
      logger.error("Failed to send password reset email:", emailError.message);

      logger.warn("EMAIL SENDING FAILED - PASSWORD RESET OTP", {
        email: user.email,
        otp,
        expires: new Date(user.resetOtpExpires).toISOString(),
        error: emailError.message
      });
    }

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const pendingUser = await PendingUser.findOne({ email: normalize(email) });
    if (!pendingUser) throw new NotFoundError("No pending registration found for this email.");
    if (pendingUser.signupOtp !== otp) throw new ValidationError("Invalid OTP.");
    if (pendingUser.signupOtpExpires < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      throw new ValidationError("OTP expired. Please register again.");
    }

    const newUser = new User({
      name: pendingUser.name,
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified: true,
    });
    await newUser.save();
    await PendingUser.deleteOne({ _id: pendingUser._id });

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
      const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: "8h" });

      return res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          profilePicture: newUser.profilePicture,
          isProvider: newUser.isProvider,
          isAdmin: newUser.isAdmin,
        },
      });
    }

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: normalize(email) });
    if (!user) throw new NotFoundError("No user found with this email.");
    if (!user.isVerified) throw new ValidationError("Account not verified. Please complete signup verification first.");
    if (!user.resetOtp || !user.resetOtpExpires) throw new ValidationError("OTP not requested.");
    if (user.resetOtp !== otp) throw new ValidationError("Invalid OTP.");
    if (user.resetOtpExpires < Date.now()) throw new ValidationError("OTP expired.");

    user.password = await bcrypt.hash(newPassword, 12);
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
    const user = await User.findOne({ email: normalize(email) });
    if (!user) throw new NotFoundError("No user found with this email.");
    if (!user.isVerified) throw new ValidationError("Account not verified. Please complete signup verification first.");
    if (!user.resetOtp || !user.resetOtpExpires) throw new ValidationError("OTP not requested.");
    if (user.resetOtp !== otp) throw new ValidationError("Invalid OTP.");
    if (user.resetOtpExpires < Date.now()) throw new ValidationError("OTP expired.");

    res.json({ message: "OTP verified. You can now reset your password." });
  } catch (err) {
    next(err);
  }
};
