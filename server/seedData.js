const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const House = require('./models/House');
const Resource = require('./models/Resource');

// Demo data
const demoHouses = [
  {
    number: '1',
    street: 'Main Street',
    taleem: true,
    mashwara: false,
    notes: 'First house on main street',
    members: [
      {
        name: 'Ahmed Khan',
        fatherName: 'Abdul Khan',
        age: 45,
        gender: 'Male',
        occupation: 'Businessman',
        education: 'Graduate',
        quran: 'yes',
        maktab: 'no',
        dawat: '3-day',
        dawatCounts: {
          '3-day': 2,
          '10-day': 1,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '9876543210',
        role: 'Head',
      },
      {
        name: 'Fatima Khan',
        fatherName: 'Ahmed Khan',
        age: 40,
        gender: 'Female',
        occupation: 'Other',
        education: '12th',
        quran: 'yes',
        maktab: 'no',
        dawat: 'Nil',
        dawatCounts: {
          '3-day': 0,
          '10-day': 0,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '9876543211',
        role: 'Member',
      },
      {
        name: 'Ali Khan',
        fatherName: 'Ahmed Khan',
        age: 12,
        gender: 'Male',
        occupation: 'Child',
        education: 'Below 8th',
        quran: 'no',
        maktab: 'yes',
        dawat: 'Nil',
        dawatCounts: {
          '3-day': 0,
          '10-day': 0,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '',
        role: 'Member',
      },
    ],
  },
  {
    number: '2',
    street: 'Main Street',
    taleem: false,
    mashwara: true,
    notes: 'Second house with mashwara',
    members: [
      {
        name: 'Mohammed Ali',
        fatherName: 'Hassan Ali',
        age: 50,
        gender: 'Male',
        occupation: 'Farmer',
        education: '10th',
        quran: 'yes',
        maktab: 'no',
        dawat: '10-day',
        dawatCounts: {
          '3-day': 1,
          '10-day': 3,
          '40-day': 1,
          '4-month': 0,
        },
        mobile: '9876543212',
        role: 'Head',
      },
      {
        name: 'Aisha Ali',
        fatherName: 'Mohammed Ali',
        age: 15,
        gender: 'Female',
        occupation: 'Student',
        education: '10th',
        quran: 'yes',
        maktab: 'no',
        dawat: '3-day',
        dawatCounts: {
          '3-day': 1,
          '10-day': 0,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '9876543213',
        role: 'Member',
      },
    ],
  },
  {
    number: '3',
    street: 'Park Road',
    taleem: true,
    mashwara: true,
    notes: 'House with both taleem and mashwara',
    members: [
      {
        name: 'Abdul Rahman',
        fatherName: 'Saleem Rahman',
        age: 55,
        gender: 'Male',
        occupation: 'Ulma',
        education: 'Above Graduate',
        quran: 'yes',
        maktab: 'no',
        dawat: '40-day',
        dawatCounts: {
          '3-day': 5,
          '10-day': 3,
          '40-day': 2,
          '4-month': 1,
        },
        mobile: '9876543214',
        role: 'Head',
      },
      {
        name: 'Zara Rahman',
        fatherName: 'Abdul Rahman',
        age: 25,
        gender: 'Female',
        occupation: 'Student',
        education: 'Graduate',
        quran: 'yes',
        maktab: 'no',
        dawat: '10-day',
        dawatCounts: {
          '3-day': 2,
          '10-day': 1,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '9876543215',
        role: 'Member',
      },
      {
        name: 'Yusuf Rahman',
        fatherName: 'Abdul Rahman',
        age: 8,
        gender: 'Male',
        occupation: 'Child',
        education: 'Below 8th',
        quran: 'no',
        maktab: 'yes',
        dawat: 'Nil',
        dawatCounts: {
          '3-day': 0,
          '10-day': 0,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '',
        role: 'Member',
      },
    ],
  },
  {
    number: '4',
    street: 'Park Road',
    taleem: false,
    mashwara: false,
    notes: 'New family',
    members: [
      {
        name: 'Hassan Ahmed',
        fatherName: 'Ibrahim Ahmed',
        age: 35,
        gender: 'Male',
        occupation: 'Worker',
        education: '12th',
        quran: 'no',
        maktab: 'no',
        dawat: 'Nil',
        dawatCounts: {
          '3-day': 0,
          '10-day': 0,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '9876543216',
        role: 'Head',
      },
      {
        name: 'Sara Ahmed',
        fatherName: 'Hassan Ahmed',
        age: 30,
        gender: 'Female',
        occupation: 'Other',
        education: '10th',
        quran: 'no',
        maktab: 'no',
        dawat: 'Nil',
        dawatCounts: {
          '3-day': 0,
          '10-day': 0,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '9876543217',
        role: 'Member',
      },
    ],
  },
  {
    number: '5',
    street: 'School Street',
    taleem: true,
    mashwara: false,
    notes: 'Family near school',
    members: [
      {
        name: 'Omar Farooq',
        fatherName: 'Farooq Ahmed',
        age: 42,
        gender: 'Male',
        occupation: 'Shopkeeper',
        education: '12th',
        quran: 'yes',
        maktab: 'no',
        dawat: '4-month',
        dawatCounts: {
          '3-day': 3,
          '10-day': 2,
          '40-day': 1,
          '4-month': 1,
        },
        mobile: '9876543218',
        role: 'Head',
      },
      {
        name: 'Layla Farooq',
        fatherName: 'Omar Farooq',
        age: 18,
        gender: 'Female',
        occupation: 'Student',
        education: '12th',
        quran: 'yes',
        maktab: 'no',
        dawat: '3-day',
        dawatCounts: {
          '3-day': 1,
          '10-day': 0,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '9876543219',
        role: 'Member',
      },
      {
        name: 'Ahmad Farooq',
        fatherName: 'Omar Farooq',
        age: 10,
        gender: 'Male',
        occupation: 'Child',
        education: 'Below 8th',
        quran: 'no',
        maktab: 'yes',
        dawat: 'Nil',
        dawatCounts: {
          '3-day': 0,
          '10-day': 0,
          '40-day': 0,
          '4-month': 0,
        },
        mobile: '',
        role: 'Member',
      },
    ],
  },
];

const demoResources = [
  {
    title: 'Quran Learning Guide',
    description: 'Complete guide for learning Quran with proper tajweed rules',
    category: 'PDF',
    fileUrl: '/uploads/quran-guide.pdf',
    fileName: 'quran-guide.pdf',
    fileSize: 2048576,
    fileType: 'application/pdf',
    tags: ['Quran', 'Learning', 'Tajweed'],
    isPublic: true,
    uploadedBy: 'admin',
  },
  {
    title: 'Islamic Calendar 2024',
    description:
      'Complete Islamic calendar with prayer times and important dates',
    category: 'Document',
    fileUrl: '/uploads/islamic-calendar-2024.docx',
    fileName: 'islamic-calendar-2024.docx',
    fileSize: 1048576,
    fileType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    tags: ['Calendar', 'Prayer Times', '2024'],
    isPublic: true,
    uploadedBy: 'admin',
  },
  {
    title: 'Masjid Architecture Design',
    description: 'Modern masjid design concepts and architectural guidelines',
    category: 'Image',
    fileUrl: '/uploads/masjid-design.jpg',
    fileName: 'masjid-design.jpg',
    fileSize: 3145728,
    fileType: 'image/jpeg',
    tags: ['Architecture', 'Design', 'Masjid'],
    isPublic: true,
    uploadedBy: 'admin',
  },
  {
    title: 'Islamic Education Resources',
    description:
      'Collection of Islamic education materials for children and adults',
    category: 'Link',
    fileUrl: 'https://example.com/islamic-education',
    fileName: '',
    fileSize: 0,
    fileType: 'link',
    tags: ['Education', 'Islamic', 'Resources'],
    isPublic: true,
    uploadedBy: 'admin',
  },
  {
    title: 'Community Management Guide',
    description: 'Best practices for managing masjid community and events',
    category: 'PDF',
    fileUrl: '/uploads/community-guide.pdf',
    fileName: 'community-guide.pdf',
    fileSize: 1572864,
    fileType: 'application/pdf',
    tags: ['Community', 'Management', 'Guide'],
    isPublic: true,
    uploadedBy: 'admin',
  },
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed data function
const seedData = async () => {
  try {
    console.log('🌱 Starting to seed data...');

    // Clear existing data
    await House.deleteMany({});
    await Resource.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Insert houses
    const savedHouses = await House.insertMany(demoHouses);
    console.log(`🏠 Inserted ${savedHouses.length} houses`);

    // Insert resources
    const savedResources = await Resource.insertMany(demoResources);
    console.log(`📚 Inserted ${savedResources.length} resources`);

    console.log('✅ Data seeding completed successfully!');
    console.log(`📊 Total Houses: ${savedHouses.length}`);
    console.log(`📊 Total Resources: ${savedResources.length}`);

    // Show some statistics
    const totalMembers = savedHouses.reduce(
      (total, house) => total + house.members.length,
      0,
    );
    console.log(`👥 Total Members: ${totalMembers}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => {
  seedData();
});
