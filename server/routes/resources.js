const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Resource = require('../models/Resource');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { validateResource } = require('../middleware/validator');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    let query = { status: 'active' };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Tags filter
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const resources = await Resource.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    // Get total count
    const total = await Resource.countDocuments(query);

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  }),
);

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Increment view count
    await resource.incrementView();

    res.json(resource);
  }),
);

// @desc    Create resource
// @route   POST /api/resources
// @access  Private
router.post(
  '/',
  authenticateToken,
  upload.single('file'),
  // validateResource, // Validation needs to be adjusted for multipart/form-data
  asyncHandler(async (req, res) => {
    const { title, description, category, tags, type, isPublic } = req.body;
    let fileUrl = req.body.fileUrl || '';

    if (req.file) {
      // If a file is uploaded, its path becomes the fileUrl
      fileUrl = `/uploads/${req.file.filename}`;
    }

    if (!fileUrl) {
      throw new AppError('File or link URL is required', 400, 'MISSING_URL');
    }

    const resource = new Resource({
      title,
      description,
      category,
      fileUrl,
      fileName: req.file ? req.file.originalname : null,
      fileSize: req.file ? req.file.size : null,
      fileType: req.file ? req.file.mimetype : 'link',
      tags: tags ? tags.split(',') : [],
      isPublic: isPublic !== 'false',
      uploadedBy: req.user.id,
    });

    const savedResource = await resource.save();
    res.status(201).json({ success: true, data: savedResource });
  }),
);

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private
router.put(
  '/:id',
  authenticateToken,
  upload.single('file'),
  // validateResource,
  asyncHandler(async (req, res) => {
    const { title, description, category, tags, type, isPublic } = req.body;
    let fileUrl = req.body.fileUrl || '';

    const updateData = { title, description, category, tags: tags ? tags.split(',') : [], type, isPublic: isPublic !== 'false' };

    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`;
      updateData.fileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.fileType = req.file.mimetype;
    } else if (fileUrl) {
      updateData.fileUrl = fileUrl;
    }

    const resource = await Resource.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!resource) {
      throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    }

    res.json({ success: true, data: resource });
  }),
);

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully',
      data: null,
    });
  }),
);

// @desc    Increment download count
// @route   POST /api/resources/:id/download
// @access  Public
router.post(
  '/:id/download',
  asyncHandler(async (req, res) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    }

    await resource.incrementDownload();
    res.json({
      success: true,
      message: 'Download count incremented',
      data: null,
    });
  }),
);

// @desc    Get resource statistics
// @route   GET /api/resources/stats/overview
// @access  Public
router.get(
  '/stats/overview',
  asyncHandler(async (req, res) => {
    const stats = await Resource.aggregate([
      {
        $group: {
          _id: null,
          totalResources: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' },
          totalViews: { $sum: '$viewCount' },
          categories: { $addToSet: '$category' },
          totalSize: { $sum: '$fileSize' },
        },
      },
    ]);

    // Get category-wise counts
    const categoryStats = await Resource.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      overview: stats[0] || {
        totalResources: 0,
        totalDownloads: 0,
        totalViews: 0,
        categories: [],
        totalSize: 0,
      },
      categoryStats,
    });
  }),
);

// @desc    Get popular resources
// @route   GET /api/resources/popular
// @access  Public
router.get(
  '/popular',
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const resources = await Resource.find({ status: 'active' })
      .sort({ downloadCount: -1, viewCount: -1 })
      .limit(parseInt(limit));

    res.json(resources);
  }),
);

module.exports = router;
