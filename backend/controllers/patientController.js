const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// @desc    Create or update patient profile
// @route   POST /api/patients/profile
// @access  Private (Patient)
exports.createOrUpdateProfile = async (req, res, next) => {
  try {
    let profile = await PatientProfile.findOne({ user: req.user.id });

    if (profile) {
      profile = await PatientProfile.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      profile = await PatientProfile.create({
        user: req.user.id,
        ...req.body
      });
    }

    res.status(200).json({
      status: 'success',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient)
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await PatientProfile.findOne({ user: req.user.id }).populate('user');

    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search doctors by specialization
// @route   GET /api/patients/doctors/search
// @access  Private (Patient)
exports.searchDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;

    let query = { isApproved: true, isAvailable: true };

    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await DoctorProfile.find(query)
      .populate('user', 'firstName lastName email phoneNumber')
      .sort({ rating: -1 });

    // Filter by search term if provided
    let filteredDoctors = doctors;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDoctors = doctors.filter(doctor => 
        doctor.user.firstName.toLowerCase().includes(searchLower) ||
        doctor.user.lastName.toLowerCase().includes(searchLower) ||
        doctor.specialization.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      status: 'success',
      results: filteredDoctors.length,
      data: { doctors: filteredDoctors }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor details
// @route   GET /api/patients/doctors/:id
// @access  Private (Patient)
exports.getDoctorDetails = async (req, res, next) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id)
      .populate('user', 'firstName lastName email phoneNumber');

    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient appointments
// @route   GET /api/patients/appointments
// @access  Private (Patient)
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { patient: req.user.id };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'firstName lastName email phoneNumber')
      .populate('doctorProfile', 'specialization consultationFee')
      .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { appointments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/patients/appointments/:id
// @access  Private (Patient)
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user.id
    })
      .populate('doctor', 'firstName lastName email phoneNumber')
      .populate('doctorProfile', 'specialization consultationFee')
      .populate('payment');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available specializations
// @route   GET /api/patients/specializations
// @access  Private (Patient)
exports.getSpecializations = async (req, res, next) => {
  try {
    const specializations = await DoctorProfile.distinct('specialization', {
      isApproved: true,
      isAvailable: true
    });

    res.status(200).json({
      status: 'success',
      data: { specializations }
    });
  } catch (error) {
    next(error);
  }
};
