const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'General Medicine',
      'Cardiology',
      'Dermatology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Radiology',
      'Surgery',
      'Gynecology',
      'Ophthalmology',
      'ENT',
      'Dentistry',
      'Urology',
      'Gastroenterology'
    ]
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience required'],
    min: 0
  },
  licenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: 0
  },
  biography: {
    type: String,
    maxlength: 1000
  },
  languages: [String],
  awardsAndRecognition: [String],
  profileImage: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
