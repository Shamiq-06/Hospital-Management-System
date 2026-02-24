const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const { validatePatientProfile, validateId, validate } = require('../middleware/validation');

// Protect all routes
router.use(protect);
router.use(authorize('patient'));

router.post('/profile', validatePatientProfile, validate, patientController.createOrUpdateProfile);
router.get('/profile', patientController.getProfile);
router.get('/doctors/search', patientController.searchDoctors);
router.get('/doctors/:id', validateId, validate, patientController.getDoctorDetails);
router.get('/appointments', patientController.getAppointments);
router.get('/appointments/:id', validateId, validate, patientController.getAppointmentById);
router.get('/specializations', patientController.getSpecializations);

module.exports = router;
