const DoctorProfile = require('../models/DoctorProfile');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const Appointment = require('../models/Appointment');
const { AppError } = require('../middleware/errorHandler');
const whatsappService = require('../services/whatsappService');

// @desc    Create or update doctor profile
// @route   POST /api/doctors/profile
// @access  Private (Doctor)
exports.createOrUpdateProfile = async (req, res, next) => {
  try {
    let profile = await DoctorProfile.findOne({ user: req.user.id });

    if (profile) {
      profile = await DoctorProfile.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      profile = await DoctorProfile.create({
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

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private (Doctor)
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user.id }).populate('user');

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

// @desc    Create availability slots
// @route   POST /api/doctors/availability
// @access  Private (Doctor)
exports.createAvailability = async (req, res, next) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });

    if (!doctorProfile) {
      return next(new AppError('Doctor profile not found', 404));
    }

    const { date, slots, isRecurring, recurringEndDate } = req.body;

    // Get day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    const availability = await AvailabilitySlot.create({
      doctor: req.user.id,
      doctorProfile: doctorProfile._id,
      date: new Date(date),
      dayOfWeek,
      slots,
      isRecurring,
      recurringEndDate
    });

    res.status(201).json({
      status: 'success',
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor availability
// @route   GET /api/doctors/availability
// @access  Private (Doctor)
exports.getAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { doctor: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const availability = await AvailabilitySlot.find(query).sort({ date: 1 });

    res.status(200).json({
      status: 'success',
      results: availability.length,
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update availability slot
// @route   PUT /api/doctors/availability/:id
// @access  Private (Doctor)
exports.updateAvailability = async (req, res, next) => {
  try {
    let availability = await AvailabilitySlot.findOne({
      _id: req.params.id,
      doctor: req.user.id
    });

    if (!availability) {
      return next(new AppError('Availability slot not found', 404));
    }

    availability = await AvailabilitySlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete availability slot
// @route   DELETE /api/doctors/availability/:id
// @access  Private (Doctor)
exports.deleteAvailability = async (req, res, next) => {
  try {
    const availability = await AvailabilitySlot.findOne({
      _id: req.params.id,
      doctor: req.user.id
    });

    if (!availability) {
      return next(new AppError('Availability slot not found', 404));
    }

    // Check if any slots are booked
    const hasBookedSlots = availability.slots.some(slot => slot.isBooked);
    if (hasBookedSlots) {
      return next(new AppError('Cannot delete availability with booked slots', 400));
    }

    await availability.remove();

    res.status(200).json({
      status: 'success',
      message: 'Availability slot deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor appointments
// @route   GET /api/doctors/appointments
// @access  Private (Doctor)
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;

    let query = { doctor: req.user.id };

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('patientProfile')
      .populate('payment')
      .sort({ appointmentDate: 1 })
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

// @desc    Update appointment status
// @route   PUT /api/doctors/appointments/:id/status
// @access  Private (Doctor)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user.id
    }).populate('patient', 'firstName lastName phoneNumber');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    appointment.status = status;
    await appointment.save();

    // Send WhatsApp notification
    try {
      await whatsappService.sendAppointmentStatusUpdate(
        appointment,
        appointment.patient,
        status
      );
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
    }

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add consultation notes
// @route   PUT /api/doctors/appointments/:id/notes
// @access  Private (Doctor)
exports.addConsultationNotes = async (req, res, next) => {
  try {
    const { consultationNotes, diagnosis, prescription, followUpDate } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user.id
    });

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    appointment.consultationNotes = consultationNotes;
    appointment.diagnosis = diagnosis;
    appointment.prescription = prescription;
    appointment.followUpDate = followUpDate;
    appointment.status = 'completed';

    await appointment.save();

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor statistics
// @route   GET /api/doctors/statistics
// @access  Private (Doctor)
exports.getStatistics = async (req, res, next) => {
  try {
    const totalAppointments = await Appointment.countDocuments({ doctor: req.user.id });
    const completedAppointments = await Appointment.countDocuments({
      doctor: req.user.id,
      status: 'completed'
    });
    const pendingAppointments = await Appointment.countDocuments({
      doctor: req.user.id,
      status: 'pending'
    });
    const todayAppointments = await Appointment.countDocuments({
      doctor: req.user.id,
      appointmentDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        todayAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};
