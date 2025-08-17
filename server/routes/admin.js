const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const AuditLogger = require('../utils/auditLogger');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  
  res.json({
    success: true,
    data: users
  });
}));

// @desc    Get audit logs (admin only)
// @route   GET /api/admin/audit-logs
// @access  Admin
router.get('/audit-logs', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, userId, action, success } = req.query;
  
  const filter = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = action;
  if (success !== undefined) filter.success = success === 'true';
  
  const auditLogs = await AuditLogger.getAuditLogs({
    filter,
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.json({
    success: true,
    data: auditLogs.logs,
    pagination: auditLogs.pagination
  });
}));

module.exports = router;
