const express = require('express');
const router = express.Router();
const House = require('../models/House');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { checkResourceExists } = require('../middleware/resource');
const {
  validateHouse,
  validateMember,
  validatePagination,
  validateSearch,
} = require('../middleware/validator');

// @desc    Get all houses
// @route   GET /api/houses
// @access  Private
const QueryBuilder = require('../utils/queryBuilder');

router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;

    // Build query using the QueryBuilder utility
    const queryBuilder = new QueryBuilder(req.query);
    const query = queryBuilder.build();

    // Execute query with pagination
    const houses = await House.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ number: 1 });

    // Get total count
    const total = await House.countDocuments(query);

    res.json({
      houses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  }),
);

// @desc    Get single house
// @route   GET /api/houses/:id
// @access  Private
router.get(
  '/:id',
  optionalAuth,
  checkResourceExists(House, 'House'),
  asyncHandler(async (req, res) => {
    res.json(req.resource);
  }),
);

// Helper function to check for duplicate house numbers
const checkDuplicateHouseNumber = async (number, excludeId = null) => {
  const query = { number };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existingHouse = await House.findOne(query);
  if (existingHouse) {
    throw new AppError(
      'House number already exists',
      409,
      'DUPLICATE_HOUSE_NUMBER',
    );
  }
};

// @desc    Create house
// @route   POST /api/houses
// @access  Private
router.post(
  '/',
  authenticateToken,
  validateHouse,
  asyncHandler(async (req, res) => {
    const { number, street, members, taleem, mashwara, notes } = req.body;

    await checkDuplicateHouseNumber(number);

    const house = new House({
      number,
      street,
      members: members || [],
      taleem: taleem || false,
      mashwara: mashwara || false,
      notes,
    });

    const savedHouse = await house.save();
    res.status(201).json({
      success: true,
      message: 'House created successfully',
      data: savedHouse,
    });
  }),
);

// @desc    Update house
// @route   PUT /api/houses/:id
// @access  Private
router.put(
  '/:id',
  authenticateToken,
  checkResourceExists(House, 'House'),
  validateHouse,
  asyncHandler(async (req, res) => {
    const { number, street, members, taleem, mashwara, notes } = req.body;

    if (number) {
      await checkDuplicateHouseNumber(number, req.params.id);
    }

    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      { number, street, members, taleem, mashwara, notes },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      message: 'House updated successfully',
      data: updatedHouse,
    });
  }),
);

// @desc    Delete house
// @route   DELETE /api/houses/:id
// @access  Private
router.delete(
  '/:id',
  authenticateToken,
  checkResourceExists(House, 'House'),
  asyncHandler(async (req, res) => {
    await House.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'House deleted successfully',
      data: null,
    });
  }),
);

// @desc    Load demo data
// @route   POST /api/houses/load-demo
// @access  Private
router.post(
  '/load-demo',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      // Import and run seed data
      const seedData = require('../seedData');
      await seedData();

      res.json({
        success: true,
        message: 'Demo data loaded successfully',
        data: {
          houses: 5,
          resources: 5,
          members: 13,
        },
      });
    } catch (error) {
      console.error('Error loading demo data:', error);
      throw new AppError('Failed to load demo data', 500);
    }
  }),
);

// @desc    Add member to house
// @route   POST /api/houses/:id/members
// @access  Private
router.post(
  '/:id/members',
  authenticateToken,
  checkResourceExists(House, 'House'),
  validateMember,
  asyncHandler(async (req, res) => {
    // Ensure age is a number
    const memberData = {
      ...req.body,
      age: Number(req.body.age),
    };

    req.resource.members.push(memberData);
    const savedHouse = await req.resource.save();
    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: savedHouse,
    });
  }),
);

// @desc    Update member in house
// @route   PUT /api/houses/:id/members/:memberId
// @access  Private
router.put(
  '/:id/members/:memberId',
  authenticateToken,
  checkResourceExists(House, 'House'),
  validateMember,
  asyncHandler(async (req, res) => {
    const {
      name,
      fatherName,
      age,
      gender,
      role,
      occupation,
      education,
      quran,
      dawat,
      mobile,
      maktab,
      dawatCounts,
    } = req.body;

    const result = await House.updateOne(
      { _id: req.params.id, 'members._id': req.params.memberId },
      {
        $set: {
          'members.$.name': name,
          'members.$.fatherName': fatherName,
          'members.$.age': Number(age), // Ensure age is a number
          'members.$.gender': gender,
          'members.$.role': role,
          'members.$.occupation': occupation,
          'members.$.education': education,
          'members.$.quran': quran,
          'members.$.dawat': dawat,
          'members.$.mobile': mobile,
          'members.$.maktab': maktab,
          'members.$.dawatCounts': dawatCounts,
        },
      },
    );

    if (result.modifiedCount === 0) {
      throw new AppError(
        'Member not found or no changes made',
        404,
        'MEMBER_NOT_FOUND',
      );
    }

    const updatedHouse = await House.findById(req.params.id);
    res.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedHouse,
    });
  }),
);

const mongoose = require('mongoose');

// @desc    Delete member from house
// @route   DELETE /api/houses/:id/members/:memberId
// @access  Private
router.delete(
  '/:id/members/:memberId',
  authenticateToken,
  checkResourceExists(House, 'House'),
  asyncHandler(async (req, res) => {
    const { id, memberId } = req.params;

    // Ensure memberId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new AppError('Invalid member ID', 400, 'INVALID_ID');
    }

    const result = await House.updateOne(
      { _id: id },
      { $pull: { members: { _id: new mongoose.Types.ObjectId(memberId) } } },
    );

    if (result.modifiedCount === 0) {
      // This can happen if the member doesn't exist, which is a valid state.
      // We can choose to send a success response or a 404.
      // Sending success is often better to prevent clients from needing to know if the resource existed before.
      // However, for strictness, we'll throw an error as before.
      throw new AppError('Member not found or already deleted', 404, 'MEMBER_NOT_FOUND');
    }

    const updatedHouse = await House.findById(req.params.id);
    console.log(
      '✅ Member deleted successfully, updated house:',
      updatedHouse._id,
    );

    res.json({
      success: true,
      message: 'Member deleted successfully',
      data: updatedHouse,
    });
  }),
);

// @desc    Get statistics
// @route   GET /api/houses/stats/overview
// @access  Public
router.get(
  '/stats/overview',
  asyncHandler(async (req, res) => {
    const stats = await House.aggregate([
      {
        $project: {
          totalHouses: 1,
          totalMembers: { $size: '$members' },
          adults: {
            $size: {
              $filter: {
                input: '$members',
                cond: { $gte: ['$$this.age', 14] },
              },
            },
          },
          children: {
            $size: {
              $filter: {
                input: '$members',
                cond: { $lt: ['$$this.age', 14] },
              },
            },
          },
          hafiz: {
            $size: {
              $filter: {
                input: '$members',
                cond: { $eq: ['$$this.occupation', 'Hafiz'] },
              },
            },
          },
          ulma: {
            $size: {
              $filter: {
                input: '$members',
                cond: { $eq: ['$$this.occupation', 'Ulma'] },
              },
            },
          },
          taleem: 1,
          mashwara: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalHouses: { $sum: 1 },
          totalMembers: { $sum: '$totalMembers' },
          totalAdults: { $sum: '$adults' },
          totalChildren: { $sum: '$children' },
          totalHafiz: { $sum: '$hafiz' },
          totalUlma: { $sum: '$ulma' },
          housesWithTaleem: { $sum: { $cond: ['$taleem', 1, 0] } },
          housesWithMashwara: { $sum: { $cond: ['$mashwara', 1, 0] } },
        },
      },
    ]);

    res.json(
      stats[0] || {
        totalHouses: 0,
        totalMembers: 0,
        totalAdults: 0,
        totalChildren: 0,
        totalHafiz: 0,
        totalUlma: 0,
        housesWithTaleem: 0,
        housesWithMashwara: 0,
      },
    );
  }),
);

module.exports = router;
