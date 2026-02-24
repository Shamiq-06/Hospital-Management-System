const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateId, validate } = require('../middleware/validation');

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', validateId, validate, adminController.getUserById);
router.put('/users/:id/status', validateId, validate, adminController.updateUserStatus);
router.delete('/users/:id', validateId, validate, adminController.deleteUser);

// Doctor management
router.get('/doctors', adminController.getAllDoctors);
router.put('/doctors/:id/approval', validateId, validate, adminController.updateDoctorApproval);

// Patient management
router.get('/patients', adminController.getAllPatients);

// Appointment management
router.get('/appointments', adminController.getAllAppointments);

// Payment management
router.get('/payments', adminController.getAllPayments);

// Statistics and analytics
router.get('/statistics', adminController.getSystemStatistics);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
