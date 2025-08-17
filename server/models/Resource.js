const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['PDF', 'Document', 'Image', 'Video', 'Link', 'Audio', 'Other'],
    default: 'Other'
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number,
    min: [0, 'File size cannot be negative']
  },
  fileType: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better query performance
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ createdAt: -1 });

// Virtual for formatted file size
resourceSchema.virtual('formattedFileSize').get(function() {
  if (!this.fileSize) return 'Unknown';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Method to increment download count
resourceSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to increment view count
resourceSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Resource', resourceSchema);
