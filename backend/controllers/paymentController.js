const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const paypalService = require('../services/paypalService');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

// Check if PayPal credentials are real (not placeholders)
const isPayPalConfigured = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return (
    clientId &&
    clientSecret &&
    !clientId.includes('your_') &&
    !clientSecret.includes('your_')
  );
};

// @desc    Create payment (initiate PayPal payment)
// @route   POST /api/payments/create
// @access  Private (Patient)
exports.createPayment = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    // Get appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'firstName lastName')
      .populate('doctorProfile', 'consultationFee specialization')
      .populate('patient', 'firstName lastName phoneNumber');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Verify patient owns this appointment
    if (appointment.patient._id.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    // Check if already paid
    if (appointment.isPaid) {
      return next(new AppError('Appointment already paid', 400));
    }

    const amount = appointment.doctorProfile.consultationFee;
    const description = `Consultation with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} - ${appointment.doctorProfile.specialization}`;

    // ── DEMO PORTAL MODE: PayPal credentials not configured ──────────────────
    if (!isPayPalConfigured()) {
      // Create a PENDING payment record — will be completed via demo portal
      const pendingPayment = await Payment.create({
        appointment: appointmentId,
        patient: req.user.id,
        doctor: appointment.doctor._id,
        amount,
        currency: 'USD',
        paymentMethod: 'paypal',
        paymentStatus: 'pending',
        transactionId: `DEMO-${Date.now()}`
      });

      return res.status(201).json({
        status: 'success',
        data: {
          demoPortal: true,
          paymentRecordId: pendingPayment._id,
          amount,
          doctorName: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
          specialization: appointment.doctorProfile.specialization,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime
        }
      });
    }
    // ── REAL PAYPAL ───────────────────────────────────────────────────────────

    // Create PayPal payment
    const paymentResult = await paypalService.createPayment(
      appointmentId,
      req.user.id,
      appointment.doctor._id,
      amount,
      description
    );

    res.status(201).json({
      status: 'success',
      data: {
        paymentId: paymentResult.paymentId,
        approvalUrl: paymentResult.approvalUrl,
        paymentRecordId: paymentResult.paymentRecordId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Execute payment (after PayPal approval)
// @route   POST /api/payments/execute
// @access  Private (Patient)
exports.executePayment = async (req, res, next) => {
  try {
    const { paymentId, payerId } = req.body;

    // Execute PayPal payment
    const result = await paypalService.executePayment(paymentId, payerId);

    // Update appointment
    const payment = result.paymentRecord;
    const appointment = await Appointment.findById(payment.appointment)
      .populate('patient', 'firstName lastName phoneNumber')
      .populate('doctor', 'firstName lastName');

    if (appointment) {
      appointment.payment = payment._id;
      appointment.isPaid = true;
      appointment.status = 'confirmed';
      await appointment.save();

      // Send WhatsApp notifications
      try {
        await whatsappService.sendPaymentConfirmation(
          payment,
          appointment.patient,
          appointment
        );
        await whatsappService.sendAppointmentConfirmation(
          appointment,
          appointment.doctor,
          appointment.patient
        );
      } catch (error) {
        console.error('Failed to send WhatsApp notifications:', error);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment: result.paymentRecord,
        appointment
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('appointment')
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName');

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Check authorization
    if (
      payment.patient._id.toString() !== req.user.id &&
      payment.doctor._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Not authorized to view this payment', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
exports.getUserPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    const payments = await Payment.find(query)
      .populate('appointment')
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Payment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: payments.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment status
// @route   GET /api/payments/:id/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Check authorization
    if (
      payment.patient.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    const verificationResult = await paypalService.verifyPayment(payment.paypalPaymentId);

    res.status(200).json({
      status: 'success',
      data: verificationResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
exports.refundPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    if (payment.paymentStatus !== 'completed') {
      return next(new AppError('Can only refund completed payments', 400));
    }

    if (payment.paymentStatus === 'refunded') {
      return next(new AppError('Payment already refunded', 400));
    }

    const refundResult = await paypalService.refundPayment(
      payment.paypalPaymentId,
      payment.amount,
      reason
    );

    res.status(200).json({
      status: 'success',
      data: {
        payment: refundResult.paymentRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete demo payment (used when real PayPal is not configured)
// @route   POST /api/payments/:id/complete-demo
// @access  Private (Patient)
exports.completeDemo = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    if (payment.patient.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (payment.paymentStatus === 'completed') {
      return next(new AppError('Payment already completed', 400));
    }

    // Mark payment as completed
    payment.paymentStatus = 'completed';
    payment.paymentDate = new Date();
    payment.receipt = { receiptNumber: `RCP${Date.now()}` };
    await payment.save();

    // Update appointment
    const appointment = await Appointment.findById(payment.appointment)
      .populate('patient', 'firstName lastName phoneNumber')
      .populate('doctor', 'firstName lastName')
      .populate('doctorProfile', 'specialization consultationFee');

    if (appointment) {
      appointment.payment = payment._id;
      appointment.isPaid = true;
      appointment.status = 'confirmed';
      await appointment.save();

      // Send WhatsApp notifications (demo-aware — won't throw)
      try {
        await whatsappService.sendPaymentConfirmation(
          payment,
          appointment.patient,
          appointment
        );
        await whatsappService.sendAppointmentConfirmation(
          appointment,
          appointment.doctor,
          appointment.patient
        );
      } catch (err) {
        logger.error('WhatsApp notification failed:', err.message);
      }
    }

    res.status(200).json({
      status: 'success',
      data: { payment, appointment }
    });
  } catch (error) {
    next(error);
  }
};
