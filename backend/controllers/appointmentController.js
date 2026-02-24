const Appointment = require('../models/Appointment');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const whatsappService = require('../services/whatsappService');

// @desc    Create appointment (booking)
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctor, availabilitySlot, appointmentDate, appointmentTime, reasonForVisit, symptoms } = req.body;

    // Verify doctor exists and is approved
    const doctorProfile = await DoctorProfile.findOne({ user: doctor });
    if (!doctorProfile || !doctorProfile.isApproved) {
      return next(new AppError('Doctor not found or not approved', 404));
    }

    // Verify patient profile exists
    const patientProfile = await PatientProfile.findOne({ user: req.user.id });
    if (!patientProfile) {
      return next(new AppError('Please complete your patient profile first', 400));
    }

    // Verify availability slot exists and is available
    const slot = await AvailabilitySlot.findById(availabilitySlot);
    if (!slot) {
      return next(new AppError('Availability slot not found', 404));
    }

    // Find the specific time slot and check if it's available
    const timeSlot = slot.slots.find(
      s => s.startTime === appointmentTime.startTime && s.endTime === appointmentTime.endTime
    );

    if (!timeSlot) {
      return next(new AppError('Time slot not found', 404));
    }

    if (timeSlot.isBooked) {
      return next(new AppError('This time slot is already booked', 400));
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      patientProfile: patientProfile._id,
      doctor,
      doctorProfile: doctorProfile._id,
      availabilitySlot,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reasonForVisit,
      symptoms,
      status: 'pending',
      isPaid: false
    });

    // Mark the slot as booked
    timeSlot.isBooked = true;
    timeSlot.appointment = appointment._id;
    await slot.save();

    // Populate appointment data
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'firstName lastName email phoneNumber')
      .populate('doctorProfile', 'specialization consultationFee');

    res.status(201).json({
      status: 'success',
      data: { appointment: populatedAppointment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor availability
// @route   GET /api/appointments/availability/:doctorId
// @access  Private
exports.getDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { doctor: doctorId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    } else {
      // Default to future dates
      query.date = { $gte: new Date() };
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

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Patient)
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { availabilitySlot, appointmentDate, appointmentTime } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user.id
    });

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return next(new AppError('Cannot reschedule completed or cancelled appointments', 400));
    }

    // Release old slot
    const oldSlot = await AvailabilitySlot.findById(appointment.availabilitySlot);
    if (oldSlot) {
      const oldTimeSlot = oldSlot.slots.find(
        s => s.startTime === appointment.appointmentTime.startTime
      );
      if (oldTimeSlot) {
        oldTimeSlot.isBooked = false;
        oldTimeSlot.appointment = null;
        await oldSlot.save();
      }
    }

    // Book new slot
    const newSlot = await AvailabilitySlot.findById(availabilitySlot);
    if (!newSlot) {
      return next(new AppError('New availability slot not found', 404));
    }

    const newTimeSlot = newSlot.slots.find(
      s => s.startTime === appointmentTime.startTime && s.endTime === appointmentTime.endTime
    );

    if (!newTimeSlot || newTimeSlot.isBooked) {
      return next(new AppError('New time slot not available', 400));
    }

    // Update appointment
    appointment.availabilitySlot = availabilitySlot;
    appointment.appointmentDate = new Date(appointmentDate);
    appointment.appointmentTime = appointmentTime;
    appointment.status = 'rescheduled';
    await appointment.save();

    // Mark new slot as booked
    newTimeSlot.isBooked = true;
    newTimeSlot.appointment = appointment._id;
    await newSlot.save();

    // Send notification
    const patient = await User.findById(req.user.id);
    try {
      await whatsappService.sendAppointmentStatusUpdate(appointment, patient, 'rescheduled');
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

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient/Doctor)
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName phoneNumber');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check authorization
    if (
      appointment.patient._id.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Not authorized to cancel this appointment', 403));
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return next(new AppError('Appointment already cancelled or completed', 400));
    }

    // Release the booked slot
    const slot = await AvailabilitySlot.findById(appointment.availabilitySlot);
    if (slot) {
      const timeSlot = slot.slots.find(
        s => s.startTime === appointment.appointmentTime.startTime
      );
      if (timeSlot) {
        timeSlot.isBooked = false;
        timeSlot.appointment = null;
        await slot.save();
      }
    }

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.id;
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Send notification
    try {
      await whatsappService.sendAppointmentStatusUpdate(
        appointment,
        appointment.patient,
        'cancelled'
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

// @desc    Get appointment details
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('doctor', 'firstName lastName email phoneNumber')
      .populate('patientProfile')
      .populate('doctorProfile')
      .populate('payment');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check authorization
    if (
      appointment.patient._id.toString() !== req.user.id &&
      appointment.doctor._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Not authorized to view this appointment', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};
