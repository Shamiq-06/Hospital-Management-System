const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: users.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    let profile = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      status: 'success',
      data: { user, profile }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Delete user profile
    if (user.role === 'patient') {
      await PatientProfile.findOneAndDelete({ user: user._id });
    } else if (user.role === 'doctor') {
      await DoctorProfile.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private (Admin)
exports.getAllDoctors = async (req, res, next) => {
  try {
    const { isApproved, specialization, page = 1, limit = 20 } = req.query;

    let query = {};
    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }
    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await DoctorProfile.find(query)
      .populate('user', 'firstName lastName email phoneNumber isActive')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await DoctorProfile.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: doctors.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { doctors }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/reject doctor
// @route   PUT /api/admin/doctors/:id/approval
// @access  Private (Admin)
exports.updateDoctorApproval = async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    const doctor = await DoctorProfile.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    ).populate('user');

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

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private (Admin)
exports.getAllPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const patients = await PatientProfile.find()
      .populate('user', 'firstName lastName email phoneNumber isActive')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await PatientProfile.countDocuments();

    res.status(200).json({
      status: 'success',
      results: patients.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { patients }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin)
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;

    let query = {};
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
      .populate('doctor', 'firstName lastName email phoneNumber')
      .populate('doctorProfile', 'specialization')
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

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) {
      query.paymentStatus = status;
    }

    const payments = await Payment.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .populate('appointment')
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

// @desc    Get system statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin)
exports.getSystemStatistics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const approvedDoctors = await DoctorProfile.countDocuments({ isApproved: true });
    const pendingDoctors = await DoctorProfile.countDocuments({ isApproved: false });

    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ paymentStatus: 'completed' });
    const pendingPayments = await Payment.countDocuments({ paymentStatus: 'pending' });

    // Calculate total revenue
    const revenueData = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors
        },
        doctors: {
          approved: approvedDoctors,
          pending: pendingDoctors
        },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          pending: pendingPayments,
          totalRevenue: totalRevenue
        },
        recentAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
    }

    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: { createdAt: dateQuery } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Appointments by specialization
    const appointmentsBySpecialization = await Appointment.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: { createdAt: dateQuery } }] : []),
      {
        $lookup: {
          from: 'doctorprofiles',
          localField: 'doctorProfile',
          foreignField: '_id',
          as: 'doctorProfile'
        }
      },
      { $unwind: '$doctorProfile' },
      { $group: { _id: '$doctorProfile.specialization', count: { $sum: 1 } } }
    ]);

    // Revenue by month
    const revenueByMonth = await Payment.aggregate([
      { $match: { paymentStatus: 'completed', ...(Object.keys(dateQuery).length > 0 ? { paymentDate: dateQuery } : {}) } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        appointmentsByStatus,
        appointmentsBySpecialization,
        revenueByMonth
      }
    });
  } catch (error) {
    next(error);
  }
};
