const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation result checker
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// User registration validation
exports.validateRegistration = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number with country code'),
  body('role')
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Invalid role')
];

// Login validation
exports.validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Appointment booking validation
exports.validateAppointment = [
  body('doctor').notEmpty().withMessage('Doctor ID is required'),
  body('availabilitySlot').notEmpty().withMessage('Availability slot is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('reasonForVisit')
    .notEmpty()
    .withMessage('Reason for visit is required')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

// Doctor profile validation
exports.validateDoctorProfile = [
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Valid years of experience required'),
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('consultationFee')
    .isFloat({ min: 0 })
    .withMessage('Valid consultation fee required')
];

// Patient profile validation
exports.validatePatientProfile = [
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender value')
];

// Availability slot validation
exports.validateAvailabilitySlot = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('slots').isArray({ min: 1 }).withMessage('At least one slot is required'),
  body('slots.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required (HH:MM)'),
  body('slots.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required (HH:MM)')
];

// Payment validation
exports.validatePayment = [
  body('appointment').notEmpty().withMessage('Appointment ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
];

// ID parameter validation
exports.validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];
