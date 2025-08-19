const mongoose = require('mongoose');

const prayerTimeSchema = new mongoose.Schema(
  {
    Fajr: {
      type: String,
      required: true,
      default: '05:15',
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (HH:MM)',
      ],
    },
    Dhuhr: {
      type: String,
      required: true,
      default: '14:15',
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (HH:MM)',
      ],
    },
    Asr: {
      type: String,
      required: true,
      default: '17:30',
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (HH:MM)',
      ],
    },
    Maghrib: {
      type: String,
      required: true,
      default: '19:10',
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (HH:MM)',
      ],
    },
    Isha: {
      type: String,
      required: true,
      default: '20:45',
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (HH:MM)',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure only one active prayer time configuration
prayerTimeSchema.index({ isActive: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('PrayerTime', prayerTimeSchema);
