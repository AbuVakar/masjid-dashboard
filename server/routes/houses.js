const express = require('express');
const router = express.Router();
const House = require('../models/House');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

// @desc    Get all houses
// @route   GET /api/houses
// @access  Private
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const { 
    page = 1, 
    limit = 50, 
      search, 
      street, 
    occupation, 
    dawat, 
    education, 
    quran, 
    maktab, 
    gender,
      minAge, 
      maxAge, 
    dawatCountKey,
    dawatCountTimes
    } = req.query;

  // Build query
  let query = {};
    
  // Search functionality
    if (search) {
    query.$or = [
        { number: { $regex: search, $options: 'i' } },
        { street: { $regex: search, $options: 'i' } },
        { 'members.name': { $regex: search, $options: 'i' } }
      ];
    }
    
  // Street filter
    if (street) {
    query.street = street;
  }

  // Member filters
  if (occupation || dawat || education || quran || maktab || gender || minAge || maxAge || dawatCountKey || dawatCountTimes) {
    query['members'] = { $elemMatch: {} };
    
    if (occupation) query['members.$elemMatch.occupation'] = occupation;
    if (education) query['members.$elemMatch.education'] = education;
    if (quran) query['members.$elemMatch.quran'] = quran;
    if (gender) query['members.$elemMatch.gender'] = gender;
    
    if (maktab) {
      query['members.$elemMatch.age'] = { $lt: 14 };
      query['members.$elemMatch.maktab'] = maktab;
    }
    
    if (minAge || maxAge) {
      query['members.$elemMatch.age'] = {};
      if (minAge) query['members.$elemMatch.age'].$gte = parseInt(minAge);
      if (maxAge) query['members.$elemMatch.age'].$lte = parseInt(maxAge);
    }
    
    if (dawat) {
      if (dawat === 'Nil') {
        query['members.$elemMatch.dawat'] = 'Nil';
      } else {
        query['members.$elemMatch.dawat'] = dawat;
      }
    }
    
    if (dawatCountKey && dawatCountTimes) {
      query[`members.$elemMatch.dawatCounts.${dawatCountKey}`] = parseInt(dawatCountTimes);
    }
  }

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
    total
  });
}));

// @desc    Get single house
// @route   GET /api/houses/:id
// @access  Private
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);
    
  if (!house) {
    throw new AppError('House not found', 404, 'HOUSE_NOT_FOUND');
  }

  res.json(house);
}));

// @desc    Create house
// @route   POST /api/houses
// @access  Private
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { number, street, members, taleem, mashwara, notes } = req.body;

  // Check if house number already exists
  const existingHouse = await House.findOne({ number });
  if (existingHouse) {
    throw new AppError('House number already exists', 409, 'DUPLICATE_HOUSE_NUMBER');
  }

  const house = new House({
    number,
    street,
    members: members || [],
    taleem: taleem || false,
    mashwara: mashwara || false,
    notes
  });

  const savedHouse = await house.save();
  res.status(201).json(savedHouse);
}));

// @desc    Update house
// @route   PUT /api/houses/:id
// @access  Private
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { number, street, members, taleem, mashwara, notes } = req.body;

  // Check if house number already exists (excluding current house)
  if (number) {
    const existingHouse = await House.findOne({ number, _id: { $ne: req.params.id } });
    if (existingHouse) {
      throw new AppError('House number already exists', 409, 'DUPLICATE_HOUSE_NUMBER');
    }
  }

  const house = await House.findByIdAndUpdate(
    req.params.id,
    {
      number,
      street,
      members,
      taleem,
      mashwara,
      notes
    },
    { new: true, runValidators: true }
  );

  if (!house) {
    throw new AppError('House not found', 404, 'HOUSE_NOT_FOUND');
  }

  res.json(house);
}));

// @desc    Delete house
// @route   DELETE /api/houses/:id
// @access  Private
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const house = await House.findByIdAndDelete(req.params.id);
    
  if (!house) {
    throw new AppError('House not found', 404, 'HOUSE_NOT_FOUND');
  }

  res.json({ message: 'House deleted successfully' });
}));

// @desc    Load demo data
// @route   POST /api/houses/load-demo
// @access  Private
router.post('/load-demo', authenticateToken, asyncHandler(async (req, res) => {
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
        members: 13
      }
    });
  } catch (error) {
    console.error('Error loading demo data:', error);
    throw new AppError('Failed to load demo data', 500);
  }
}));

// @desc    Add member to house
// @route   POST /api/houses/:id/members
// @access  Private
router.post('/:id/members', authenticateToken, asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);
  
  if (!house) {
    throw new AppError('House not found', 404, 'HOUSE_NOT_FOUND');
  }

  house.members.push(req.body);
  const savedHouse = await house.save();
  
  res.status(201).json(savedHouse);
}));

// @desc    Update member in house
// @route   PUT /api/houses/:id/members/:memberId
// @access  Private
router.put('/:id/members/:memberId', authenticateToken, asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);
    
  if (!house) {
    throw new AppError('House not found', 404, 'HOUSE_NOT_FOUND');
  }

  const memberIndex = house.members.findIndex(
    member => member._id.toString() === req.params.memberId
  );

  if (memberIndex === -1) {
    throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
  }

  house.members[memberIndex] = { ...house.members[memberIndex].toObject(), ...req.body };
  const savedHouse = await house.save();
  
  res.json(savedHouse);
}));

// @desc    Delete member from house
// @route   DELETE /api/houses/:id/members/:memberId
// @access  Private
router.delete('/:id/members/:memberId', authenticateToken, asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);
  
  if (!house) {
    throw new AppError('House not found', 404, 'HOUSE_NOT_FOUND');
  }

  house.members = house.members.filter(
    member => member._id.toString() !== req.params.memberId
  );
  
  const savedHouse = await house.save();
  res.json(savedHouse);
}));

// @desc    Get statistics
// @route   GET /api/houses/stats/overview
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const stats = await House.aggregate([
    {
      $project: {
        totalHouses: 1,
        totalMembers: { $size: '$members' },
        adults: {
          $size: {
            $filter: {
              input: '$members',
              cond: { $gte: ['$$this.age', 14] }
            }
          }
        },
        children: {
          $size: {
            $filter: {
              input: '$members',
              cond: { $lt: ['$$this.age', 14] }
            }
          }
        },
        hafiz: {
          $size: {
            $filter: {
              input: '$members',
              cond: { $eq: ['$$this.occupation', 'Hafiz'] }
            }
          }
        },
        ulma: {
          $size: {
            $filter: {
              input: '$members',
              cond: { $eq: ['$$this.occupation', 'Ulma'] }
            }
          }
        },
        taleem: 1,
        mashwara: 1
      }
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
        housesWithMashwara: { $sum: { $cond: ['$mashwara', 1, 0] } }
        }
      }
    ]);

  res.json(stats[0] || {
    totalHouses: 0,
    totalMembers: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalHafiz: 0,
    totalUlma: 0,
    housesWithTaleem: 0,
    housesWithMashwara: 0
  });
}));

module.exports = router;
