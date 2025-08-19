const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { AuditLogger } = require('../utils/auditLogger');
const {
  validateRegistration,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validator');
const crypto = require('crypto'); // Added for forgot password

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
router.post(
  '/register',
  validateRegistration,
  asyncHandler(async (req, res) => {
    const { username, password, email, mobile, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new AppError('Username already exists', 409, 'USERNAME_EXISTS');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      email,
      mobile,
      name: name || username,
      role: 'user',
    });

    await user.save();

    // Generate JWT
    const payload = {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Log successful registration
    await AuditLogger.logAuthEvent(
      user._id,
      user.username,
      'REGISTER',
      req.ip,
      req.get('User-Agent') || 'Unknown',
      true,
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          mobile: user.mobile,
        },
        token,
      },
    });
  }),
);

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await AuditLogger.logAuthEvent(
        null,
        username,
        'LOGIN',
        req.ip,
        req.get('User-Agent') || 'Unknown',
        false,
        'Invalid password',
      );
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT
    const payload = {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Log successful login
    await AuditLogger.logAuthEvent(
      user._id,
      user.username,
      'LOGIN',
      req.ip,
      req.get('User-Agent') || 'Unknown',
      true,
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          mobile: user.mobile,
        },
        token,
      },
    });
  }),
);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get(
  '/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Check if user exists in request (from auth middleware)
    if (!req.user || !req.user._id) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: user,
    });
  }),
);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  '/profile',
  authenticateToken,
  validateUpdateProfile,
  asyncHandler(async (req, res) => {
    const { name, email, mobile, preferences } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (preferences) user.preferences = preferences;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        mobile: user.mobile,
        preferences: user.preferences,
      },
    });
  }),
);

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put(
  '/change-password',
  authenticateToken,
  validateChangePassword,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new AppError(
        'Current password is incorrect',
        401,
        'INVALID_PASSWORD',
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedNewPassword;

    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }),
);

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
router.post(
  '/forgot-password',
  validateForgotPassword,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Find user by email. We don't throw an error if not found to prevent email enumeration.
    const user = await User.findOne({ email });

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      // Save reset token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // In a real application, you would send an email to the user.
      // For this project, we will log the reset link to the console.
      const resetUrl = `${req.protocol}://${req.get(
        'host',
      )}/reset-password?token=${resetToken}`;
      console.log('Password Reset Link:', resetUrl);
    }

    // Always return a generic success message to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.',
    });
  }),
);

// @desc    Reset Password
// @route   POST /api/users/reset-password
// @access  Public
router.post(
  '/reset-password',
  validateResetPassword,
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  }),
);

module.exports = router;
