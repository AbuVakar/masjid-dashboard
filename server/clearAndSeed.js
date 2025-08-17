const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const House = require('./models/House');
const Resource = require('./models/Resource');

// Demo data
const demoHouses = [
  {
    number: "1",
    street: "Main Street",
    taleem: true,
    mashwara: false,
    notes: "First house on main street",
    members: [
      {
        name: "Ahmed Khan",
        fatherName: "Abdul Khan",
        age: 45,
        gender: "Male",
        occupation: "Businessman",
        education: "Graduate",
        quran: "yes",
        maktab: "no",
        dawat: "3-day",
        dawatCounts: {
          "3-day": 2,
          "10-day": 1,
          "40-day": 0,
          "4-month": 0
        },
        mobile: "9876543210",
        role: "Head"
      },
      {
        name: "Fatima Khan",
        fatherName: "Ahmed Khan",
        age: 40,
        gender: "Female",
        occupation: "Other",
        education: "12th",
        quran: "yes",
        maktab: "no",
        dawat: "Nil",
        dawatCounts: {
          "3-day": 0,
          "10-day": 0,
          "40-day": 0,
          "4-month": 0
        },
        mobile: "9876543211",
        role: "Member"
      },
      {
        name: "Ali Khan",
        fatherName: "Ahmed Khan",
        age: 12,
        gender: "Male",
        occupation: "Child",
        education: "Below 8th",
        quran: "no",
        maktab: "yes",
        dawat: "Nil",
        dawatCounts: {
          "3-day": 0,
          "10-day": 0,
          "40-day": 0,
          "4-month": 0
        },
        mobile: "",
        role: "Member"
      }
    ]
  },
  {
    number: "2",
    street: "Main Street",
    taleem: false,
    mashwara: true,
    notes: "Second house with mashwara",
    members: [
      {
        name: "Mohammed Ali",
        fatherName: "Hassan Ali",
        age: 50,
        gender: "Male",
        occupation: "Farmer",
        education: "10th",
        quran: "yes",
        maktab: "no",
        dawat: "10-day",
        dawatCounts: {
          "3-day": 1,
          "10-day": 3,
          "40-day": 1,
          "4-month": 0
        },
        mobile: "9876543212",
        role: "Head"
      },
      {
        name: "Aisha Ali",
        fatherName: "Mohammed Ali",
        age: 15,
        gender: "Female",
        occupation: "Student",
        education: "10th",
        quran: "yes",
        maktab: "no",
        dawat: "3-day",
        dawatCounts: {
          "3-day": 1,
          "10-day": 0,
          "40-day": 0,
          "4-month": 0
        },
        mobile: "9876543213",
        role: "Member"
      }
    ]
  },
  {
    number: "3",
    street: "Park Road",
    taleem: true,
    mashwara: true,
    notes: "House with both taleem and mashwara",
    members: [
      {
        name: "Abdul Rahman",
        fatherName: "Saleem Rahman",
        age: 55,
        gender: "Male",
        occupation: "Ulma",
        education: "Above Graduate",
        quran: "yes",
        maktab: "no",
        dawat: "40-day",
        dawatCounts: {
          "3-day": 5,
          "10-day": 3,
          "40-day": 2,
          "4-month": 1
        },
        mobile: "9876543214",
        role: "Head"
      },
      {
        name: "Zara Rahman",
        fatherName: "Abdul Rahman",
        age: 25,
        gender: "Female",
        occupation: "Student",
        education: "Graduate",
        quran: "yes",
        maktab: "no",
        dawat: "10-day",
        dawatCounts: {
          "3-day": 2,
          "10-day": 1,
          "40-day": 0,
          "4-month": 0
        },
        mobile: "9876543215",
        role: "Member"
      },
      {
        name: "Yusuf Rahman",
        fatherName: "Abdul Rahman",
        age: 8,
        gender: "Male",
        occupation: "Child",
        education: "Below 8th",
        quran: "no",
        maktab: "yes",
        dawat: "Nil",
        dawatCounts: {
          "3-day": 0,
          "10-day": 0,
          "40-day": 0,
          "4-month": 0
        },
        mobile: "",
        role: "Member"
      }
    ]
  }
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

// Clear and seed data function
const clearAndSeedData = async () => {
  try {
    console.log('🌱 Starting to clear and seed data...');
    
    // Drop the entire database
    await mongoose.connection.dropDatabase();
    console.log('🗑️ Dropped entire database');
    
    // Insert houses one by one
    for (const houseData of demoHouses) {
      const house = new House(houseData);
      await house.save();
      console.log(`🏠 Saved house ${houseData.number}`);
    }
    
    console.log('✅ Data seeding completed successfully!');
    console.log(`📊 Total Houses: ${demoHouses.length}`);
    
    // Show some statistics
    const totalMembers = demoHouses.reduce((total, house) => total + house.members.length, 0);
    console.log(`👥 Total Members: ${totalMembers}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => {
  clearAndSeedData();
});
