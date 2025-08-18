const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { AuditLogger } = require('../utils/auditLogger');
const crypto = require('crypto'); // Added for forgot password

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { username, password, email, mobile, name } = req.body;

    // Sanitize input data
    const sanitizedData = {
      username: username ? username.replace(/[<>]/g, '').trim() : username,
      password,
      email: email ? email.replace(/[<>]/g, '').trim() : email,
      mobile: mobile ? mobile.replace(/[<>]/g, '').trim() : mobile,
      name: name ? name.replace(/[<>]/g, '').trim() : name,
    };

    // Validate required fields
    if (!username || !password) {
      throw new AppError(
        'Username and password are required',
        400,
        'MISSING_FIELDS',
      );
    }

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
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

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
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      throw new AppError(
        'Username and password are required',
        400,
        'MISSING_FIELDS',
      );
    }

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
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

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
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError(
        'Current password and new password are required',
        400,
        'MISSING_FIELDS',
      );
    }

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

// Forgot Password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email is required' },
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found with this email' },
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // In production, send email here
    // For now, return the token (in production, send via email)
    res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      data: {
        resetToken: resetToken, // Remove this in production
        expiresIn: '1 hour',
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to process forgot password request' },
    });
  }
});

// Reset Password - Change password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Token and new password are required' },
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired reset token' },
      });
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
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to reset password' },
    });
  }
});

module.exports = router;
