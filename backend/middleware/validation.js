const logger = require("../utils/logger");
const Joi = require("joi");
const { ValidationError } = require("../utils/errors");

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
  }),
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(6).pattern(/^\S*$/).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.pattern.base":
      "Password cannot contain spaces or whitespace characters",
  }),
});

const loginSchema = Joi.object({
  emailOrUsername: Joi.string().required().messages({
    "string.empty": "Email or username is required",
  }),
  password: Joi.string().pattern(/^\S*$/).required().messages({
    "string.empty": "Password is required",
    "string.pattern.base":
      "Password cannot contain spaces or whitespace characters",
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token is required",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().messages({
    "string.email": "Please provide a valid email address",
  }),
  username: Joi.string(),
}).or("email", "username");

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
  }),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
  }),
  newPassword: Joi.string().min(6).pattern(/^\S*$/).required().messages({
    "string.empty": "New password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.pattern.base":
      "Password cannot contain spaces or whitespace characters",
  }),
});

// Validation middleware function
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      logger.warn(`Validation failed for ${req.path}: ${errorMessage}`);
      throw new ValidationError(errorMessage);
    }

    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
};
