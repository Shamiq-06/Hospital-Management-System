const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const logger = require('../utils/logger');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.success('MongoDB Connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const users = [
  // Admin
  {
    email: 'admin@hospital.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    phoneNumber: '+1234567890',
    isActive: true,
    isVerified: true
  },
  // Doctors
  {
    email: 'dr.smith@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    firstName: 'John',
    lastName: 'Smith',
    phoneNumber: '+1234567891',
    isActive: true,
    isVerified: true
  },
  {
    email: 'dr.johnson@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    firstName: 'Emily',
    lastName: 'Johnson',
    phoneNumber: '+1234567892',
    isActive: true,
    isVerified: true
  },
  {
    email: 'dr.williams@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    firstName: 'Michael',
    lastName: 'Williams',
    phoneNumber: '+1234567893',
    isActive: true,
    isVerified: true
  },
  // Patients
  {
    email: 'patient1@example.com',
    password: 'patient123',
    role: 'patient',
    firstName: 'Sarah',
    lastName: 'Davis',
    phoneNumber: '+1234567894',
    isActive: true,
    isVerified: true
  },
  {
    email: 'patient2@example.com',
    password: 'patient123',
    role: 'patient',
    firstName: 'David',
    lastName: 'Brown',
    phoneNumber: '+1234567895',
    isActive: true,
    isVerified: true
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    logger.info('Clearing existing data...');
    await User.deleteMany({});
    await PatientProfile.deleteMany({});
    await DoctorProfile.deleteMany({});
    await AvailabilitySlot.deleteMany({});

    // Create users
    logger.info('Creating users...');
    const createdUsers = await User.create(users);

    // Create doctor profiles
    logger.info('Creating doctor profiles...');
    const doctorUsers = createdUsers.filter(u => u.role === 'doctor');

    const doctorProfiles = [
      {
        user: doctorUsers[0]._id,
        specialization: 'Cardiology',
        qualifications: [
          { degree: 'MD', institution: 'Harvard Medical School', year: 2010 },
          { degree: 'MBBS', institution: 'Johns Hopkins University', year: 2005 }
        ],
        experience: 13,
        licenseNumber: 'MD12345',
        department: 'Cardiology',
        consultationFee: 150,
        biography: 'Experienced cardiologist with over 13 years of practice.',
        languages: ['English', 'Spanish'],
        isAvailable: true,
        isApproved: true
      },
      {
        user: doctorUsers[1]._id,
        specialization: 'Pediatrics',
        qualifications: [
          { degree: 'MD', institution: 'Stanford Medical School', year: 2012 },
          { degree: 'MBBS', institution: 'Yale University', year: 2007 }
        ],
        experience: 11,
        licenseNumber: 'MD23456',
        department: 'Pediatrics',
        consultationFee: 120,
        biography: 'Dedicated pediatrician specializing in child healthcare.',
        languages: ['English'],
        isAvailable: true,
        isApproved: true
      },
      {
        user: doctorUsers[2]._id,
        specialization: 'Orthopedics',
        qualifications: [
          { degree: 'MD', institution: 'UCLA Medical School', year: 2008 },
          { degree: 'MBBS', institution: 'Columbia University', year: 2003 }
        ],
        experience: 15,
        licenseNumber: 'MD34567',
        department: 'Orthopedics',
        consultationFee: 180,
        biography: 'Expert in orthopedic surgery and sports medicine.',
        languages: ['English', 'French'],
        isAvailable: true,
        isApproved: true
      }
    ];

    const createdDoctorProfiles = await DoctorProfile.create(doctorProfiles);

    // Create patient profiles
    logger.info('Creating patient profiles...');
    const patientUsers = createdUsers.filter(u => u.role === 'patient');

    const patientProfiles = [
      {
        user: patientUsers[0]._id,
        dateOfBirth: new Date('1990-05-15'),
        gender: 'female',
        bloodGroup: 'A+',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        emergencyContact: {
          name: 'John Davis',
          relationship: 'Spouse',
          phoneNumber: '+1234567896'
        },
        allergies: ['Penicillin'],
        currentMedications: ['Aspirin']
      },
      {
        user: patientUsers[1]._id,
        dateOfBirth: new Date('1985-08-20'),
        gender: 'male',
        bloodGroup: 'O+',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Mary Brown',
          relationship: 'Spouse',
          phoneNumber: '+1234567897'
        },
        allergies: [],
        currentMedications: []
      }
    ];

    await PatientProfile.create(patientProfiles);

    // Create availability slots for doctors
    logger.info('Creating availability slots...');
    const today = new Date();
    const availabilitySlots = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

      // Skip Sundays
      if (dayOfWeek === 'Sunday') continue;

      for (const doctorProfile of createdDoctorProfiles) {
        availabilitySlots.push({
          doctor: doctorProfile.user,
          doctorProfile: doctorProfile._id,
          date: date,
          dayOfWeek: dayOfWeek,
          slots: [
            { startTime: '09:00', endTime: '10:00', isBooked: false },
            { startTime: '10:00', endTime: '11:00', isBooked: false },
            { startTime: '11:00', endTime: '12:00', isBooked: false },
            { startTime: '14:00', endTime: '15:00', isBooked: false },
            { startTime: '15:00', endTime: '16:00', isBooked: false },
            { startTime: '16:00', endTime: '17:00', isBooked: false }
          ]
        });
      }
    }

    await AvailabilitySlot.create(availabilitySlots);

    logger.success('✅ Database seeded successfully!');
    console.log('\n📝 Sample Credentials:');
    console.log('Admin: admin@hospital.com / admin123');
    console.log('Doctor: dr.smith@hospital.com / doctor123');
    console.log('Patient: patient1@example.com / patient123');
    console.log('');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
