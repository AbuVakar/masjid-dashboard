const express = require('express');
const router = express.Router();
const PrayerTime = require('../models/PrayerTime');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { AuditLogger } = require('../utils/auditLogger');

// @desc    Get current prayer times
// @route   GET /api/prayer-times
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    let prayerTimes = await PrayerTime.findOne({ isActive: true });

    // If no prayer times exist, create default ones
    if (!prayerTimes) {
      prayerTimes = new PrayerTime({
        Fajr: '05:20',
        Dhuhr: '14:15',
        Asr: '17:30',
        Maghrib: '18:52',
        Isha: '20:45',
        updatedBy: null, // Will be set when admin updates
      });
      await prayerTimes.save();
    }

    res.json({
      success: true,
      data: {
        Fajr: prayerTimes.Fajr,
        Dhuhr: prayerTimes.Dhuhr,
        Asr: prayerTimes.Asr,
        Maghrib: prayerTimes.Maghrib,
        Isha: prayerTimes.Isha,
        lastUpdated: prayerTimes.updatedAt,
      },
    });
  }),
);

// @desc    Update prayer times (Admin only)
// @route   PUT /api/prayer-times
// @access  Private (Admin)
router.put(
  '/',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { Fajr, Dhuhr, Asr, Maghrib, Isha } = req.body;

    // Validate required fields
    if (!Fajr || !Dhuhr || !Asr || !Maghrib || !Isha) {
      throw new AppError('All prayer times are required', 400, 'MISSING_TIMES');
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const times = { Fajr, Dhuhr, Asr, Maghrib, Isha };

    for (const [prayer, time] of Object.entries(times)) {
      if (!timeRegex.test(time)) {
        throw new AppError(
          `Invalid time format for ${prayer}. Use HH:MM format.`,
          400,
          'INVALID_TIME_FORMAT',
        );
      }
    }

    // Use findOneAndUpdate with upsert to avoid race conditions
    const newPrayerTimes = await PrayerTime.findOneAndUpdate(
      { isActive: true },
      {
        Fajr,
        Dhuhr,
        Asr,
        Maghrib,
        Isha,
        updatedBy: req.user._id,
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    // Log the update
    await AuditLogger.logAuthEvent(
      req.user._id,
      req.user.username,
      'UPDATE_PRAYER_TIMES',
      req.ip,
      req.get('User-Agent') || 'Unknown',
      true,
      {
        oldTimes: req.body.oldTimes || 'Unknown',
        newTimes: { Fajr, Dhuhr, Asr, Maghrib, Isha },
      },
    );

    res.json({
      success: true,
      message: 'Prayer times updated successfully',
      data: {
        Fajr: newPrayerTimes.Fajr,
        Dhuhr: newPrayerTimes.Dhuhr,
        Asr: newPrayerTimes.Asr,
        Maghrib: newPrayerTimes.Maghrib,
        Isha: newPrayerTimes.Isha,
        lastUpdated: newPrayerTimes.updatedAt,
      },
    });
  }),
);

// @desc    Get prayer times history (Admin only)
// @route   GET /api/prayer-times/history
// @access  Private (Admin)
router.get(
  '/history',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const history = await PrayerTime.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('updatedBy', 'username name');

    res.json({
      success: true,
      data: history.map((entry) => ({
        id: entry._id,
        Fajr: entry.Fajr,
        Dhuhr: entry.Dhuhr,
        Asr: entry.Asr,
        Maghrib: entry.Maghrib,
        Isha: entry.Isha,
        isActive: entry.isActive,
        updatedBy: entry.updatedBy ? entry.updatedBy.username : 'System',
        updatedAt: entry.updatedAt,
      })),
    });
  }),
);

module.exports = router;
