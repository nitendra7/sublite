const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { User, PendingUser } = require('../models/user');
const RefreshToken = require('../models/refreshtoken');

// Create test app
const app = express();
app.use(express.json());

// Import routes
const authRoutes = require('../routes/auth');
app.use('/api/v1/auth', authRoutes);

// Import error handler
const errorHandler = require('../middleware/errorHandler');
app.use(errorHandler);

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await PendingUser.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('OTP sent to your email. Please verify to complete registration.');

      // Check if pending user was created
      const pendingUser = await PendingUser.findOne({ email: userData.email });
      expect(pendingUser).toBeTruthy();
      expect(pendingUser.name).toBe(userData.name);
      expect(pendingUser.username).toBe(userData.username);
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Please provide a valid email address');
    });

    it('should return validation error for missing required fields', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing username and password
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('required');
    });

    it('should return conflict error for existing user', async () => {
      // Create existing user
      await User.create({
        name: 'Existing User',
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'hashedpassword'
      });

      const userData = {
        name: 'John Doe',
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should verify OTP and create user successfully', async () => {
      // Create pending user
      const pendingUser = await PendingUser.create({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashedpassword',
        signupOtp: '123456',
        signupOtpExpires: new Date(Date.now() + 10 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: 'john@example.com',
          otp: '123456'
        })
        .expect(200);

      expect(response.body.message).toBe('Email verified successfully. You can now log in.');

      // Check if user was created
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('John Doe');
      expect(user.isVerified).toBe(true);

      // Check if pending user was removed
      const deletedPendingUser = await PendingUser.findOne({ email: 'john@example.com' });
      expect(deletedPendingUser).toBeNull();
    });

    it('should return error for invalid OTP', async () => {
      await PendingUser.create({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashedpassword',
        signupOtp: '123456',
        signupOtpExpires: new Date(Date.now() + 10 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: 'john@example.com',
          otp: '654321'
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid OTP');
    });

    it('should return error for expired OTP', async () => {
      await PendingUser.create({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashedpassword',
        signupOtp: '123456',
        signupOtpExpires: new Date(Date.now() - 10 * 60 * 1000) // Expired
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: 'john@example.com',
          otp: '123456'
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('OTP expired');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login user successfully', async () => {
      // Create verified user
      const user = await User.create({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fYzYXgjO', // password123
        isVerified: true,
        isActive: true
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          emailOrUsername: 'john@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.name).toBe('John Doe');
      expect(response.body.user.email).toBe('john@example.com');

      // Check if refresh token was created
      const refreshToken = await RefreshToken.findOne({ userId: user._id });
      expect(refreshToken).toBeTruthy();
    });

    it('should return error for invalid credentials', async () => {
      await User.create({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fYzYXgjO',
        isVerified: true,
        isActive: true
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          emailOrUsername: 'john@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return error for unverified account', async () => {
      await User.create({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fYzYXgjO',
        isVerified: false,
        isActive: true
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          emailOrUsername: 'john@example.com',
          password: 'password123'
        })
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Account not verified');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout user successfully', async () => {
      const user = await User.create({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashedpassword',
        isVerified: true
      });

      const refreshToken = await RefreshToken.create({
        token: 'test-refresh-token',
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: 'test-refresh-token'
        })
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully.');

      // Check if refresh token was deleted
      const deletedToken = await RefreshToken.findOne({ token: 'test-refresh-token' });
      expect(deletedToken).toBeNull();
    });
  });
});
