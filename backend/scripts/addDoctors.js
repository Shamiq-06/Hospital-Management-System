const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const logger = require('../utils/logger');

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI in environment');
    }

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

const doctorsToAdd = [
  {
    user: {
      email: 'dr.taylor@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      firstName: 'Ava',
      lastName: 'Taylor',
      phoneNumber: '+1234567898',
      isActive: true,
      isVerified: true,
    },
    profile: {
      specialization: 'Dermatology',
      qualifications: [
        { degree: 'MD', institution: 'University of Pennsylvania', year: 2014 },
        { degree: 'MBBS', institution: 'University of Michigan', year: 2009 },
      ],
      experience: 9,
      licenseNumber: 'MD45678',
      department: 'Dermatology',
      consultationFee: 130,
      biography: 'Board-certified dermatologist focused on evidence-based skin care and early diagnosis.',
      languages: ['English'],
      isAvailable: true,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'dr.anderson@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      firstName: 'Noah',
      lastName: 'Anderson',
      phoneNumber: '+1234567899',
      isActive: true,
      isVerified: true,
    },
    profile: {
      specialization: 'Neurology',
      qualifications: [
        { degree: 'MD', institution: 'Johns Hopkins University', year: 2011 },
        { degree: 'MBBS', institution: 'University of Washington', year: 2006 },
      ],
      experience: 14,
      licenseNumber: 'MD56789',
      department: 'Neurology',
      consultationFee: 200,
      biography: 'Neurologist specializing in headache, neuropathy, and stroke prevention.',
      languages: ['English', 'Spanish'],
      isAvailable: true,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'dr.thomas@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      firstName: 'Sophia',
      lastName: 'Thomas',
      phoneNumber: '+1234567900',
      isActive: true,
      isVerified: true,
    },
    profile: {
      specialization: 'Gynecology',
      qualifications: [
        { degree: 'MD', institution: 'Duke University', year: 2013 },
        { degree: 'MBBS', institution: 'University of Texas', year: 2008 },
      ],
      experience: 12,
      licenseNumber: 'MD67890',
      department: 'Gynecology',
      consultationFee: 160,
      biography: 'Women\'s health specialist with a patient-first approach to preventive and clinical care.',
      languages: ['English'],
      isAvailable: true,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'dr.martinez@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      firstName: 'Liam',
      lastName: 'Martinez',
      phoneNumber: '+1234567901',
      isActive: true,
      isVerified: true,
    },
    profile: {
      specialization: 'Psychiatry',
      qualifications: [
        { degree: 'MD', institution: 'Columbia University', year: 2015 },
        { degree: 'MBBS', institution: 'Boston University', year: 2010 },
      ],
      experience: 10,
      licenseNumber: 'MD78901',
      department: 'Psychiatry',
      consultationFee: 140,
      biography: 'Psychiatrist providing compassionate care for anxiety, mood disorders, and stress management.',
      languages: ['English', 'French'],
      isAvailable: true,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'dr.lee@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      firstName: 'Olivia',
      lastName: 'Lee',
      phoneNumber: '+1234567902',
      isActive: true,
      isVerified: true,
    },
    profile: {
      specialization: 'Dentistry',
      qualifications: [
        { degree: 'DDS', institution: 'UCLA School of Dentistry', year: 2016 },
        { degree: 'BDS', institution: 'University of Florida', year: 2012 },
      ],
      experience: 8,
      licenseNumber: 'MD89012',
      department: 'Dentistry',
      consultationFee: 110,
      biography: 'General dentist with a focus on prevention, restorative dentistry, and patient education.',
      languages: ['English'],
      isAvailable: true,
      isApproved: true,
    },
  },
];

const defaultDailySlots = [
  { startTime: '09:00', endTime: '10:00', isBooked: false },
  { startTime: '10:00', endTime: '11:00', isBooked: false },
  { startTime: '11:00', endTime: '12:00', isBooked: false },
  { startTime: '14:00', endTime: '15:00', isBooked: false },
  { startTime: '15:00', endTime: '16:00', isBooked: false },
  { startTime: '16:00', endTime: '17:00', isBooked: false },
];

const ensureAvailability = async (doctorProfile) => {
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayOfWeek === 'Sunday') continue;

    const existing = await AvailabilitySlot.findOne({
      doctor: doctorProfile.user,
      date,
    }).select('_id');

    if (existing) continue;

    await AvailabilitySlot.create({
      doctor: doctorProfile.user,
      doctorProfile: doctorProfile._id,
      date,
      dayOfWeek,
      slots: defaultDailySlots,
    });
  }
};

const addDoctors = async () => {
  try {
    await connectDB();

    logger.info('Adding doctors (non-destructive)...');

    const createdOrFound = [];

    for (const entry of doctorsToAdd) {
      const existingUser = await User.findOne({ email: entry.user.email });

      let user = existingUser;
      if (!user) {
        user = await User.create(entry.user);
        logger.success(`Created doctor user: ${user.email}`);
      } else {
        logger.info(`Doctor user already exists: ${existingUser.email}`);
      }

      let profile = await DoctorProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await DoctorProfile.create({
          user: user._id,
          ...entry.profile,
        });
        logger.success(`Created doctor profile: ${entry.profile.specialization} (${user.email})`);
      } else {
        logger.info(`Doctor profile already exists: ${user.email}`);
      }

      createdOrFound.push(profile);
    }

    logger.info('Ensuring availability slots for the next 7 days...');
    for (const profile of createdOrFound) {
      await ensureAvailability(profile);
    }

    logger.success('✅ Added/verified 5 doctors successfully!');
    console.log('\n📝 New Doctor Logins (all use password: doctor123):');
    for (const entry of doctorsToAdd) {
      console.log(`- ${entry.user.email}`);
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    logger.error('Error adding doctors:', error);
    process.exit(1);
  }
};

addDoctors();
