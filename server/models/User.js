const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    mobile: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'guest'],
      default: 'user',
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      quietHours: {
        start: {
          type: String,
          default: '22:00',
        },
        end: {
          type: String,
          default: '06:00',
        },
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      language: {
        type: String,
        enum: ['en', 'hi', 'ur'],
        default: 'en',
      },
      prayerTiming: {
        before: {
          type: Number,
          default: 15,
          min: 0,
          max: 60,
        },
        after: {
          type: Number,
          default: 5,
          min: 0,
          max: 60,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ isActive: 1 });

// Virtual for user display name
userSchema.virtual('displayName').get(function () {
  return this.name || this.username;
});

// Method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Method to check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

// Method to check if user is guest
userSchema.methods.isGuest = function () {
  return this.role === 'guest';
};

// Pre-save middleware to ensure unique username
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified('username')) {
    try {
      const existingUser = await this.constructor.findOne({
        username: this.username,
      });
      if (existingUser && existingUser._id.toString() !== this._id.toString()) {
        return next(new Error('Username already exists'));
      }
    } catch (error) {
      // Skip validation in test environment if database is not connected
      if (
        process.env.NODE_ENV === 'test' &&
        error.name === 'MongoNotConnectedError'
      ) {
        return next();
      }
      return next(error);
    }
  }
  next();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
